import { Request, Response } from "express";
import { sql, poolPromise } from "../config/database";

// GET ALL Surveys (with SurveyCategoryName)
export async function getAllSurveys(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
            SELECT s.*, c.SurveyCategoryName
            FROM Survey s
            LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
        `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// GET Survey by ID (with SurveyCategoryName)
export async function getSurveyById(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, id).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    const survey = result.recordset[0];
    if (!survey) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.json(survey);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// CREATE Survey
export async function createSurvey(req: Request, res: Response): Promise<void> {
  const { Description, Type, SurveyCategoryID } = req.body;
  try {
    const pool = await poolPromise;
    const insertResult = await pool
      .request()
      .input("Description", sql.NVarChar, Description)
      .input("Type", sql.Bit, Type)
      .input(
        "SurveyCategoryID",
        SurveyCategoryID ? sql.Int : sql.Int,
        SurveyCategoryID || null
      ).query(`
                INSERT INTO Survey (Description, Type, SurveyCategoryID)
                OUTPUT INSERTED.SurveyID
                VALUES (@Description, @Type, @SurveyCategoryID)
            `);
    const newId = insertResult.recordset[0].SurveyID;
    // Return the created survey with category name
    const result = await pool.request().input("id", sql.Int, newId).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// UPDATE Survey
export async function updateSurvey(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { Description, Type, SurveyCategoryID } = req.body;
  try {
    const pool = await poolPromise;
    const updateResult = await pool
      .request()
      .input("id", sql.Int, id)
      .input("Description", sql.NVarChar, Description)
      .input("Type", sql.Bit, Type)
      .input(
        "SurveyCategoryID",
        SurveyCategoryID ? sql.Int : sql.Int,
        SurveyCategoryID || null
      ).query(`
                UPDATE Survey
                SET Description = @Description, Type = @Type, SurveyCategoryID = @SurveyCategoryID
                WHERE SurveyID = @id
            `);
    if (updateResult.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    // Return the updated survey with category name
    const result = await pool.request().input("id", sql.Int, id).query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyID = @id
            `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// DELETE Survey
export async function deleteSurvey(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  try {
    const pool = await poolPromise;
    const deleteResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("DELETE FROM Survey WHERE SurveyID = @id");
    if (deleteResult.rowsAffected[0] === 0) {
      res.status(404).json({ message: "Survey not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

// GET Surveys by CategoryID (with SurveyCategoryName)
export async function getSurveyByCategoryId(
  req: Request,
  res: Response
): Promise<void> {
  const categoryId = Number(req.params.categoryId);
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("categoryId", sql.Int, categoryId)
      .query(`
                SELECT s.*, c.SurveyCategoryName
                FROM Survey s
                LEFT JOIN SurveyCategory c ON s.SurveyCategoryID = c.SurveyCategoryID
                WHERE s.SurveyCategoryID = @categoryId
            `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
