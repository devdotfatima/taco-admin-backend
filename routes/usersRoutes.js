const express = require("express");

const {
  addUser,
  getUsers,
  removeTruckOwnerUser,
  getTotalNumberOfUsersByRole,
  getUser,
  updateUser,
} = require("../controllers/usersController.js");

const router = express.Router();

router.post("/", addUser);
router.get("/", getUsers);
router.delete("/truckOwner/:userId", removeTruckOwnerUser);
router.get("/total/:userRole", getTotalNumberOfUsersByRole);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);

module.exports = router;
