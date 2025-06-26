/**
 * Các route API liên quan đến bài viết.
 * Cung cấp các endpoint để lấy, tạo, cập nhật và xóa bài viết.
 * Bao gồm cả route công khai và route bảo vệ với phân quyền theo vai trò.
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
 * @desc Lấy tất cả bài viết
 * @access Công khai
 */
router.get('/', articleController.getArticles);

/**
 * @route GET /api/articles/:id
 * @desc Lấy bài viết theo ID
 * @access Công khai
 */
router.get('/:id', articleController.getArticleById);

// Protected routes for articles (Staff, Manager, Admin)
/**
 * @route POST /api/articles
 * @desc Tạo bài viết mới
 * @access Nhân viên, Quản lý, Quản trị viên
 */
router.post('/',  authorizeRoles(["Staff","Manager","Admin"]), articleController.createArticle);

/**
 * @route PUT /api/articles/:id
 * @desc Cập nhật bài viết theo ID
 * @access Nhân viên, Quản lý, Quản trị viên
 */
router.put('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.updateArticle);

/**
 * @route DELETE /api/articles/:id
 * @desc Xóa bài viết theo ID
 * @access Nhân viên, Quản lý, Quản trị viên
 */
router.delete('/:id', authorizeRoles(["Staff","Manager","Admin"]), articleController.deleteArticle);

export default router;