export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  speakers?: {
    name: string;
    role: string;
    organization?: string;
  }[];
  category: 'ceremony' | 'keynote' | 'org-talk' | 'industry-talk' | 'conferment' | 'gala' | 'workshop' | 'short-course';
  location?: string;
  badge?: string;
}

export interface DaySchedule {
  day: number;
  date: string;
  title: string;
  mode: 'Face-to-Face' | 'Online';
  venue: string;
  subtitle: string;
  sessions: {
    period: string;
    timeRange: string;
    title: string;
    items: ScheduleItem[];
  }[];
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  organization: string;
  topic?: string;
  category: 'Keynote' | 'Leadership' | 'Industry' | 'Conferment';
  bio: string;
  photoUrl?: string;
}

export interface ShortCourse {
  id: string;
  title: string;
  code: string;
  description: string;
  duration: string;
  competency: string;
  partner: string;
  enrollmentUrl?: string;
}

export interface RegistrationTier {
  id: string;
  name: string;
  subtitle: string;
  priceOman: string;
  pricePhp: string;
  type: 'in-person' | 'online' | 'student';
  badge?: string;
  features: string[];
  recommended?: boolean;
  cpdValue: string;
  redirectUrl?: string;
}

export interface RegistrationSubmission {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  affiliation: string;
  prcLicenseNo?: string;
  tierId: string;
  isHybridBundle: boolean;
  selectedWorkshopTrack?: string;
  selectedShortCourse?: string;
  dietaryRestrictions?: string;
  timestamp: string;
}

export interface CollaboratingOrg {
  id?: string;
  name: string;
  subtitle: string;
  shortName: string;
  role: string;
  accreditations?: string[];
  websiteUrl?: string;
  logo?: string;
  logoUrl?: string;
}
