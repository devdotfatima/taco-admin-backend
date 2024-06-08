const express = require("express");
const router = express.Router();
const {
  addMenuItemInTruck,
  getTruckMenuItems,
  updateMenuItemInTruck,
  getMenuItemDetail,
  deleteMenuItem,
} = require("../controllers/menuItemsController");

router.post("/", addMenuItemInTruck);
router.get("/:truckId", getTruckMenuItems);
router.put("/", updateMenuItemInTruck);

router.delete("/:menuItemId", deleteMenuItem);
router.get("/detail/:menuItemId", getMenuItemDetail);

module.exports = router;
