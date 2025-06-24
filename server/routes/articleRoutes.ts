/**
 * Article-related API routes.
 * Provides endpoints for retrieving, creating, updating, and deleting articles.
 * Includes both public and protected routes with role-based authorization.
 *
 * @module routes/articleRoutes
 */
import express from 'express';
import * as articleController from '../controllers/articleController';
import authorizeRoles from "../middleware/authenMiddleware";

const router = express.Router();

// Public routes for articles
/**
 * @route GET /api/articles
 * @desc Get all articles
 * @access Public
 */
router.get('/', articleController.getArticles);

/**
 * @route GET /api/articles/:id
 * @desc Get article by ID
 * @access Public
 */
router.get('/:id', articleController.getArticleById);

// Protected routes for articles (Staff, Manager, Admin)
/**
 * @route POST /api/articles
 * @desc Create a new article
 * @access Staff, Manager, Admin
 */
router.post('/',  authorizeRoles(["Staff","Manager","Admin"]), articleController.createArticle);

/**
 * @route PUT /api/articles/:id
 * @desc Update an article by ID
 * @access Staff, Manager, Admin
 */
router.put('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.updateArticle);

/**
 * @route DELETE /api/articles/:id
 * @desc Delete an article by ID
 * @access Staff, Manager, Admin
 */
router.delete('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.deleteArticle);

export default router;