import express from 'express';
import {
    createRating,
    checkRating,
    getsuggestpostscbnf,
} from '../controllers/ratingpost.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post("/create", verifyToken, createRating);
router.get("/checkexist", verifyToken, checkRating);
router.get("/getposts/suggest/cbnf", getsuggestpostscbnf);

export default router;

