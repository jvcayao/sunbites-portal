export interface AuthParent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profile_photo_path: string | null;
  created_at: string;
}

export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
