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
  Specialties: Specialty[];
  Bio: string;
  ImageUrl: string;
  Rating?: number;
  Qualifications?: any[];
  IsDisabled?: boolean;
}

export interface Qualification { QualificationID: number[]; Name: string; ConsultantID: number };
export interface Specialty { SpecialtyID: number; Name: string; ConsultantID: number };

export interface ConsultantWithSchedule extends Consultant {
  ConsultantID: number;
  Name: string;
  Title: string;
  Specialties: any[];
  Bio: string;
  ImageUrl: string;
  Rating: number;
  Qualifications: any[];
  IsDisabled: boolean;
  Schedule: {
    ScheduleID: number;
    Date: string;
    StartTime: string;
    EndTime: string;
  }[];
}