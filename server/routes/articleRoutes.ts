import express from 'express';
import * as articleController from '../controllers/articleController';
import authorizeRoles from '../middleware/authenMiddleware';

const router = express.Router();

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

/**
 * @route POST /api/articles
 * @desc Tạo mới bài viết
 * @access Chỉ Admin, Staff
 */
router.post('/', authorizeRoles(['Admin', 'Staff', 'Manager']), articleController.createArticle);

/**
 * @route PUT /api/articles/:id
 * @desc Cập nhật bài viết theo ID
 * @access Chỉ Admin, Staff
 */
router.put('/:id', authorizeRoles(['Admin', 'Staff', 'Manager']), articleController.updateArticle);

/**
 * @route DELETE /api/articles/:id
 * @desc Xóa bài viết theo ID
 * @access Chỉ Admin, Staff
 */
router.delete('/:id', authorizeRoles(['Admin', 'Staff', 'Manager']), articleController.deleteArticle);

export default router;