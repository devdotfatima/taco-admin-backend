const { db, admin } = require("../firebaseAdmin");

// const { deleteMenuItemsInBatch } = require("./menuItemsController");
// const { deleteAddonsInBatch } = require("./addonsController");
// const { deleteExtrasInBatch } = require("./extrasController");

const { COLLECTIONS } = require("../utils/conts");
const timestamp = admin.firestore.FieldValue.serverTimestamp();

const fetchAndCombineTruckData = async (trucksQuery) => {
  // Fetch trucks data
  const querySnapshot = await trucksQuery.get();
  const trucksData = [];
  querySnapshot.forEach((doc) => {
    trucksData.push({ id: doc.id, ...doc.data() });
  });

  // Extract supervisor IDs
  const supervisorIds = trucksData.map((truck) => truck.truckSupervisorId);

  // Fetch users data based on supervisor IDs
  let usersData = [];
  if (supervisorIds.length > 0) {
    const usersRef = db.collection(COLLECTIONS.USERS);
    const usersSnapshot = await usersRef
      .where(admin.firestore.FieldPath.documentId(), "in", supervisorIds)
      .get();
    usersData = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // Combine trucks and users data based on supervisor ID
  const combinedData = trucksData.map((truck) => {
    const supervisor = usersData.find(
      (user) => user.userId === truck.truckSupervisorId
    );
    return {
      ...truck,
      supervisor,
    };
  });

  return combinedData;
};

const getTrucksByTruckOwner = async (req, res) => {
  const truckOwnerId = req.params.truckOwnerId;
  try {
    const trucksRef = db.collection(COLLECTIONS.TRUCKS);
    const q = trucksRef.where("truckOwnerId", "==", truckOwnerId);
    const combinedData = await fetchAndCombineTruckData(q);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching truck owners data:", error);
    res.status(500).send("Error fetching trucks data");
  }
};

const getTrucks = async (req, res) => {
  try {
    const trucksRef = db
      .collection(COLLECTIONS.TRUCKS)
      .orderBy("truckName", "asc");
    const combinedData = await fetchAndCombineTruckData(trucksRef);
    res.status(200).json(combinedData);
  } catch (error) {
    console.error("Error fetching trucks data:", error);
    res.status(500).send("Error fetching trucks data");
  }
};

const addTruck = async (req, res) => {
  try {
    const { truckName, truckAddress, truckOwnerId, truckSupervisorId } =
      req.body;
    console.log(truckName, truckAddress, truckSupervisorId, "in add truck");

    const trucksRef = db.collection(COLLECTIONS.TRUCKS);
    const newTruckRef = trucksRef.doc();
    const newTruckData = {
      truckName,
      truckAddress,
      truckOwnerId,
      truckSupervisorId: truckSupervisorId ? truckSupervisorId : "",
      truckId: newTruckRef.id,
      date: timestamp,
    };
    await newTruckRef.set(newTruckData);
    res.status(201).json(newTruckRef.id);
  } catch (error) {
    console.error("Error Adding truck data: ", error);
    res.status(500).json("Internal server error.");
  }
};

// Function to update a truck
const updateTruck = async (req, res) => {
  try {
    const { truckName, truckAddress, truckId, truckSupervisorId } = req.body;
    await db
      .collection(COLLECTIONS.TRUCKS)
      .doc(truckId)
      .update({
        truckAddress,
        truckName,
        truckSupervisorId: truckSupervisorId ? truckSupervisorId : "",
        date: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.status(200).json({
      success: true,
      message: "Truck  updated successfully.",
    });
  } catch (error) {
    console.error("Error updating truck: ", error);
    res.status(500).json("Internal server error.");
  }
};

// Function to get truck details by truckId
const getTruckDetails = async (req, res) => {
  const truckId = req.params.truckId;

  try {
    const trucksRef = db.collection(COLLECTIONS.TRUCKS);
    const truckIdQuery = trucksRef.where("truckId", "==", truckId);
    const truckIdSnapshot = await truckIdQuery.get();
    const truckSupervisorIdQuery = trucksRef.where(
      "truckSupervisorId",
      "==",
      truckId
    );
    const truckSupervisorIdSnapshot = await truckSupervisorIdQuery.get();

    const combinedResults = new Map();

    truckIdSnapshot.forEach((doc) => {
      combinedResults.set(doc.id, doc.data());
    });

    truckSupervisorIdSnapshot.forEach((doc) => {
      combinedResults.set(doc.id, doc.data());
    });

    const truckData = Array.from(combinedResults.values());

    if (truckData.length > 0) {
      res.status(200).json(truckData);
    } else {
      res.status(404).json("Truck not found.");
    }
  } catch (error) {
    console.error("Error fetching truck details: ", error);
    res.status(500).json("Internal server error.");
  }
};

// Function to remove a truck and related data
const removeTruck = async (req, res) => {
  const truckId = req.params.truckId;

  try {
    const truckRef = db.collection(COLLECTIONS.TRUCKS).doc(truckId);
    await deleteMenuItemsInBatch(truckId);
    await deleteExtrasInBatch(truckId);
    await deleteAddonsInBatch(truckId);

    await truckRef.delete();
    res.status(200).send("Truck deleted successfully");
  } catch (error) {
    console.error("Error deleting Truck: ", error);
    res.status(500).send("Error deleting truck ");
  }
};

const getTotalNumberOfTrucks = async (req, res) => {
  try {
    const trucksRef = db.collection(COLLECTIONS.TRUCKS);
    const dbResults = await trucksRef.get();
    const totalTrucks = dbResults.size;
    res.status(200).json(totalTrucks);
  } catch (error) {
    console.error("Error fetching total number of trucks: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const removeTrucksInBatch = async (truckOwnerId) => {
//   try {
//     const batch = db.batch();

//     const trucksRef = db.collection(COLLECTIONS.TRUCKS);
//     const q = trucksRef.where("truckOwnerId", "==", truckOwnerId);
//     const querySnapshot = await q.get();

//     querySnapshot.forEach((doc) => {
//       const truckData = doc.data();
//       console.log("deleting truck in batch");

//       // Delete related data using helper functions
//       Promise.all([
//         deleteMenuItemsInBatch(truckData.truckId),
//         deleteExtrasInBatch(truckData.truckId),
//         deleteAddonsInBatch(truckData.truckId),
//       ]);
//       batch.delete(doc.ref);
//     });

//     await batch.commit();
//     return true;
//   } catch (error) {
//     console.error("Error deleting Trucks in batch: ", error);
//     return null;
//   }
// };
module.exports = {
  // removeTrucksInBatch,
  getTrucksByTruckOwner,
  getTrucks,
  addTruck,
  updateTruck,
  getTruckDetails,
  removeTruck,
  getTotalNumberOfTrucks,
};
