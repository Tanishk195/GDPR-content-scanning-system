const express = require("express");

const router = express.Router();

const violationController =
require("../controllers/violation.controller");

router.patch(
  "/violations/:id/action",
  violationController.updateViolation
);

module.exports = router;