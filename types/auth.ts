export interface AuthParent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profile_photo_url: string | null;
  created_at: string;
  has_subscription_student: boolean;
}

export interface ApiError {
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}
