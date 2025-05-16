export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  audience: string;
  duration: string;
  modules: Module[];
  imageUrl: string;
  enrolledCount: number;
  isCertified: boolean;
  risk: string;
}

export interface Module {
  id: number;
  title: string;
  duration: string;
  completed?: boolean;
}