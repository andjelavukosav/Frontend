import { Component, OnInit } from '@angular/core';
import { PublishTour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { CartService } from 'src/app/services/cart.service';
import * as L from 'leaflet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Review } from '../model/review.model';

@Component({
  selector: 'app-publish-tour',
  templateUrl: './publish-tour.component.html',
  styleUrls: ['./publish-tour.component.css']
})
export class PublishTourComponent implements OnInit {
  tours: PublishTour[] = [];
  user: User | null = null;
  reviewsList: Review[] = [];  

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private router: Router
) {}

addToCart(tour: PublishTour): void {
  this.cartService.addToCart(this.user?.id || "", tour).subscribe({
    next: () => {
      let snackBarRef = this.snackBar.open(
        `Tour "${tour.name}" je dodata u korpu!`, 
        'Idi u korpu', 
        { duration: 3000 }
      );

      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/shopping-cart']);
      });
    },
    error: err => {
      console.error("❌ Greška prilikom dodavanja u korpu:", err);
      this.snackBar.open("Došlo je do greške pri dodavanju ture u korpu", "Zatvori", { duration: 3000 });
    }
  });
}


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

      // 🔹 Pozovi učitavanje recenzija za svaku turu
      this.tours.forEach(tour => {
        this.loadReviews(tour.id);
      });

      // 🔹 Inicijalizacija mapa
      setTimeout(() => {
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


  loadReviews(tourId: string): void {
  this.tourService.getReviewsByTour(tourId).subscribe({
    next: (res: any) => {

      // Proveravamo da li je res niz ili objekat sa poljem reviews
      const rawReviews: any[] = Array.isArray(res) ? res : res.reviews || [];

      // Mapiramo svaki review na front-end model
      this.reviewsList = rawReviews.map(r => this.mapReviewFromBackend(r));
    },
    error: (err) => {
      console.error('Error loading reviews:', err);
      this.reviewsList = [];
    }
  });
}
mapReviewFromBackend(r: any): Review {
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      tourist_id: r.tourist_id,
      tour_id: r.tour_id,
      visit_date: r.visit_date
        ? new Date(r.visit_date.seconds * 1000 + Math.floor(r.visit_date.nanos / 1000000))
        : new Date(),
      comment_date: r.comment_date
        ? new Date(r.comment_date.seconds * 1000 + Math.floor(r.comment_date.nanos / 1000000))
        : new Date(),
      images: r.images || [],
      tourist_name: r.tourist_name,
      tourist_image: r.tourist_image
    };
  }

}
