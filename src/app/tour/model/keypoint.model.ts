export interface KeyPoint {
  id?: string;
  tourId: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  imageURL: string; 
  order: number;
}

export interface KeyPointDialogData {
  tourId: string;
  latitude: number;
  longitude: number;
  keyPoint?: KeyPoint;
  order?: number;
}
