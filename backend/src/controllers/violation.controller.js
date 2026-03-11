const pool = require("../config/db");

exports.updateViolation = async (req,res) => {

  try{

    const { id } = req.params;
    const { action } = req.body;

    const result = await pool.query(
      `
      SELECT detected_value
      FROM violations
      WHERE id=$1
      `,
      [id]
    );

    if(result.rows.length === 0){
      return res.status(404).json({error:"Violation not found"});
    }

    const originalValue = result.rows[0].detected_value;

    let newValue = originalValue;

    if(action === "REDACT"){
      newValue = "********";
    }

    else if(action === "MASK"){
      newValue = "******" + originalValue.slice(-4);
    }

    else if(action === "DELETE"){
      newValue = "";
    }

    await pool.query(
      `
      INSERT INTO redactions
      (violation_id,action_type,original_value,redacted_value)
      VALUES ($1,$2,$3,$4)
      `,
      [
        id,
        action,
        originalValue,
        newValue
      ]
    );

    await pool.query(
      `
      UPDATE violations
      SET status='resolved'
      WHERE id=$1
      `,
      [id]
    );

    res.json({
      message:"Violation updated"
    });

  }
  catch(err){

    console.error("VIOLATION ACTION ERROR:",err);

    res.status(500).json({
      error:"Failed to update violation"
    });

  }

};