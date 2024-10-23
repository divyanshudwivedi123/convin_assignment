const express = require('express');
const router = express.Router();
const { createUser, loginUser, logoutUser, getUserDetails } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/createUser', createUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/getUserDetails', authMiddleware, getUserDetails);

module.exports = router;
