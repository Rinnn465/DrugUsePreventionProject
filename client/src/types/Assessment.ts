export interface Assessment {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  timeToComplete: number;
  audiences: string[];
  color: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: number;
  text: string;
  options: AssessmentOption[];
}

export interface AssessmentOption {
  id: string;
  text: string;
  value: number;
}

export interface AssessmentResult {
  riskLevel: 'Low' | 'Moderate' | 'High';
  score: number;
  summary: string;
  recommendations: string[];
}