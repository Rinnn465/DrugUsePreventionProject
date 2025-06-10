import express from 'express';
import * as articleController from '../controllers/articleController';

const router = express.Router();

router.get('/', articleController.getArticles);

router.get('/:id', articleController.getArticleById);

export default router;