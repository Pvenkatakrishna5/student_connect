export interface User {
  id: string;
  email: string;
  name?: string;
  role: "student" | "employer" | "admin";
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  skills: string[];
  city?: string;
  user?: Partial<User>;
}

export interface Employer {
  id: string;
  userId: string;
  companyName: string;
  logo?: string;
  isVerifiedBusiness: boolean;
  city: string;
  rating: number;
  user?: Partial<User>;
}

export interface Job {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  payAmount: number;
  payType: string;
  location: string;
  isRemote: boolean;
  status: "active" | "pending" | "closed";
  employerId: string;
  employer: Employer;
  skillsRequired: string[];
  applicantsCount: number;
  duration: string;
  spotsAvailable: number;
  startDate?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  _id?: string;
  jobId: string;
  studentId: string;
  employerId: string;
  status: "applied" | "shortlisted" | "selected" | "rejected";
  coverNote?: string;
  appliedAt: string;
  job?: Partial<Job>;
  student?: Partial<Student>;
}

export interface Notification {
  id: string;
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "warning" | "error" | "info";
  read: boolean;
  link?: string;
  createdAt: string;
}
