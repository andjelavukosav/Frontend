export interface Tour {
  id?: number;           // backend će generisati
  name: string;
  description: string;
  difficulty: string;
  tags: string[];
  status?: string;       // default "draft"
  price?: number;        // default 0
  authorId?: string;
}
