const { db, admin } = require("../firebaseAdmin");
const { COLLECTIONS } = require("../utils/conts");

// Delete extras in batch by truck ID
const deleteExtrasInBatch = async (truckId) => {
  try {
    const batch = db.batch();
    const extrasRef = db.collection(COLLECTIONS.FOOD_EXTRAS);
    const q = extrasRef.where("truckId", "==", truckId);
    const dbResults = await q.get();

    dbResults.forEach((doc) => {
      batch.delete(doc.ref);
    });
    console.log("deleting extra in batch");

    await batch.commit();
    // res.status(200).send("Extras deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting extras in batch: ", error);
    // res.status(500).send("Error deleting extras in batch");
    throw error;
  }
};

// Get truck extras by truck ID
const getTruckExtras = async (req, res) => {
  const { truckId } = req.params;

  try {
    const extrasRef = db.collection(COLLECTIONS.FOOD_EXTRAS);
    const q = extrasRef.where("truckId", "==", truckId);
    const dbResults = await q.get();

    let truckExtrasData = [];
    dbResults.forEach((doc) => {
      truckExtrasData.push(doc.data());
    });

    res.status(200).json(truckExtrasData);
  } catch (error) {
    console.error("Error fetching truck extras data: ", error);
    res.status(500).send("Error fetching truck extras data");
  }
};

// Add extra item to truck
const addExtrasItemInTruck = async (req, res) => {
  const { extraFoodName, extraFoodPrice, available, truckId } = req.body;

  try {
    const truckExtrasRef = db.collection(COLLECTIONS.FOOD_EXTRAS).doc();
    await truckExtrasRef.set({
      extraFoodName,
      extraFoodPrice,
      available,
      truckId,
      docId: truckExtrasRef.id,
      date: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ docId: truckExtrasRef.id });
  } catch (error) {
    console.error("Error adding extras: ", error);
    res.status(500).send("Error adding extras");
  }
};

// Update extra item in truck
const updateExtrasItemInTruck = async (req, res) => {
  const { extraFoodName, extraFoodPrice, available, docId } = req.body;

  try {
    const truckExtrasRef = db.collection(COLLECTIONS.FOOD_EXTRAS).doc(docId);
    await truckExtrasRef.update({
      extraFoodName,
      extraFoodPrice,
      available,
      date: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send("Extras updated successfully");
  } catch (error) {
    console.error("Error updating extras: ", error);
    res.status(500).send("Error updating extras");
  }
};

// Remove extra item from truck by extra ID
const removeExtraFromTruck = async (req, res) => {
  const { extraId } = req.params;

  try {
    const extraRef = db.collection(COLLECTIONS.FOOD_EXTRAS).doc(extraId);
    await extraRef.delete();
    res.status(200).send("Extra item deleted successfully");
  } catch (error) {
    console.error("Error deleting extra item: ", error);
    res.status(500).send("Error deleting extra item");
  }
};

module.exports = {
  deleteExtrasInBatch,
  getTruckExtras,
  addExtrasItemInTruck,
  updateExtrasItemInTruck,
  removeExtraFromTruck,
};
