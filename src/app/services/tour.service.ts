import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour } from '../tour/model/create-tour.model';
import { map } from 'rxjs/operators';   // <-- ispravan import

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


}
