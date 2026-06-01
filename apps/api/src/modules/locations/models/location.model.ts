export interface DeviceLocationRecord {
  id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  precision: number | null;
  recorded_at: string;
}

export interface CreateLocationInput {
  device_id: string;
  latitude: number;
  longitude: number;
  precision?: number | null;
}
