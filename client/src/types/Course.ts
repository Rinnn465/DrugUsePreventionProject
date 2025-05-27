import { Lesson } from './Lesson';

export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  audience: string;
  duration: string;
  lesson: Lesson[];
  imageUrl: string;
  enrolledCount: number;
  isCertified: boolean;
  risk: string;
}


