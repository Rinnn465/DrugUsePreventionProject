export interface Survey {
  SurveyID: number;
  Description: string;
  SurveyCategoryID?: number | null;
  SurveyCategoryName?: string | null;
  Type: string; // 'before' | 'after'
}