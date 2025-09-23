// src/app/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PublishTour } from '../tour/model/create-tour.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/orders'; // 👈 prilagodi backend URL

  constructor(private http: HttpClient) {}

  placeOrder(userId: string, tours: PublishTour[], totalPrice: number): Observable<any> {
    return this.http.post(this.apiUrl, { userId, tours, totalPrice });
  }


}
