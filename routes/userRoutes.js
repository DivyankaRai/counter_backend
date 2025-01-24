const express = require("express");
const { getAllUsers, updateClickCount,getUserById } = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.get("/",getAllUsers);
router.get("/:id", getUserById);

module.exports = router;
