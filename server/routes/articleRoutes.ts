import express from 'express';
import * as articleController from '../controllers/articleController';
import authorizeRoles from "../middleware/authenMiddleware";

const router = express.Router();
//Public routes for articles
router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticleById);

//Protected routes for articles
router.post('/',  authorizeRoles(["Staff","Manager","Admin"]), articleController.createArticle);
router.put('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.updateArticle);
router.delete('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.deleteArticle);

export default router;