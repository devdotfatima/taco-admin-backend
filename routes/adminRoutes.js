const express = require("express");
const { setAdminRole } = require("../controllers/adminController");

const router = express.Router();

router.post("/setAdmin", setAdminRole);

module.exports = router;
