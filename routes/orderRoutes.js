const express = require("express");
const router = express.Router();
const {
  getAllOrdersByTruckOwnerId,
  getTotalOrders,
  getTotalOrdersByTruckOwnerId,
  getTotalOrdersByTruckId,
  getOrder,
  getRevenueByTruckOwnerId,
} = require("../controllers/orderController");

router.get("/truckOwner/:truckOwnerId", getAllOrdersByTruckOwnerId);
router.get("/total", getTotalOrders);

router.get("/truckOwner/total/:truckOwnerId", getTotalOrdersByTruckOwnerId);

router.get("/truckOwner/revenue/:truckOwnerId", getRevenueByTruckOwnerId);

router.get("/truck/total/:truckId", getTotalOrdersByTruckId);

router.get("/:orderId", getOrder);

module.exports = router;
