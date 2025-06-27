import express from 'express';
import * as articleController from '../controllers/articleController';

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
 * @access Công khai hoặc Quản trị viên
 */
router.post('/', articleController.createArticle);

/**
 * @route PUT /api/articles/:id
 * @desc Cập nhật bài viết theo ID
 * @access Công khai hoặc Quản trị viên
 */
router.put('/:id', articleController.updateArticle);

/**
 * @route DELETE /api/articles/:id
 * @desc Xóa bài viết theo ID
 * @access Công khai hoặc Quản trị viên
 */
router.delete('/:id', articleController.deleteArticle);

export default router;