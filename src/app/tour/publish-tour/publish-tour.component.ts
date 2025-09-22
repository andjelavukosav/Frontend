import { Component, OnInit } from '@angular/core';
import { PublishTour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-publish-tour',
  templateUrl: './publish-tour.component.html',
  styleUrls: ['./publish-tour.component.css']
})
export class PublishTourComponent implements OnInit {
  tours: PublishTour[] = [];
  user: User | null = null;

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (this.user) {
        this.loadTours();
      }
    });
  }

  loadTours(): void {
    if (!this.user) return;

    this.tourService.getPublishTours().subscribe({
      next: tours => {
        this.tours = tours.map(t => ({
          ...t,
          keyPoints: t.keyPoints ?? []
        }));
      },
      error: err => console.error('Greška prilikom učitavanja tura:', err)
    });
  }

  addToCart(tour: PublishTour): void {
    this.cartService.addToCart(tour);
  }
}
