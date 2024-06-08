const { admin, db } = require("../firebaseAdmin");
const { COLLECTIONS } = require("../utils/conts");

const timestamp = admin.firestore.FieldValue.serverTimestamp();

const addMenuItemInTruck = async (req, res) => {
  const {
    name,
    price,
    description,
    ingredients,
    category,
    truckId,
    basicPackageName,
    basicPackagePrice,
    comboDealPackageName,
    comboDealPackagePrice,
    available,
    foodItemImg,
  } = req.body;
  try {
    const truckFoodMenuRef = db.collection(COLLECTIONS.TRUCK_FOOD_MENU);
    const newMenuItemRef = truckFoodMenuRef.doc();
    const newMenuItemData = {
      categoryType: category,
      docId: newMenuItemRef.id,
      name: name,
      description: description,
      foodItemImg,
      price: price,
      ingredients: ingredients,
      basicPackageName,
      basicPackagePrice,
      comboDealPackageName,
      comboDealPackagePrice,
      truckId: truckId,
      availability: available,
      date: timestamp,
    };
    await newMenuItemRef.set(newMenuItemData);
    res.status(201).json(newMenuItemRef.id);
  } catch (error) {
    console.error("Error Adding truck data: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getTruckMenuItems = async (req, res) => {
  const truckId = req.params.truckId;
  try {
    const trucksRef = db.collection(COLLECTIONS.TRUCK_FOOD_MENU);
    const q = trucksRef.where("truckId", "==", truckId);
    const querySnapshot = await q.get();
    const truckMenuData = [];
    querySnapshot.forEach((doc) => {
      truckMenuData.push(doc.data());
    });
    res.status(200).json(truckMenuData);
  } catch (error) {
    console.error("Error fetching truck owners data: ", error);
    res.status(500).json("Internal server error.");
  }
};

const updateMenuItemInTruck = async (req, res) => {
  const {
    docId,
    name,
    price,
    description,
    ingredients,
    category,
    basicPackageName,
    basicPackagePrice,
    comboDealPackageName,
    comboDealPackagePrice,
    available,
    foodItemImg,
  } = req.body;
  try {
    const truckFoodMenuRef = db
      .collection(COLLECTIONS.TRUCK_FOOD_MENU)
      .doc(docId);
    await truckFoodMenuRef.update({
      name,
      price,
      foodItemImg,
      description,
      ingredients,
      categoryType: category,
      basicPackageName,
      basicPackagePrice,
      comboDealPackageName,
      comboDealPackagePrice,
      availability: available,
      date: timestamp,
    });
    res.status(200).json({
      success: true,
      message: "Truck menu item updated successfully.",
    });
  } catch (error) {
    console.error("Error updating truck data: ", error);
    res.status(500).json("Internal server error.");
  }
};

const deleteMenuItemsInBatch = async (truckId) => {
  try {
    const truckMenuItemRef = db.collection(COLLECTIONS.TRUCK_FOOD_MENU);
    const q = truckMenuItemRef.where("truckId", "==", truckId);
    const querySnapshot = await q.get();
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log("deleting menu in batch");
    await batch.commit();
    return true;
    // res.status(200).json({
    //   success: true,
    //   message: "Truck menu items deleted successfully.",
    // });
  } catch (error) {
    console.error("Error deleting truck menu items: ", error);
    throw error;
    // res.status(500).json("Internal server error.");
  }
};

const deleteMenuItem = async (req, res) => {
  const menuItemId = req.params.menuItemId;
  try {
    const menuItemRef = db
      .collection(COLLECTIONS.TRUCK_FOOD_MENU)
      .doc(menuItemId);
    await menuItemRef.delete();
    res.status(200).json("Menu Item deleted successfully.");
  } catch (error) {
    console.error("Error deleting menu item  data: ", error);
    return null;
  }
};

const getMenuItemDetail = async (req, res) => {
  const menuItemId = req.params.menuItemId;
  try {
    const menuItemRef = db
      .collection(COLLECTIONS.TRUCK_FOOD_MENU)
      .doc(menuItemId);
    const docSnapshot = await menuItemRef.get();
    if (docSnapshot.exists) {
      res.status(200).json(docSnapshot.data());
    } else {
      res.status(404).json("Menu item not found.");
    }
  } catch (error) {
    console.error("Error fetching menu item detail: ", error);
    res.status(500).json("Internal server error.");
  }
};

module.exports = {
  addMenuItemInTruck,
  getTruckMenuItems,
  updateMenuItemInTruck,
  deleteMenuItemsInBatch,
  deleteMenuItem,
  getMenuItemDetail,
};
