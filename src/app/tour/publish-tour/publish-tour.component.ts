import { Component, OnInit } from '@angular/core';
import { PublishTour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { CartService } from 'src/app/services/cart.service';
import * as L from 'leaflet';

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
          keyPoints: t.keyPoints?.map(kp => ({
            ...kp,
            imageURL: `http://localhost:8080/uploads/${kp.imageURL}`
          })) ?? []
        }));

        // Inicijalizuj mapu za svaki prvi keyPoint
        setTimeout(() => {  // čekamo da se DOM renderuje
          this.tours.forEach(tour => {
            if (tour.keyPoints?.length > 0) {
              const kp = tour.keyPoints[0];
              const map = L.map(`map-${tour.id}`).setView([kp.latitude, kp.longitude], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
              }).addTo(map);
              L.marker([kp.latitude, kp.longitude]).addTo(map)
                .bindPopup(kp.name)
                .openPopup();
            }
          });
        }, 0);
      },
      error: err => console.error('Greška prilikom učitavanja tura:', err)
    });
  }

  addToCart(tour: PublishTour): void {
    this.cartService.addToCart(tour);
  }
}
