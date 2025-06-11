export interface Counselor {
  id: number;
  name: string;
  title: string;
  specialties: string[];
  bio: string;
  imageUrl: string;
  rating: number;
  location: string;
  availability: string;
  qualifications: string[];
  languages: string[];
}

export interface Consultant {
  ConsultantID: number;
  Name: string;
  Title: string;
  Specialties: any[];
  Bio: string;
  ImageUrl: string;
  Rating: number;
  Qualifications: any[];
}

export interface Qualification { QualificationID: number[]; Name: string; ConsultantID: number };
export interface Specialty { SpecialtyID: number; Name: string; ConsultantID: number };