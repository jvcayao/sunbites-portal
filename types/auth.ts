export interface AuthParent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
