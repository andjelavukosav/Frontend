export interface Review {
    id?: string;
    rating: number;
    comment: string;
    tourist_id: string;
    tour_id: string;
    visit_date: Date;
    comment_date: Date;
    images: string[]; 
    tourist_name?: string;
    tourist_image?: string;  
}