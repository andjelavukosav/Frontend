import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../tour/model/create-tour.model';
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

  /*addKeyPoint(tourId: string, point: KeyPoint) {
    const body = {
      tourId: tourId,
      point: point
    };
    // Slanje zahteva na putanju koju gRPC-Gateway očekuje
    return this.http.post<KeyPoint>(`${this.apiUrl}/add-keypoint`, body);
  }*/

  addKeyPoint(formData: FormData): Observable<KeyPoint> {
    // Slanje FormData objekta, on već sadrži tourId i ostale podatke
    return this.http.post<KeyPoint>(`${this.apiUrl}/add-keypoint`, formData);
  }


}
