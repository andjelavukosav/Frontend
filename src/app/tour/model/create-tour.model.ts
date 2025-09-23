import { KeyPoint } from "./keypoint.model";
import { TourStatus } from "./enum/tour-status.enum"
import { TransportType } from "./enum/tour-transport.enum";

export interface Tour {
  id?: string;
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  status?: TourStatus;
  price?: number;
  authorId?: string;
  keyPoints: KeyPoint[];
  durations?: Duration[];
  distance?: number;
  publishedAt?: Date; 
  archivedAt?: Date;
}

export interface Duration {
  mode: TransportType;   
  minutes: number;
}

export interface CreateTourRequest {
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  authorId: string;
}

export interface PublishTour {
  id: string;
  name: string;
  price: number;
  description: string;
  length: number; // dužina u km npr.
  startTime: string; // vreme polaska
  keyPoints: KeyPoint[]; // lista ključnih tačaka
}
