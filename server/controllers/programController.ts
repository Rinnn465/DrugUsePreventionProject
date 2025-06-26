import { Request, Response } from 'express';
import { poolPromise } from '../config/database';
//import { Program } from '../types/type';

/**
 * Lấy tất cả các chương trình cộng đồng đang hoạt động
 * Trả về danh sách chương trình được sắp xếp theo ngày mới nhất
 * 
 * @route GET /api/programs
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng chương trình và dữ liệu người dùng
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */
export const getAllPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Kết nối tới pool cơ sở dữ liệu
    console.log("Đang lấy tất cả chương trình từ cơ sở dữ liệu...");
    const pool = await poolPromise;
    // Truy vấn tất cả chương trình đang hoạt động, sắp xếp theo ngày
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE IsDisabled = 0
            ORDER BY Date DESC
        `);
    // Log kết quả truy vấn
    console.log("Đã lấy chương trình:", result.recordset);
    // Trả về chương trình cùng thông tin người dùng nếu có
    res.status(200).json({
      data: result.recordset,
      user: (req as any).user ? { ...((req as any).user).user } : null
    });
  } catch (error) {
    // Xử lý lỗi truy vấn
    console.error("Lỗi khi lấy chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy chương trình" });
  }
};

/**
 * Lấy thông tin một chương trình cụ thể theo ID
 * Chỉ trả về chương trình đang hoạt động (chưa bị vô hiệu hóa)
 * 
 * @route GET /api/programs/:id
 * @access Public
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa chi tiết chương trình và dữ liệu người dùng
 * @throws {404} Nếu không tìm thấy chương trình
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Log ID chương trình cần lấy
    console.log(`Đang lấy chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Truy vấn chương trình cụ thể với tham số hóa để bảo mật
    const result = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    ProgramID,
                    ProgramName,
                    Type,
                    Date,
                    Description,
                    Organizer,
                    Location,
                    ImageUrl,
                    IsDisabled
                FROM CommunityProgram
                WHERE ProgramID = @id AND IsDisabled = 0
            `);

    // Kiểm tra chương trình có tồn tại không
    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Không tìm thấy chương trình" });
      return;
    }

    // Log chương trình lấy được
    console.log("Đã lấy chương trình:", result.recordset[0]);
    res.status(200).json({
      data: result.recordset[0],
      user: (req as any).user ? { ...((req as any).user).user } : null
    });
  } catch (error) {
    // Xử lý lỗi truy vấn
    console.error("Lỗi khi lấy chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy chương trình" });
  }
};

/**
 * Lấy tất cả các chương trình cộng đồng sắp diễn ra
 * Chỉ trả về chương trình có ngày tổ chức trong tương lai, sắp xếp theo ngày
 * 
 * @route GET /api/programs/upcoming
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng chương trình sắp diễn ra
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */
export const getUpcomingPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log truy vấn chương trình sắp diễn ra
    console.log("Đang lấy chương trình sắp diễn ra...");
    const pool = await poolPromise;
    // Truy vấn chương trình trong tương lai sử dụng GETDATE() của SQL Server
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE Date > GETDATE() AND IsDisabled = 0
            ORDER BY Date ASC
        `);
    // Log kết quả truy vấn
    console.log("Đã lấy chương trình sắp diễn ra:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    // Xử lý lỗi truy vấn
    console.error("Lỗi khi lấy chương trình sắp diễn ra:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy chương trình sắp diễn ra" });
  }
}

/**
 * Lấy tất cả các chương trình cộng đồng đã diễn ra
 * Chỉ trả về chương trình có ngày tổ chức trong quá khứ, sắp xếp theo ngày
 * 
 * @route GET /api/programs/past
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng chương trình đã diễn ra
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */
export const getPastPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log truy vấn chương trình đã diễn ra
    console.log("Đang lấy chương trình đã diễn ra...");
    const pool = await poolPromise;
    // Truy vấn chương trình trong quá khứ sử dụng GETDATE() của SQL Server
    const result = await pool.request().query(`
            SELECT 
                ProgramID,
                ProgramName,
                Type,
                Date,
                Description,
                Organizer,
                Location,
                ImageUrl,
                IsDisabled
            FROM CommunityProgram
            WHERE Date < GETDATE() AND IsDisabled = 0
            ORDER BY Date DESC
        `);
    // Log kết quả truy vấn
    console.log("Đã lấy chương trình đã diễn ra:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    // Xử lý lỗi truy vấn
    console.error("Lỗi khi lấy chương trình đã diễn ra:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy chương trình đã diễn ra" });
  }
}

/** 
 * Xóa (vô hiệu hóa) một chương trình cộng đồng theo ID
 * Đánh dấu chương trình là đã vô hiệu hóa thay vì xóa khỏi cơ sở dữ liệu
 * @route DELETE /api/programs/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông báo thành công
 * @throws {404} Nếu không tìm thấy chương trình
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Đang xóa chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Cập nhật trạng thái chương trình thành đã vô hiệu hóa
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE CommunityProgram
                SET IsDisabled = 1
                WHERE ProgramID = @id AND IsDisabled = 0
            `);
    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy chương trình hoặc đã bị vô hiệu hóa" });
      return;
    }

    console.log("Đã xóa chương trình thành công");
    res.status(200).json({ message: "Đã xóa chương trình thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa chương trình" });
  }
}

/**
 * Tạo mới một chương trình cộng đồng
 * 
 * @route POST /api/programs
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu chương trình trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết chương trình vừa tạo
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */
export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ProgramName, Type, Date, Description, Organizer, Location, ImageUrl } = req.body;
    console.log("Đang tạo chương trình mới:", req.body);

    const pool = await poolPromise;
    // Thêm chương trình mới vào cơ sở dữ liệu
    const result = await pool.request()
      .input('ProgramName', ProgramName)
      .input('Type', Type)
      .input('Date', Date)
      .input('Description', Description)
      .input('Organizer', Organizer)
      .input('Location', Location)
      .input('ImageUrl', ImageUrl)
      .query(`
                INSERT INTO CommunityProgram (ProgramName, Type, Date, Description, Organizer, Location, ImageUrl, IsDisabled)
                VALUES (@ProgramName, @Type, @Date, @Description, @Organizer, @Location, @ImageUrl, 0);
                SELECT SCOPE_IDENTITY() AS ProgramID; -- Lấy ID của chương trình vừa tạo
            `);

    const newProgramId = result.recordset[0].ProgramID;
    console.log("Đã tạo chương trình mới với ID:", newProgramId);
    
    // Lấy chi tiết chương trình vừa tạo
    const newProgramResult = await pool.request()
      .input('id', newProgramId)
      .query(`
                SELECT 
                    ProgramID,
                    ProgramName,
                    Type,
                    Date,
                    Description,
                    Organizer,
                    Location,
                    ImageUrl,
                    IsDisabled
                FROM CommunityProgram
                WHERE ProgramID = @id
            `);

    res.status(201).json(newProgramResult.recordset[0]);
  } catch (error) {
    console.error("Lỗi khi tạo chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo chương trình" });
  }
}

/**
 * Cập nhật một chương trình cộng đồng theo ID
 * 
 * @route PUT /api/programs/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết chương trình đã cập nhật
 * @throws {404} Nếu không tìm thấy chương trình
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { ProgramName, Type, Date, Description, Organizer, Location, ImageUrl } = req.body;
    console.log(`Đang cập nhật chương trình với ID: ${id}`, req.body);

    const pool = await poolPromise;
    // Cập nhật thông tin chương trình
    const result = await pool.request()
      .input('id', id)
      .input('ProgramName', ProgramName)
      .input('Type', Type)
      .input('Date', Date)
      .input('Description', Description)
      .input('Organizer', Organizer)
      .input('Location', Location)
      .input('ImageUrl', ImageUrl)
      .query(`
                UPDATE CommunityProgram
                SET 
                    ProgramName = @ProgramName,
                    Type = @Type,
                    Date = @Date,
                    Description = @Description,
                    Organizer = @Organizer,
                    Location = @Location,
                    ImageUrl = @ImageUrl
                WHERE ProgramID = @id AND IsDisabled = 0;
            `);

    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy chương trình hoặc đã bị vô hiệu hóa" });
      return;
    }

    console.log("Đã cập nhật chương trình thành công");

    // Lấy chi tiết chương trình đã cập nhật
    const updatedProgramResult = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    ProgramID,
                    ProgramName,
                    Type,
                    Date,
                    Description,
                    Organizer,
                    Location,
                    ImageUrl,
                    IsDisabled
                FROM CommunityProgram
                WHERE ProgramID = @id
            `);

    res.status(200).json(updatedProgramResult.recordset[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật chương trình" });
  }
}

/**
 * Lấy tất cả danh mục chương trình
 * 
 * @route GET /api/program-categories
 * @access Public
 * @param {Request} req - Đối tượng request của Express
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng danh mục chương trình
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */   
export const getProgramCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Đang lấy tất cả danh mục chương trình...");
    const pool = await poolPromise;
    // Truy vấn tất cả danh mục chương trình
    const result = await pool.request().query(`
            SELECT 
                CategoryID,
                CategoryName,
                Description,
                IsDisabled
            FROM ProgramCategory
            WHERE IsDisabled = 0
            ORDER BY CategoryName ASC
        `);
    console.log("Đã lấy danh mục chương trình:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh mục chương trình" });
  }
}

/**
 * Lấy thông tin một danh mục chương trình theo ID
 * 
 * @route GET /api/program-categories/:id
 * @access Public
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa chi tiết danh mục chương trình
 * @throws {404} Nếu không tìm thấy danh mục
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const getProgramCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Đang lấy danh mục chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Truy vấn danh mục cụ thể với tham số hóa để bảo mật
    const result = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id AND IsDisabled = 0
            `);

    // Kiểm tra danh mục có tồn tại không
    if (result.recordset.length === 0) {
      res.status(404).json({ message: "Không tìm thấy danh mục chương trình" });
      return;
    }

    console.log("Đã lấy danh mục chương trình:", result.recordset[0]);
    res.status(200).json(result.recordset[0]);
  } catch (error) {
    console.error("Lỗi khi lấy danh mục chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh mục chương trình" });
  }
}

/**
 * Tạo mới một danh mục chương trình
 * 
 * @route POST /api/program-categories
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa dữ liệu danh mục trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết danh mục vừa tạo
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */

export const createProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { CategoryName, Description } = req.body;
    console.log("Đang tạo danh mục chương trình mới:", req.body);

    const pool = await poolPromise;
    // Thêm danh mục mới vào cơ sở dữ liệu
    const result = await pool.request()
      .input('CategoryName', CategoryName)
      .input('Description', Description)
      .query(`
                INSERT INTO ProgramCategory (CategoryName, Description, IsDisabled)
                VALUES (@CategoryName, @Description, 0);
                SELECT SCOPE_IDENTITY() AS CategoryID; -- Lấy ID của danh mục vừa tạo
            `);

    const newCategoryId = result.recordset[0].CategoryID;
    console.log("Đã tạo danh mục chương trình mới với ID:", newCategoryId);
    
    // Lấy chi tiết danh mục vừa tạo
    const newCategoryResult = await pool.request()
      .input('id', newCategoryId)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id
            `);

    res.status(201).json(newCategoryResult.recordset[0]);
  } catch (error) {
    console.error("Lỗi khi tạo danh mục chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi tạo danh mục chương trình" });
  }
}


/**
 * Cập nhật một danh mục chương trình theo ID
 * 
 * @route PUT /api/program-categories/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params và dữ liệu cập nhật trong body
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với chi tiết danh mục đã cập nhật
 * @throws {404} Nếu không tìm thấy danh mục
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */

export const updateProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { CategoryName, Description } = req.body;
    console.log(`Đang cập nhật danh mục chương trình với ID: ${id}`, req.body);

    const pool = await poolPromise;
    // Cập nhật thông tin danh mục
    const result = await pool.request()
      .input('id', id)
      .input('CategoryName', CategoryName)
      .input('Description', Description)
      .query(`
                UPDATE ProgramCategory
                SET 
                    CategoryName = @CategoryName,
                    Description = @Description
                WHERE CategoryID = @id AND IsDisabled = 0;
            `);

    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy danh mục chương trình hoặc đã bị vô hiệu hóa" });
      return;
    }

    console.log("Đã cập nhật danh mục chương trình thành công");

    // Lấy chi tiết danh mục đã cập nhật
    const updatedCategoryResult = await pool.request()
      .input('id', id)
      .query(`
                SELECT 
                    CategoryID,
                    CategoryName,
                    Description,
                    IsDisabled
                FROM ProgramCategory
                WHERE CategoryID = @id
            `);

    res.status(200).json(updatedCategoryResult.recordset[0]);
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật danh mục chương trình" });
  }
}

/**
 * Xóa (vô hiệu hóa) một danh mục chương trình theo ID
 * Đánh dấu danh mục là đã vô hiệu hóa thay vì xóa khỏi cơ sở dữ liệu
 * 
 * @route DELETE /api/program-categories/:id
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông báo thành công
 * @throws {404} Nếu không tìm thấy danh mục
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const deleteProgramCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Đang xóa danh mục chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Cập nhật trạng thái danh mục thành đã vô hiệu hóa
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE ProgramCategory
                SET IsDisabled = 1
                WHERE CategoryID = @id AND IsDisabled = 0;
            `);

    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy danh mục chương trình hoặc đã bị vô hiệu hóa" });
      return;
    }

    console.log("Đã xóa danh mục chương trình thành công");
    res.status(200).json({ message: "Đã xóa danh mục chương trình thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa danh mục chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi xóa danh mục chương trình" });
  }
}


/**
 * Lấy tất cả chương trình thuộc một danh mục cụ thể theo ID danh mục
 * 
 * @route GET /api/programs/category/:categoryId
 * @access Public
 * @param {Request} req - Đối tượng request của Express, chứa ID danh mục trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON chứa mảng chương trình thuộc danh mục
 * @throws {500} Nếu xảy ra lỗi cơ sở dữ liệu
 */

export const getProgramsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;
    console.log(`Đang lấy chương trình cho danh mục ID: ${categoryId}...`);

    const pool = await poolPromise;
    // Truy vấn chương trình theo danh mục cụ thể
    const result = await pool.request()
      .input('categoryId', categoryId)
      .query(`
                SELECT 
                    ProgramID,
                    ProgramName,
                    Type,
                    Date,
                    Description,
                    Organizer,
                    Location,
                    ImageUrl,
                    IsDisabled
                FROM CommunityProgram
                WHERE CategoryID = @category
                AND IsDisabled = 0
                ORDER BY Date DESC
            `);
    console.log("Đã lấy chương trình theo danh mục:", result.recordset);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Lỗi khi lấy chương trình theo danh mục:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi lấy chương trình theo danh mục" });
  }
}


/**
 * Vô hiệu hóa một chương trình cộng đồng theo ID
 * Đánh dấu chương trình là đã vô hiệu hóa thay vì xóa khỏi cơ sở dữ liệu
 * 
 * @route PATCH /api/programs/:id/deactivate
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông báo thành công
 * @throws {404} Nếu không tìm thấy chương trình
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const deactivateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Đang vô hiệu hóa chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Cập nhật trạng thái chương trình thành đã vô hiệu hóa
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE CommunityProgram
                SET IsDisabled = 1
                WHERE ProgramID = @id AND IsDisabled = 0;
            `);

    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy chương trình hoặc đã bị vô hiệu hóa" });
      return;
    }

    console.log("Đã vô hiệu hóa chương trình thành công");
    res.status(200).json({ message: "Đã vô hiệu hóa chương trình thành công" });
  } catch (error) {
    console.error("Lỗi khi vô hiệu hóa chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi vô hiệu hóa chương trình" });
  }
}

//activate program
/**
 * Kích hoạt lại một chương trình cộng đồng theo ID
 * Đánh dấu chương trình là đã kích hoạt lại thay vì xóa khỏi cơ sở dữ liệu
 * 
 * @route PATCH /api/programs/:id/activate
 * @access Quản trị viên
 * @param {Request} req - Đối tượng request của Express, chứa ID chương trình trong params
 * @param {Response} res - Đối tượng response của Express
 * @returns {Promise<void>} Phản hồi JSON với thông báo thành công
 * @throws {404} Nếu không tìm thấy chương trình
 * @throws {500} Nếu xảy ra lỗi máy chủ
 */
export const activateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`Đang kích hoạt lại chương trình với ID: ${id}...`);

    const pool = await poolPromise;
    // Cập nhật trạng thái chương trình thành đã kích hoạt lại
    const result = await pool.request()
      .input('id', id)
      .query(`
                UPDATE CommunityProgram
                SET IsDisabled = 0
                WHERE ProgramID = @id AND IsDisabled = 1;
            `);

    // Kiểm tra có dòng nào bị ảnh hưởng không
    if (result.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Không tìm thấy chương trình hoặc đã được kích hoạt" });
      return;
    }

    console.log("Đã kích hoạt lại chương trình thành công");
    res.status(200).json({ message: "Đã kích hoạt lại chương trình thành công" });
  } catch (error) {
    console.error("Lỗi khi kích hoạt lại chương trình:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi kích hoạt lại chương trình" });
  }
}

