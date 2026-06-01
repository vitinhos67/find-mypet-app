export interface SafeZone {
  id: string;
  pet_id: string;
  owner_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpsertSafeZoneInput {
  pet_id: string;
  owner_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
}
