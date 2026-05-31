export interface UserAttributes {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'agronomist' | 'viewer';
  organization?: string;
  region?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VarietyAttributes {
  id: number;
  name: string;
  cultureId: number;
  registrationNumber?: string;
  yearRegistered?: number;
  yearExcluded?: number;
  status: 'active' | 'excluded' | 'pending';
  breeder?: string;
  originCountry?: string;
  yieldMin?: number;
  yieldMax?: number;
  yieldUnit?: string;
  vegetationDays?: number;
  frostResistance?: number;
  droughtResistance?: number;
  diseaseResistance?: number;
  admittedRegions?: string[];
  description?: string;
  characteristics?: Record<string, any>;
  image?: string;
  addedBy?: number;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CultureAttributes {
  id: number;
  name: string;
  nameScientific?: string;
  category: string;
  icon?: string;
  description?: string;
}

export interface FavoriteAttributes {
  id: number;
  userId: number;
  varietyId: number;
  note?: string;
  createdAt?: Date;
}

export interface VarietyHistoryAttributes {
  id: number;
  varietyId: number;
  action: 'create' | 'update' | 'delete';
  changedBy?: number;
  changes?: Record<string, any>;
  previousData?: Record<string, any>;
  createdAt?: Date;
}