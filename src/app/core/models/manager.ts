export interface Manager {
  manager_id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'regional_manager' | 'restaurant_manager' | 'shift_supervisor';
  restaurant_id: string | null;
  city: string | null;
  is_active: boolean;
  password_updated: boolean;
  created_at: string;
  updated_at: string;
}

// features/profile/profile.ts
export interface ProfileData {
  manager_id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'regional_manager' | 'restaurant_manager' | 'shift_supervisor';
  restaurant: string | null;
  city: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}