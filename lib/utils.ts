import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export const JOB_CATEGORIES = [
  "Academic & Tutoring",
  "Technical & IT",
  "Creative & Design",
  "Content & Writing",
  "Events & Gigs",
  "Local & On-site",
  "Digital Marketing",
  "Data & Research",
  "Quick Tasks",
  "Travel & Guide",
] as const;

export const SKILLS_LIST = [
  "React", "JavaScript", "TypeScript", "Python", "Java", "HTML/CSS",
  "Node.js", "MongoDB", "SQL", "PHP", "WordPress",
  "Photoshop", "Figma", "Canva", "Illustrator", "Premiere Pro",
  "Video Editing", "Photo Editing", "Logo Design", "UI/UX",
  "Content Writing", "Blog Writing", "Copywriting", "Proofreading",
  "SEO", "Social Media", "Instagram Marketing", "YouTube",
  "Data Entry", "Excel", "PowerPoint", "MS Office",
  "Maths", "Physics", "Chemistry", "English", "Hindi",
  "Translation", "Transcription", "Data Labeling",
  "Photography", "Event Management", "Customer Service",
  "Laptop Repair", "WiFi Setup", "Mobile Repair", "Hardware",
  "Local Guide", "Tamil", "Telugu", "Malayalam", "Kannada",
] as const;

export const CITIES = [
  "Chennai", "Bangalore", "Mumbai", "Hyderabad", "Pune",
  "Delhi", "Kolkata", "Coimbatore", "Ahmedabad", "Jaipur",
  "Kochi", "Chandigarh", "Nagpur", "Bhopal", "Remote",
] as const;

export const AVAILABILITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const AVAILABILITY_SLOTS = ["Morning", "Afternoon", "Evening"] as const;
