export interface Survey {
  SurveyID: number;
  Description: string;
  Type: boolean;
  SurveyCategoryID?: number | null;
  SurveyCategoryName?: string | null;
  SurveyType: string; // 'before' | 'after'
}