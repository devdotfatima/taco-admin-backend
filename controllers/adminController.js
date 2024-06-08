const { auth, admin } = require("../firebaseAdmin");

const setAdminRole = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { admin: true });
    res
      .status(200)
      .json({ message: `Success! ${email} has been made an admin.` });
  } catch (error) {
    console.error("Error setting custom claims:", error);
    res
      .status(500)
      .json({ message: "Error setting custom claims", error: error.message });
  }
};

module.exports = { setAdminRole };
