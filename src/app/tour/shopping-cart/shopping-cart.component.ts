import { Component, OnInit } from '@angular/core';
import { PublishTour } from '../model/create-tour.model';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cartItems: PublishTour[] = [];
  totalPrice: number = 0;
  user: User | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService
  ) {}

   ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.cartService.loadCart(this.user.id).subscribe();
      }
    });

    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.totalPrice = this.cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    });

  }

  removeFromCart(tourId: string) {
    if (!this.user) return;
    this.cartService.removeFromCart(this.user.id, tourId).subscribe();
  }

  clearCart() {
    if (!this.user) return;
    this.cartService.clearCart(this.user.id).subscribe();
  }
  buyTours() {
    if (this.cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    this.orderService.placeOrder(this.user?.id || "", this.cartItems, this.totalPrice).subscribe({
      next: (response) => {
        alert("Purchase successful!");
        console.log("Order response:", response);
        this.clearCart();
      },
      error: (err) => {
        console.error("Error placing order:", err);
        alert("Something went wrong while placing order.");
      }
    });
  }

}
