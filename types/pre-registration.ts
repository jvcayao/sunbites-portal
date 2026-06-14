export interface Branch {
  id: number;
  name: string;
}

export interface PreRegistrationContact {
  full_name: string;
  relationship: string;
  phone: string;
  address: string;
  email?: string;
  is_primary: boolean;
}

export interface PreRegistrationPayload {
  branch_id: number;
  first_name: string;
  last_name: string;
  student_number?: string;
  grade_level: string;
  section?: string;
  birthday: string;
  enrollment_type: "subscription" | "non_subscription";
  allergies?: string;
  notes?: string;
  subscription_start_month?: string;
  subscription_start_year?: number;
  subscription_end_month?: string;
  subscription_end_year?: number;
  signatory_name: string;
  acknowledged_at: string;
  recaptcha_token: string;
  website?: string; // honeypot — always empty in legitimate submissions
  contacts: PreRegistrationContact[];
}
