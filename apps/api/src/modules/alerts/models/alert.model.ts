export interface Alert {
  id: string;
  pet_id: string;
  owner_id: string;
  type: "OUTSIDE_SAFE_ZONE";
  latitude: number;
  longitude: number;
  triggered_at: string;
  read_at: string | null;
}
