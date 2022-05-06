import { Router } from "express";
import { register, login, updateUser } from "../controllers/authController";
import authenticateUser from '../middleware/authenticateUser';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticateUser, updateUser);

export default router;