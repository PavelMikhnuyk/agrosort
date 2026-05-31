import { Request } from 'express';

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'agronomist' | 'viewer';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface VarietyFilters extends PaginationParams {
  search?: string;
  cultureId?: number;
  category?: string;
  status?: 'active' | 'excluded' | 'pending';
  yearFrom?: number;
  yearTo?: number;
  region?: string;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  detail?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface StatsResponse {
  total: number;
  active: number;
  excluded: number;
  byCategory: Array<{ cultureId: number; category: string; count: number }>;
  topViewed: Array<{ id: number; name: string; viewCount: number }>;
}