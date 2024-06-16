const express = require("express");
const cors = require("cors");
const usersRoutes = require("./routes/usersRoutes");
const trucksRoutes = require("./routes/trucksRoutes");
const adminRoutes = require("./routes/adminRoutes");
const extrasRoutes = require("./routes/extrasRoutes");
const addonsRoutes = require("./routes/addonsRoutes");
const menuItemRoutes = require("./routes/menuItemsRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();
const port = 3000;

const corsOptions = {
  origin: "https://taco-admin-panel.vercel.app",
  methods: "GET,POST,PUT,DELETE",
};

app.use(cors(corsOptions));
app.use(express.json());

// Add more routes for other operations
app.use("/api/users", usersRoutes);
app.use("/api/trucks", trucksRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/extras", extrasRoutes);
app.use("/api/addons", addonsRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/orders", orderRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
