import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour, PublishTour } from '../tour/model/create-tour.model';
import { map } from 'rxjs/operators';   // <-- ispravan import
import { KeyPoint } from '../tour/model/keypoint.model';

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

}
