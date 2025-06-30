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
  id: string;
  text: string;
  type?: 'checkbox' | 'radio';
  options: AssessmentOption[];
}

export interface AssessmentOption {
  id: string;
  text: string;
  value: number;
}
