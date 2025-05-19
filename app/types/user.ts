export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string; // o Date si haces parsing
  updated_at: string; // o Date si haces parsing
}
