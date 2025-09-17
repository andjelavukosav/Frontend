export interface Position{
    touristId: string;
    latitude: number;
    longitude: number;
    updatedAt?: number; // Unix timestamp bice postavljeno od backenda
}