const pool = require("../config/db");

/* -------- GET ALL RULES -------- */

exports.getRules = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * FROM rules ORDER BY id ASC`
    );

    res.json(result.rows);

  } catch (err) {

    console.error("GET RULES ERROR:", err);

    res.status(500).json({ error: "Failed to fetch rules" });
  }
};



/* -------- SEARCH RULE -------- */

exports.searchRules = async (req, res) => {

  try {

    const { query } = req.query;

    const result = await pool.query(
      `SELECT * FROM rules
       WHERE rule_name ILIKE $1`,
      [`%${query}%`]
    );

    res.json(result.rows);

  } catch (err) {

    console.error("SEARCH RULE ERROR:", err);

    res.status(500).json({ error: "Search failed" });
  }
};



/* -------- ADD RULE -------- */

exports.addRule = async (req, res) => {

  try {

    const {
      rule_name,
      description,
      regex_pattern,
      severity,
      category
    } = req.body;

    const result = await pool.query(
      `INSERT INTO rules
       (rule_name, description, regex_pattern, severity, category)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [
        rule_name,
        description,
        regex_pattern,
        severity,
        category
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error("ADD RULE ERROR:", err);

    res.status(500).json({ error: "Failed to add rule" });
  }
};



/* -------- ENABLE / DISABLE RULE -------- */

exports.toggleRule = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE rules
       SET enabled = NOT enabled
       WHERE id=$1
       RETURNING *`,
      [id]
    );

    res.json(result.rows[0]);

  } catch (err) {

    console.error("TOGGLE RULE ERROR:", err);

    res.status(500).json({ error: "Failed to update rule" });
  }
};



/* -------- DELETE RULE -------- */

exports.deleteRule = async (req, res) => {
  try {

    const { id } = req.params;

    await pool.query(
      `UPDATE rules
       SET enabled = false
       WHERE id=$1`,
      [id]
    );

    res.json({
      message: "Rule disabled successfully"
    });

  } catch (err) {

    console.error("DELETE RULE ERROR:", err);

    res.status(500).json({
      error: "Failed to disable rule"
    });
  }
};