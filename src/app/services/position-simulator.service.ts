import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Position } from '../position-simulator/model/position.model';

@Injectable({
  providedIn: 'root'
})
export class PositionSimulatorService {
  private apiUrl = 'http://localhost:8080/position';

  constructor(private http: HttpClient) { }

  recordPosition(position: Position): Observable<Position>{
    const payload = {
      touristId: position.touristId,
      latitude: position.latitude,
      longitude: position.longitude
    };
    return this.http.post<Position>(`${this.apiUrl}`, payload)
  }

  getCurrentPosition(touristId: string): Observable<Position> {
    return this.http.get<Position>(`${this.apiUrl}/${touristId}`);
  }
}
