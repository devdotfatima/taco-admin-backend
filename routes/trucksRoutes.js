const express = require("express");
const router = express.Router();
const {
  getTrucksByTruckOwner,
  getTrucks,
  addTruck,
  updateTruck,
  getTruckDetails,
  removeTruck,
  getTotalNumberOfTrucks,
} = require("../controllers/trucksController");

router.get("/owner/:truckOwnerId", getTrucksByTruckOwner);
router.get("/total", getTotalNumberOfTrucks);
router.get("/", getTrucks);

router.post("/", addTruck);
// Route to update a truck
router.put("/:truckId", updateTruck);

// Route to get truck details by truckId
router.get("/:truckId", getTruckDetails);

// Route to remove a truck
router.delete("/:truckId", removeTruck);

module.exports = router;
