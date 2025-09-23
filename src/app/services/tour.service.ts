import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../tour/model/create-tour.model';
import { map } from 'rxjs/operators';   // <-- ispravan import
import { KeyPoint } from '../tour/model/keypoint.model';
import { Review } from '../tour/model/review.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/tours'; // prilagodi svom backendu

  constructor(private http: HttpClient) {}

  createTour(tour: Tour): Observable<Tour> {
    // Dodaj "create-tour" na kraj apiUrl
    return this.http.post<Tour>(`${this.apiUrl}/create-tour`, tour);
  }


  getAuthorTours(userId: string): Observable<Tour[]> {
      return this.http.get<{ tours: Tour[] }>(`${this.apiUrl}/${userId}`)
        .pipe(
          map(response => response.tours) // odmah uzimamo samo niz
        );
  }

  addKeyPoint(formData: FormData): Observable<KeyPoint> {
    // Slanje FormData objekta, on već sadrži tourId i ostale podatke
    return this.http.post<KeyPoint>(`${this.apiUrl}/add-keypoint`, formData);
  }

  updateKeyPoint(keyPoint: KeyPoint, tourId: string): Observable<KeyPoint> {
    console.log('Tour id: ', tourId)
    return this.http.put<KeyPoint>(`${this.apiUrl}/tour/${tourId}/update-keypoint`, keyPoint);
  }

  updateKeyPointMultipart(tourId: string, formData: FormData): Observable<KeyPoint> {
    console.log('Tour id: ', tourId)
    return this.http.put<KeyPoint>(`${this.apiUrl}/tour/${tourId}/update-keypoint`, formData);
  }

  deleteKeyPoint(tourId: string, keyPointId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/tour/${tourId}/keypoint/${keyPointId}`);  }

  getTourById(tourId: string): Observable<Tour>{
    return this.http.get<Tour>(`${this.apiUrl}/tour/${tourId}`);
  }

  getAllTours(): Observable<Tour[]> {
    return this.http.get<{ tours: Tour[] }>(`${this.apiUrl}/all`).pipe(
      map(response => response.tours) // Ekstraktujte niz iz odgovora
    );
  }



  // GET /tours/reviews/{id}
  getReview(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`);
  }

  // GET /tours/{tour_id}/reviews
  getReviewsByTour(tourId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${tourId}/reviews`);
  }

  // GET /tours/tourist/{tourist_id}/reviews
  getReviewsByTourist(touristId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/tourist/${touristId}/reviews`);
  }

  // PUT /tours/reviews/{id}
  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, review);
  }

  // DELETE /tours/reviews/{id}
  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  // GET /tours/{tour_id}/average-rating
  getAverageRating(tourId: string): Observable<{ average: number }> {
    return this.http.get<{ average: number }>(`${this.apiUrl}/${tourId}/average-rating`);
  }

  createReview(formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, formData);
  }

}
