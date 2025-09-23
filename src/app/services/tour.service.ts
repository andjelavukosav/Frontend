import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTourRequest } from '../tour/model/create-tour.model';
import { Tour, PublishTour } from '../tour/model/create-tour.model';
import { map } from 'rxjs/operators';   // <-- ispravan import
import { KeyPoint } from '../tour/model/keypoint.model';
import { TourStatus } from '../tour/model/enum/tour-status.enum';
import { Review } from '../tour/model/review.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/tours'; 

  constructor(private http: HttpClient) {}

  createTour(tourRequest: CreateTourRequest): Observable<Tour> {
    return this.http.post<Tour>(`${this.apiUrl}/create-tour`, tourRequest);
  }


  getAuthorTours(userId: string): Observable<Tour[]> {
      return this.http.get<{ tours: Tour[] }>(`${this.apiUrl}/${userId}`)
        .pipe(
          map(response => response.tours) 
        );
  }

  getPublishTours(): Observable<PublishTour[]> {
    return this.http.get<{ tours: PublishTour[] }>(`${this.apiUrl}/published`).pipe(
      map(response => response.tours)
    );
  }

 getPurchasedTours(userId: string): Observable<PublishTour[]> {
    return this.http.get<PublishTour[]>(`${this.apiUrl}/purchased`, {
      params: { userId: userId.toString() }
    });
  }




  updateTourStatus(tourId: string, status: TourStatus): Observable<UpdateTourStatusResponse>{
    return this.http.patch<UpdateTourStatusResponse>(`${this.apiUrl}/${tourId}/update-status`, { newStatus: status});
  }

  addKeyPoint(formData: FormData): Observable<KeyPoint> {
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



  getReview(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.apiUrl}/reviews/${id}`);
  }

  getReviewsByTour(tourId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/${tourId}/reviews`);
  }

  getReviewsByTourist(touristId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/tourist/${touristId}/reviews`);
  }

  updateReview(id: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/reviews/${id}`, review);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reviews/${id}`);
  }

  getAverageRating(tourId: string): Observable<{ average: number }> {
    return this.http.get<{ average: number }>(`${this.apiUrl}/${tourId}/average-rating`);
  }

  createReview(formData: FormData): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/reviews`, formData);
  }

}
