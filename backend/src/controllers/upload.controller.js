const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const pool = require("../config/db");

/* ---------------- FILE VALIDATION ---------------- */

const allowedExtensions = [".pdf", ".txt", ".csv", ".xls", ".xlsx"];

const allowedMimeTypes = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

/* ---------------- STORAGE CONFIG ---------------- */

const storage = multer.diskStorage({

  destination: "storage/temp_files",

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  }

});

/* ---------------- FILE FILTER ---------------- */

const fileFilter = (req, file, cb) => {

  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {

    cb(null, true);

  } else {

    cb(new Error("Invalid file type"));

  }

};

/* ---------------- MULTER ---------------- */

const upload = multer({

  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }

});

exports.uploadMiddleware = upload.single("file");

/* ---------------- TEXT SCAN ---------------- */

exports.scanText = async (req, res) => {

  try {

    const { text } = req.body;

    const response = await axios.post(
      "http://localhost:8000/scan-text",
      { text }
    );

    const redactedText = response.data.redactedText || "";
    const rawViolations = response.data.violations || [];

    const violations = normalizeViolations(rawViolations);

    const scanResult = await pool.query(
      `
      INSERT INTO scans (scan_type, redacted_content)
      VALUES ($1,$2)
      RETURNING id
      `,
      ["TEXT", redactedText]
    );

    const scanId = scanResult.rows[0].id;

    await storeViolations(scanId, violations);

    res.json({
      scanId,
      redactedText,
      violations
    });

  } catch (err) {

    console.error("TEXT SCAN ERROR:", err);

    res.status(500).json({
      error: "Text scan failed"
    });

  }

};

/* ---------------- FILE SCAN ---------------- */

exports.scanFile = async (req, res) => {

  try {

    if (!req.file) {

      return res.status(400).json({
        error: "No file uploaded"
      });

    }

    console.log("FILE RECEIVED:", req.file.originalname);

    const filePath = req.file.path;

    const formData = new FormData();

    formData.append(
      "file",
      fs.createReadStream(filePath),
      req.file.originalname
    );

    const response = await axios.post(
      "http://localhost:8001/scan-file",
      formData,
      { headers: formData.getHeaders() }
    );

    const redactedText = response.data.redactedText || "";
    const rawViolations = response.data.violations || [];

    const violations = normalizeViolations(rawViolations);

    /* ---------------- SAVE FILE METADATA ---------------- */

    const fileInsert = await pool.query(
      `
      INSERT INTO files
      (user_id, filename, file_type, file_size)
      VALUES ($1,$2,$3,$4)
      RETURNING id
      `,
      [
        1,
        req.file.originalname,
        path.extname(req.file.originalname),
        req.file.size
      ]
    );

    const fileId = fileInsert.rows[0].id;

    /* ---------------- CREATE SCAN ---------------- */

    const scanResult = await pool.query(
      `
      INSERT INTO scans
      (file_id, scan_type, redacted_content)
      VALUES ($1,$2,$3)
      RETURNING id
      `,
      [
        fileId,
        "FILE",
        redactedText
      ]
    );

    const scanId = scanResult.rows[0].id;

    /* ---------------- STORE VIOLATIONS ---------------- */

    await storeViolations(scanId, violations);

    res.json({
      scanId,
      fileId,
      redactedText,
      violations
    });

  } catch (err) {

    console.error("FILE SCAN ERROR:", err.message);

    res.status(400).json({
      error: err.message
    });

  }

};

/* ---------------- NORMALIZE VIOLATIONS ---------------- */

function normalizeViolations(raw) {

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === "object" && raw !== null) {

    return Object.entries(raw).map(([type, count]) => ({
      type,
      value: `Count: ${count}`
    }));

  }

  return [];

}

/* ---------------- STORE VIOLATIONS ---------------- */

async function storeViolations(scanId, violations) {

  for (const v of violations) {

    const ruleId = v.rule_id || null;
    const violationType = v.type || "";
    const detectedValue = v.value || "";

    await pool.query(
      `
      INSERT INTO violations
      (scan_id, rule_id, violation_type, detected_value)
      VALUES ($1,$2,$3,$4)
      `,
      [
        scanId,
        ruleId,
        violationType,
        detectedValue
      ]
    );

  }

}