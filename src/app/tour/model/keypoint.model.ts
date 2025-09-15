export interface KeyPoint {
  id?: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageURL?: string; // opciono
}
