const express = require("express");

const router = express.Router();

const redactionController =
require("../controllers/redaction.controller");

router.get(
"/download/:scanId",
redactionController.generateRedactedFile
);

module.exports = router;