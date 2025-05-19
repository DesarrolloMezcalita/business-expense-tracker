export interface WAUser {
  id: string;
  name: string;
  phone: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string; // o Date si haces parsing
  updated_at: string; // o Date si haces parsing
}
