const { COLLECTIONS } = require("../utils/conts");
const admin = require("firebase-admin");
const db = admin.firestore();

const fetchOrderDetails = async (orderData) => {
  // Fetch customer details
  const customerSnapshot = await db
    .collection(COLLECTIONS.USERS)
    .doc(orderData.orderByCustomerId)
    .get();
  const customerData = customerSnapshot.exists ? customerSnapshot.data() : null;

  // Fetch truck details
  const truckSnapshot = await db
    .collection(COLLECTIONS.TRUCKS)
    .doc(orderData.truckId)
    .get();
  const truckData = truckSnapshot.exists ? truckSnapshot.data() : null;

  return {
    ...orderData,
    customerDetails: customerData,
    truckDetails: truckData,
  };
};

const getAllOrdersByTruckOwnerId = async (req, res) => {
  const { truckOwnerId } = req.params; // Assuming truckOwnerId is passed as a path parameter

  if (!truckOwnerId) {
    return res.status(400).json({ error: "truckOwnerId is required" });
  }

  try {
    const ordersRef = db
      .collection(COLLECTIONS.ORDERS)
      .where("truckOwnerId", "==", truckOwnerId);
    const querySnapshot = await ordersRef.get();
    const orders = [];

    for (const doc of querySnapshot.docs) {
      const orderData = doc.data();
      const detailedOrder = await fetchOrderDetails(orderData);
      orders.push({ id: doc.id, ...detailedOrder });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error(
      `Error fetching orders for truckOwnerId ${truckOwnerId}: `,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getOrder = async (req, res) => {
  const { orderId } = req.params; // Assuming orderId is passed as a path parameter

  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  try {
    const ordersRef = db
      .collection(COLLECTIONS.ORDERS)
      .where("orderId", "==", orderId);
    const querySnapshot = await ordersRef.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orders = [];

    for (const doc of querySnapshot.docs) {
      const orderData = doc.data();
      const detailedOrder = await fetchOrderDetails(orderData);
      orders.push({ id: doc.id, ...detailedOrder });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error(`Error fetching order with orderId ${orderId}: `, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTotalOrders = async (req, res) => {
  try {
    const ordersRef = db.collection(COLLECTIONS.ORDERS);

    const querySnapshot = await ordersRef.get();

    const totalOrders = querySnapshot.size;

    return res.status(200).json(totalOrders);
  } catch (error) {
    console.error(`Error fetching total orders : `, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTotalOrdersByTruckOwnerId = async (req, res) => {
  const { truckOwnerId } = req.params;

  if (!truckOwnerId) {
    return res.status(400).json({ error: "truckOwnerId is required" });
  }

  try {
    const ordersRef = db
      .collection(COLLECTIONS.ORDERS)
      .where("truckOwnerId", "==", truckOwnerId);
    const querySnapshot = await ordersRef.get();

    const totalOrders = querySnapshot.size;

    return res.status(200).json(totalOrders);
  } catch (error) {
    console.error(
      `Error fetching total orders for truckOwnerId ${truckOwnerId}: `,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getTotalOrdersByTruckId = async (req, res) => {
  const { truckId } = req.params; // Assuming truckOwnerId is passed as a path parameter

  if (!truckId) {
    return res.status(400).json({ error: "truckOwnerId is required" });
  }

  try {
    const ordersRef = db
      .collection(COLLECTIONS.ORDERS)
      .where("truckId", "==", truckId);
    const querySnapshot = await ordersRef.get();

    const totalOrders = querySnapshot.size;

    return res.status(200).json(totalOrders);
  } catch (error) {
    console.error(
      `Error fetching total orders for truckId ${truckId}: `,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getRevenueByTruckOwnerId = async (req, res) => {
  const { truckOwnerId } = req.params;

  if (!truckOwnerId) {
    return res.status(400).json({ error: "truckOwnerId is required" });
  }

  try {
    const ordersRef = db
      .collection(COLLECTIONS.ORDERS)
      .where("truckOwnerId", "==", truckOwnerId)
      .where("orderStatus", "==", "Completed"); // Filter only completed orders
    const querySnapshot = await ordersRef.get();

    let totalRevenue = 0;

    for (const doc of querySnapshot.docs) {
      const orderData = doc.data();
      // Assuming orderData contains the price or you have a way to calculate revenue
      totalRevenue += calculateOrderRevenue(orderData);
    }

    return res.status(200).json(totalRevenue);
  } catch (error) {
    console.error(
      `Error fetching total revenue for truckOwnerId ${truckOwnerId}: `,
      error
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Function to calculate revenue from order data
const calculateOrderRevenue = (orderData) => {
  // Example: Assuming orderData contains a 'totalPrice' field
  return orderData.totalOrderedPrice || 0;
};

module.exports = {
  getAllOrdersByTruckOwnerId,
  getTotalOrdersByTruckOwnerId,
  getTotalOrders,
  getTotalOrdersByTruckId,
  getOrder,
  getRevenueByTruckOwnerId,
};
