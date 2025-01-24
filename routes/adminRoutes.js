const express = require("express");
const { getUsers, updateUser, deleteUser, toggleUserBlocked } = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

router.get("/users", authenticate, getUsers);
router.put("/users/:id", authenticate, updateUser);
router.delete("/users/:id", authenticate, deleteUser);
router.patch("/users/:id/toggle-blocked", authenticate, toggleUserBlocked);

module.exports = router;
