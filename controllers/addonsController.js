const { admin, db } = require("../firebaseAdmin");
const { COLLECTIONS } = require("../utils/conts");

const timestamp = admin.firestore.FieldValue.serverTimestamp();

const addAddon = async (req, res) => {
  const { addonName, addonPrice, available, truckId } = req.body;
  try {
    const truckAddonsRef = db.collection(COLLECTIONS.FOOD_ADDONS);
    const newAddonRef = truckAddonsRef.doc();
    const newAddonData = {
      addonName,
      addonPrice,
      available,
      truckId,
      docId: newAddonRef.id,
      date: timestamp,
    };
    await newAddonRef.set(newAddonData);
    res.status(201).json(newAddonRef.id);
  } catch (error) {
    console.error("Error Adding addons: ", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const getAddonsByTruckId = async (req, res) => {
  const truckId = req.params.truckId;
  try {
    const addonsRef = db.collection(COLLECTIONS.FOOD_ADDONS);
    const q = addonsRef.where("truckId", "==", truckId);
    const querySnapshot = await q.get();
    const addonsData = [];
    querySnapshot.forEach((doc) => {
      addonsData.push(doc.data());
    });
    res.status(200).json(addonsData);
  } catch (error) {
    console.error("Error fetching truck addons data: ", error);
    res.status(500).json("Internal server error.");
  }
};

const updateAddon = async (req, res) => {
  const { addonName, addonPrice, available, docId } = req.body;
  try {
    const addonRef = db.collection(COLLECTIONS.FOOD_ADDONS).doc(docId);
    await addonRef.update({
      addonName,
      addonPrice,
      available,
      date: timestamp,
    });
    res
      .status(200)
      .json({ success: true, message: "Addon updated successfully." });
  } catch (error) {
    console.error("Error updating addons: ", error);
    res.status(500).json("Internal server error.");
  }
};

const deleteAddonsInBatch = async (truckId) => {
  try {
    const addonsRef = db.collection(COLLECTIONS.FOOD_ADDONS);
    const q = addonsRef.where("truckId", "==", truckId);
    const querySnapshot = await q.get();
    const batch = db.batch();
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log("deleting addons in batch");

    await batch.commit();
    return true;
    // res
    //   .status(200)
    //   .json({ success: true, message: "Addons deleted successfully." });
  } catch (error) {
    console.error("Error deleting addons: ", error);
    throw error;
    // res.status(500).json("Internal server error.");
  }
};

const removeAddon = async (req, res) => {
  const addonId = req.params.addonId;
  try {
    const addonRef = db.collection(COLLECTIONS.FOOD_ADDONS).doc(addonId);
    await addonRef.delete();
    res.status(200).json("Addon deleted successfully.");
  } catch (error) {
    console.error("Error deleting addon: ", error);
    res.status(500).json("Internal server error.");
  }
};

module.exports = {
  addAddon,
  getAddonsByTruckId,
  updateAddon,
  deleteAddonsInBatch,
  removeAddon,
};
