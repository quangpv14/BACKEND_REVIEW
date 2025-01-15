import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  test,
  updateUser,
  updatePassword,
  searchUsers,
  updateInfoUser,
  updateRole,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.put('/changepassword/:userId', verifyToken, updatePassword);
router.put('/info/update/:userId', verifyToken, updateInfoUser);
router.put('/update/info/role/:userId', verifyToken, updateRole);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);
router.get('/filterusers/search', searchUsers)

export default router;
