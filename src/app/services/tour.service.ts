import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTourRequest, Tour } from '../tour/model/create-tour.model';
import { map } from 'rxjs/operators';   // <-- ispravan import
import { KeyPoint } from '../tour/model/keypoint.model';
import { TourStatus } from '../tour/model/enum/tour-status.enum';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/tours'; 

  constructor(private http: HttpClient) {}

  createTour(tourRequest: CreateTourRequest): Observable<Tour> {
    // Dodaj "create-tour" na kraj apiUrl
    return this.http.post<Tour>(`${this.apiUrl}/create-tour`, tourRequest);
  }


  getAuthorTours(userId: string): Observable<Tour[]> {
      return this.http.get<{ tours: Tour[] }>(`${this.apiUrl}/${userId}`)
        .pipe(
          map(response => response.tours) // odmah uzimamo samo niz
        );
  }

  updateTourStatus(tourId: string, status: TourStatus): Observable<UpdateTourStatusResponse>{
    return this.http.patch<UpdateTourStatusResponse>(`${this.apiUrl}/${tourId}/update-status`, { newStatus: status});
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
