const { db, auth, admin } = require("../firebaseAdmin");
const { COLLECTIONS } = require("../utils/conts");

// const { removeTrucksInBatch } = require("./trucksController");
const { deleteMenuItemsInBatch } = require("./menuItemsController");
const { deleteAddonsInBatch } = require("./addonsController");
const { deleteExtrasInBatch } = require("./extrasController");

const createUserInAuthentication = async (email, password) => {
  try {
    const userRecord = await auth.createUser({ email, password: "password" });

    return userRecord.uid;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

const addUser = async (req, res) => {
  const { userEmail, userPassword, truckOwnerId, ...userData } = req.body;
  try {
    const userId = await createUserInAuthentication(userEmail, userPassword);
    if (truckOwnerId) {
      console.log(truckOwnerId);

      await db
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set({
          userId,
          ...userData,
          userEmail,
          truckOwnerId,
          date: admin.firestore.FieldValue.serverTimestamp(),
        });
    } else {
      await db
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set({
          userId,
          ...userData,
          userEmail,
          date: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  const { userRole, truckOwnerId } = req.query;
  try {
    let q = db.collection(COLLECTIONS.USERS).where("userRole", "==", userRole);
    if (truckOwnerId) {
      q = q.where("truckOwnerId", "==", truckOwnerId);
    }
    const querySnapshot = await q.get();
    const users = querySnapshot.docs.map((doc) => doc.data());
    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const removeUser = async (userId) => {
  try {
    await auth.deleteUser(userId);
    await db.collection(COLLECTIONS.USERS).doc(userId).delete();
    return;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

const deleteSupervisorsInBatch = async (truckOwnerId) => {
  try {
    // Query the users with the specified role
    const usersRef = db.collection(COLLECTIONS.USERS);
    const querySnapshot = await usersRef
      .where("truckOwnerId", "==", truckOwnerId)
      .get();

    const batch = db.batch();
    const supervisorIds = [];

    // Add each document to the batch and collect supervisor IDs
    for (const doc of querySnapshot.docs) {
      const user = doc.data();
      const { userId, userEmail } = user;

      supervisorIds.push(userId);

      // Delete the user from Firebase Authentication
      try {
        await auth.deleteUser(userId);
        console.log(`User ${userId} deleted from Firebase Authentication`);
      } catch (authError) {
        throw authError;
      }

      batch.delete(doc.ref);
    }

    // Delete related truck documents based on supervisor IDs
    if (supervisorIds.length > 0) {
      const trucksRef = db.collection(COLLECTIONS.TRUCKS);
      const trucksSnapshot = await trucksRef
        .where("truckSupervisorId", "in", supervisorIds)
        .get();

      trucksSnapshot.forEach((truckDoc) => {
        Promise.all([
          deleteMenuItemsInBatch(truckData.truckId),
          deleteExtrasInBatch(truckData.truckId),
          deleteAddonsInBatch(truckData.truckId),
        ]);
        batch.delete(truckDoc.ref);
      });
    }

    // Commit the batch
    await batch.commit();
    console.log("Successfully deleted supervisors and their trucks.");
  } catch (error) {
    console.error("Error deleting users and trucks in batch:", error);
    throw error;
  }
};

const removeTruckSupervisorUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await removeUser(userId);

    res.status(200).json({
      message: "Truck Supervisor and related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting truck owner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const removeTruckOwnerUser = async (req, res) => {
  const { userId } = req.params;
  const userRole = req.query.userRole;
  try {
    if (userRole === "TruckSupervisor") {
      return removeTruckSupervisorUser(req, res);
    }
    await deleteSupervisorsInBatch(userId);
    await removeUser(userId);

    res
      .status(200)
      .json({ message: "Truck owner and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting truck owner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTotalNumberOfUsersByRole = async (req, res) => {
  const { userRole } = req.params;
  try {
    const querySnapshot = await db
      .collection(COLLECTIONS.USERS)
      .where("userRole", "==", userRole)
      .get();
    return res.status(200).json(querySnapshot.size);
  } catch (error) {
    console.error(
      `Error fetching total number of users for role ${userRole}: `,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const docSnapshot = await userRef.get();
    if (docSnapshot.exists) {
      return res.status(200).json(docSnapshot.data());
    } else {
      return res.status(404).json({ error: "User does not exist" });
    }
  } catch (error) {
    console.error("Error fetching user detail:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const userData = req.body;

  try {
    await db
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .update({
        ...userData,
        date: admin.firestore.FieldValue.serverTimestamp(),
      });
    return res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUserInAuthentication,
  addUser,
  getUsers,
  removeUser,
  removeTruckOwnerUser,
  getTotalNumberOfUsersByRole,
  getUser,
  updateUser,
};
