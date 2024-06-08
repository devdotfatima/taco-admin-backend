const express = require("express");
const router = express.Router();
const {
  deleteExtrasInBatch,
  getTruckExtras,
  addExtrasItemInTruck,
  updateExtrasItemInTruck,
  removeExtraFromTruck,
} = require("../controllers/extrasController");

router.get("/:truckId", getTruckExtras);
router.post("/", addExtrasItemInTruck);
router.put("/", updateExtrasItemInTruck);
router.delete("/:extraId", removeExtraFromTruck);

module.exports = router;
