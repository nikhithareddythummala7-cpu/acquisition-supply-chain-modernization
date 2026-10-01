const express = require('express');
const router = express.Router();
const { getUsers, createUserByAdmin, updateUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorizeRoles('ADMIN'));

router.get('/', getUsers);
router.post('/', createUserByAdmin);
router.patch('/:id', updateUser);

module.exports = router;
