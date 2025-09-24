import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PublishTour } from '../tour/model/create-tour.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: PublishTour[] = [];
  private cartSubject = new BehaviorSubject<PublishTour[]>([]);
  cart$ = this.cartSubject.asObservable();

  private apiUrl = 'http://localhost:8080/cart';

  constructor(private http: HttpClient) {}

  loadCart(userId: string) {
  return this.http.get<{ items: PublishTour[], totalPrice: number }>(`${this.apiUrl}/${userId}`).pipe(
    tap(response => {
      this.cartItems = response.items;
      this.cartSubject.next(this.cartItems);
    })
  );
}

addToCart(userId: string, tour: PublishTour) {
  return this.http.post<{ items: PublishTour[], totalPrice: number }>(`${this.apiUrl}/${userId}/items`, tour).pipe(
    tap(response => {
      this.cartItems = response.items;
      this.cartSubject.next(this.cartItems);
    })
  );
}

removeFromCart(userId: string, tourId: string) {
  return this.http.delete<{ items: PublishTour[], totalPrice: number }>(`${this.apiUrl}/${userId}/items/${tourId}`).pipe(
    tap(response => {
      this.cartItems = response.items;
      this.cartSubject.next(this.cartItems);
    })
  );
}

clearCart(userId: string) {
  return this.http.delete<{ items: PublishTour[], totalPrice: number }>(`${this.apiUrl}/${userId}/clear`).pipe(
    tap(response => {
      this.cartItems = response.items;
      this.cartSubject.next(this.cartItems);
    })
  );
}

}
