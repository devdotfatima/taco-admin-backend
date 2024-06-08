const express = require("express");
const router = express.Router();
const addonsController = require("../controllers/addonsController");

router.post("/", addonsController.addAddon);
router.get("/:truckId", addonsController.getAddonsByTruckId);
router.put("/", addonsController.updateAddon);
router.delete("/:addonId", addonsController.removeAddon);

module.exports = router;
