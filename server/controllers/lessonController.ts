import dotenv from 'dotenv';
import { sql, poolPromise } from "../config/database";
import e, { Request, Response } from 'express';

dotenv.config();

/**
 * Interface representing a Lesson in the database
 */
interface Lesson {
    LessonID: number;      // Unique identifier for the lesson
    CourseID: number;      // Reference to parent course
    Title: string;         // Lesson title
    Content: string;       // Lesson content/material
    Order: number;         // Lesson sequence in course
    Duration: number;      // Expected completion time
    IsActive: boolean;     // Lesson availability status
}

/**
 * Interface representing a Lesson Question
 */
interface LessonQuestion {
    QuestionID: number;    // Unique identifier for the question
    LessonID: number;      // Reference to parent lesson
    QuestionText: string;  // The actual question
    QuestionType: string;  // Type of question (e.g., multiple choice, true/false)
    Points: number;        // Points awarded for correct answer
}

/**
 * Retrieves all lessons for a specific course
 * 
 * @route GET /api/lessons/course/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with array of lessons
 * @throws {500} If database error occurs
 */
export async function getLesson(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Fetching lessons for course ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Query lessons with parameterized query for security
        const result = await pool.request()
            .input('CourseId', Number(courseId))
            .query('SELECT * FROM Lesson WHERE CourseID = @CourseId');
        res.status(200).json({
            message: 'Courses fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Error in getLesson:', err);
        res.status(500).json({
            message: 'Error fetching courses',
            error: err.message
        });
        return;
    }
}

/**
 * Retrieves lesson content including questions for a specific course
 * 
 * @route GET /api/lessons/content/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson content and questions
 * @throws {500} If database error occurs
 */
export async function getLessonContent(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    try {
        const pool = await poolPromise;
        // Complex query joining lessons and questions
        const result = await pool.request()
            .input('CourseId', Number(id))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);
        res.status(200).json({
            message: 'Lesson content fetched successfully',
            data: result.recordset
        });
        return;
    } catch (err: any) {
        console.error('Error in getLessonContent:', err);
        res.status(500).json({
            message: 'Error fetching lesson content',
            error: err.message
        });
        return;
    }
}

/**
 * Retrieves all questions for a specific lesson
 * 
 * @route GET /api/lessons/questions/:id
 * @access Public
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson questions
 * @throws {500} If database error occurs
 */
export async function getQuestions(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Fetching questions for lesson ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Query questions for specific lesson
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                SELECT * FROM LessonQuestion 
                WHERE LessonID IN (
                    SELECT l.LessonID 
                    FROM Course c 
                    JOIN Lesson l ON c.CourseID = l.CourseID 
                    WHERE l.CourseID = @CourseId
                )`);

        res.status(200).json({
            message: 'Lesson questions fetched successfully',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Error in getQuestions:', err);
        res.status(500).json({
            message: 'Error fetching lesson questions',
            error: err.message
        });
    }
}

/**
 * Retrieves all answers for questions in a specific course
 * 
 * @route GET /api/lessons/answers/:id
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson answers
 * @throws {500} If database error occurs
 */
export async function getAnswers(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(`Fetching answers for question ID: ${id}`);

    try {
        const pool = await poolPromise;
        // Complex query to get answers for all questions in a course
        const result = await pool.request()
            .input('CourseID', id)
            .query(`
            SELECT * 
            FROM LessonAnswer 
            WHERE QuestionID IN (
                SELECT lq.QuestionID 
                FROM Lesson l
                JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                WHERE l.CourseID = @CourseID
            );`);

        res.status(200).json({
            message: 'Lesson answers fetched successfully',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Error in getAnswers:', err);
        res.status(500).json({
            message: 'Error fetching lesson answers',
            error: err.message
        });
    }
}

/**
 * Retrieves all lessons for a specific course, including questions and answers
 * 
 * @route GET /api/lessons/course/:id/details
 * @access Public
 * @param {Request} req - Express request object with course ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lessons, questions, and answers
 * @throws {500} If database error occurs
 */
export async function getLessonDetails(req: Request, res: Response): Promise<void> {
    const courseId = req.params.id;
    console.log(`Fetching lesson details for course ID: ${courseId}`);

    try {
        const pool = await poolPromise;
        // Complex query to get lessons with questions and answers
        const result = await pool.request()
            .input('CourseID', Number(courseId))
            .query(`
                SELECT l.LessonID, l.Title, l.Content, l.Order, l.Duration, l.IsActive,
                       lq.QuestionID, lq.QuestionText, lq.QuestionType, lq.Points,
                       la.AnswerID, la.AnswerText
                FROM Lesson l
                LEFT JOIN LessonQuestion lq ON l.LessonID = lq.LessonID
                LEFT JOIN LessonAnswer la ON lq.QuestionID = la.QuestionID
                WHERE l.CourseID = @CourseID
            `);

        res.status(200).json({
            message: 'Lesson details fetched successfully',
            data: result.recordset
        });
    } catch (err: any) {
        console.error('Error in getLessonDetails:', err);
        res.status(500).json({
            message: 'Error fetching lesson details',
            error: err.message
        });
    }
}

/**
 * Retrieves a specific lesson by its ID
 * 
 * @route GET /api/lessons/:id
 * @access Public
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with lesson details
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function getLessonById(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Fetching lesson with ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Query specific lesson with parameterized query for security
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query('SELECT * FROM Lesson WHERE LessonID = @LessonID');

        // Check if lesson exists
        if (result.recordset.length === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson fetched successfully',
            data: result.recordset[0]
        });
    } catch (err: any) {
        console.error('Error in getLessonById:', err);
        res.status(500).json({
            message: 'Error fetching lesson',
            error: err.message
        });
    }
}

/**
 * Creates a new lesson for a specific course
 * @route POST /api/lessons
 * @access Admin
 * @param {Request} req - Express request object with lesson data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created lesson details
 * @throws {400} If required fields are missing
 * @throws {500} If database error occurs
 * */
export async function createLesson(req: Request, res: Response): Promise<void> {
    const { CourseID, Title, Content, Order, Duration, IsActive } = req.body;

    // Validate required fields
    if (!CourseID || !Title || !Content || Order === undefined || Duration === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Insert new lesson with parameterized query for security
        const result = await pool.request()
            .input('CourseID', Number(CourseID))
            .input('Title', Title)
            .input('Content', Content)
            .input('Order', Number(Order))
            .input('Duration', Number(Duration))
            .input('IsActive', Boolean(IsActive))
            .query(`
                INSERT INTO Lesson (CourseID, Title, Content, [Order], Duration, IsActive)
                VALUES (@CourseID, @Title, @Content, @Order, @Duration, @IsActive);
                SELECT SCOPE_IDENTITY() AS LessonID;
            `);

        const newLessonId = result.recordset[0].LessonID;
        res.status(201).json({
            message: 'Lesson created successfully',
            data: { LessonID: newLessonId }
        });
    } catch (err: any) {
        console.error('Error in createLesson:', err);
        res.status(500).json({
            message: 'Error creating lesson',
            error: err.message
        });
    }
}

/**
 * Updates an existing lesson by its ID
 * 
 * @route PUT /api/lessons/:id
 * @access Admin
 * @param {Request} req - Express request object with lesson ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated lesson details
 * @throws {400} If required fields are missing
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function updateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    const { CourseID, Title, Content, Order, Duration, IsActive } = req.body;

    // Validate required fields
    if (!CourseID || !Title || !Content || Order === undefined || Duration === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Update lesson with parameterized query for security
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .input('CourseID', Number(CourseID))
            .input('Title', Title)
            .input('Content', Content)
            .input('Order', Number(Order))
            .input('Duration', Number(Duration))
            .input('IsActive', Boolean(IsActive))
            .query(`
                UPDATE Lesson 
                SET CourseID = @CourseID, Title = @Title, Content = @Content, 
                    [Order] = @Order, Duration = @Duration, IsActive = @IsActive
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson updated successfully',
            data: { LessonID: lessonId }
        });
    } catch (err: any) {
        console.error('Error in updateLesson:', err);
        res.status(500).json({
            message: 'Error updating lesson',
            error: err.message
        });
    }
}

/**
 * Deletes a lesson by its ID
 * 
 * @route DELETE /api/lessons/:id
 * @access Admin
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function deleteLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Deleting lesson with ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Delete lesson with parameterized query for security
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query('DELETE FROM Lesson WHERE LessonID = @LessonID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson deleted successfully'
        });
    } catch (err: any) {
        console.error('Error in deleteLesson:', err);
        res.status(500).json({
            message: 'Error deleting lesson',
            error: err.message
        });
    }
}


/**
 * Updates the content of a lesson by its ID
 * 
 * @route PUT /api/lessons/content/:id
 * @access Admin
 * @param {Request} req - Express request object with lesson ID in params and updated content in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated lesson content
 * @throws {400} If required fields are missing
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function updateLessonContent(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    const { Content } = req.body;

    // Validate required fields
    if (!Content) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Update lesson content with parameterized query for security
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .input('Content', Content)
            .query(`
                UPDATE Lesson 
                SET Content = @Content
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson content updated successfully',
            data: { LessonID: lessonId }
        });
    } catch (err: any) {
        console.error('Error in updateLessonContent:', err);
        res.status(500).json({
            message: 'Error updating lesson content',
            error: err.message
        });
    }
}

// create lesson question
/** * Creates a new question for a specific lesson
 * @route POST /api/lessons/questions
 * @access Admin
 * @param {Request} req - Express request object with question data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created question details
 * @throws {400} If required fields are missing
 * @throws {500} If database error occurs
 * */
export async function createLessonQuestion(req: Request, res: Response): Promise<void> {
    const { LessonID, QuestionText, QuestionType, Points } = req.body;

    // Validate required fields
    if (!LessonID || !QuestionText || !QuestionType || Points === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Insert new question with parameterized query for security
        const result = await pool.request()
            .input('LessonID', Number(LessonID))
            .input('QuestionText', QuestionText)
            .input('QuestionType', QuestionType)
            .input('Points', Number(Points))
            .query(`
                INSERT INTO LessonQuestion (LessonID, QuestionText, QuestionType, Points)
                VALUES (@LessonID, @QuestionText, @QuestionType, @Points);
                SELECT SCOPE_IDENTITY() AS QuestionID;
            `);

        const newQuestionId = result.recordset[0].QuestionID;
        res.status(201).json({
            message: 'Lesson question created successfully',
            data: { QuestionID: newQuestionId }
        });
    } catch (err: any) {
        console.error('Error in createLessonQuestion:', err);
        res.status(500).json({
            message: 'Error creating lesson question',
            error: err.message
        });
    }
}

/**
 * Updates an existing lesson question by its ID
 * 
 * @route PUT /api/lessons/questions/:id
 * @access Admin
 * @param {Request} req - Express request object with question ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated question details
 * @throws {400} If required fields are missing
 * @throws {404} If question is not found
 * @throws {500} If database error occurs
 */
export async function updateLessonQuestion(req: Request, res: Response): Promise<void> {
    const questionId = req.params.id;
    const { LessonID, QuestionText, QuestionType, Points } = req.body;

    // Validate required fields
    if (!LessonID || !QuestionText || !QuestionType || Points === undefined) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Update question with parameterized query for security
        const result = await pool.request()
            .input('QuestionID', Number(questionId))
            .input('LessonID', Number(LessonID))
            .input('QuestionText', QuestionText)
            .input('QuestionType', QuestionType)
            .input('Points', Number(Points))
            .query(`
                UPDATE LessonQuestion 
                SET LessonID = @LessonID, QuestionText = @QuestionText, 
                    QuestionType = @QuestionType, Points = @Points
                WHERE QuestionID = @QuestionID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson question not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson question updated successfully',
            data: { QuestionID: questionId }
        });
    } catch (err: any) {
        console.error('Error in updateLessonQuestion:', err);
        res.status(500).json({
            message: 'Error updating lesson question',
            error: err.message
        });
    }
}

/**
 * Deletes a lesson question by its ID
 * 
 * @route DELETE /api/lessons/questions/:id
 * @access Admin
 * @param {Request} req - Express request object with question ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 * @throws {404} If question is not found
 * @throws {500} If database error occurs
 */
export async function deleteLessonQuestion(req: Request, res: Response): Promise<void> {
    const questionId = req.params.id;
    console.log(`Deleting lesson question with ID: ${questionId}`);

    try {
        const pool = await poolPromise;
        // Delete question with parameterized query for security
        const result = await pool.request()
            .input('QuestionID', Number(questionId))
            .query('DELETE FROM LessonQuestion WHERE QuestionID = @QuestionID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson question not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson question deleted successfully'
        });
    } catch (err: any) {
        console.error('Error in deleteLessonQuestion:', err);
        res.status(500).json({
            message: 'Error deleting lesson question',
            error: err.message
        });
    }
}

//create lesson answer
/**Creates a new answer for a specific lesson question   
 * @route POST /api/lessons/answers
 * @access Admin
 * @param {Request} req - Express request object with answer data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with created answer details
 * @throws {400} If required fields are missing
 * @throws {500} If database error occurs
 * */
export async function createLessonAnswer(req: Request, res: Response): Promise<void> {
    const { QuestionID, AnswerText } = req.body;

    // Validate required fields
    if (!QuestionID || !AnswerText) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Insert new answer with parameterized query for security
        const result = await pool.request()
            .input('QuestionID', Number(QuestionID))
            .input('AnswerText', AnswerText)
            .query(`
                INSERT INTO LessonAnswer (QuestionID, AnswerText)
                VALUES (@QuestionID, @AnswerText);
                SELECT SCOPE_IDENTITY() AS AnswerID;
            `);

        const newAnswerId = result.recordset[0].AnswerID;
        res.status(201).json({
            message: 'Lesson answer created successfully',
            data: { AnswerID: newAnswerId }
        });
    } catch (err: any) {
        console.error('Error in createLessonAnswer:', err);
        res.status(500).json({
            message: 'Error creating lesson answer',
            error: err.message
        });
    }
}

/**
 * Updates an existing lesson answer by its ID
 * 
 * @route PUT /api/lessons/answers/:id
 * @access Admin
 * @param {Request} req - Express request object with answer ID in params and updated data in body
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response with updated answer details
 * @throws {400} If required fields are missing
 * @throws {404} If answer is not found
 * @throws {500} If database error occurs
 */
export async function updateLessonAnswer(req: Request, res: Response): Promise<void> {
    const answerId = req.params.id;
    const { QuestionID, AnswerText } = req.body;

    // Validate required fields
    if (!QuestionID || !AnswerText) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const pool = await poolPromise;
        // Update answer with parameterized query for security
        const result = await pool.request()
            .input('AnswerID', Number(answerId))
            .input('QuestionID', Number(QuestionID))
            .input('AnswerText', AnswerText)
            .query(`
                UPDATE LessonAnswer 
                SET QuestionID = @QuestionID, AnswerText = @AnswerText
                WHERE AnswerID = @AnswerID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson answer not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson answer updated successfully',
            data: { AnswerID: answerId }
        });
    } catch (err: any) {
        console.error('Error in updateLessonAnswer:', err);
        res.status(500).json({
            message: 'Error updating lesson answer',
            error: err.message
        });
    }
}

/**
 * Deletes a lesson answer by its ID
 * 
 * @route DELETE /api/lessons/answers/:id
 * @access Admin
 * @param {Request} req - Express request object with answer ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deletion
 * @throws {404} If answer is not found
 * @throws {500} If database error occurs
 */
export async function deleteLessonAnswer(req: Request, res: Response): Promise<void> {
    const answerId = req.params.id;
    console.log(`Deleting lesson answer with ID: ${answerId}`);

    try {
        const pool = await poolPromise;
        // Delete answer with parameterized query for security
        const result = await pool.request()
            .input('AnswerID', Number(answerId))
            .query('DELETE FROM LessonAnswer WHERE AnswerID = @AnswerID');

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson answer not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson answer deleted successfully'
        });
    } catch (err: any) {
        console.error('Error in deleteLessonAnswer:', err);
        res.status(500).json({
            message: 'Error deleting lesson answer',
            error: err.message
        });
    }
}

/**
 * Deactivates a lesson by its ID
 * 
 * @route PUT /api/lessons/deactivate/:id
 * @access Admin
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming deactivation
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function deactivateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Deactivating lesson with ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Update lesson to set IsActive to false
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                UPDATE Lesson 
                SET IsActive = 0
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson deactivated successfully'
        });
    } catch (err: any) {
        console.error('Error in deactivateLesson:', err);
        res.status(500).json({
            message: 'Error deactivating lesson',
            error: err.message
        });
    }
}

/**
 * Activates a lesson by its ID
 * 
 * @route PUT /api/lessons/activate/:id
 * @access Admin
 * @param {Request} req - Express request object with lesson ID in params
 * @param {Response} res - Express response object
 * @returns {Promise<void>} JSON response confirming activation
 * @throws {404} If lesson is not found
 * @throws {500} If database error occurs
 */
export async function activateLesson(req: Request, res: Response): Promise<void> {
    const lessonId = req.params.id;
    console.log(`Activating lesson with ID: ${lessonId}`);

    try {
        const pool = await poolPromise;
        // Update lesson to set IsActive to true
        const result = await pool.request()
            .input('LessonID', Number(lessonId))
            .query(`
                UPDATE Lesson 
                SET IsActive = 1
                WHERE LessonID = @LessonID;
            `);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: "Lesson not found" });
            return;
        }

        res.status(200).json({
            message: 'Lesson activated successfully'
        });
    } catch (err: any) {
        console.error('Error in activateLesson:', err);
        res.status(500).json({
            message: 'Error activating lesson',
            error: err.message
        });
    }
}