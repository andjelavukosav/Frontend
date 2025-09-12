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
