import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PublishTour } from '../tour/model/create-tour.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: PublishTour[] = [];
  private cartSubject = new BehaviorSubject<PublishTour[]>([]);
  cart$ = this.cartSubject.asObservable(); // za subscribe u komponentama

  addToCart(tour: PublishTour) {
    if (!this.cartItems.find(t => t.id === tour.id)) {
      this.cartItems.push(tour);
      this.cartSubject.next([...this.cartItems]);
    }
  }

  removeFromCart(tourId: string) {
    this.cartItems = this.cartItems.filter(t => t.id !== tourId);
    this.cartSubject.next([...this.cartItems]);
  }

  clearCart() {
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  getCartItems(): PublishTour[] {
    return [...this.cartItems];
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, tour) => total + (tour.price || 0), 0);
  }
}
