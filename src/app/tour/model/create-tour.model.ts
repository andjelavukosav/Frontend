import { KeyPoint } from "./keypoint.model";

export interface Tour {
  id?: string;           // backend će generisati
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  status?: string;       // default "draft"
  price?: number;        // default 0
  authorId?: string;
  keyPoints: KeyPoint[]; // <-- obavezno
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
