import { Component, OnInit } from '@angular/core';
import { PublishTour } from '../model/create-tour.model';
import { User } from 'src/app/auth/model/user.model';
import { TourService } from 'src/app/services/tour.service';
import { AuthService } from 'src/app/services/auth.service';
import * as L from 'leaflet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchased-tours',
  templateUrl: './purchased-tours.component.html',
  styleUrls: ['./purchased-tours.component.css']
})
export class PurchasedToursComponent implements OnInit{
 tours: PublishTour[] = [];
  user: User | null = null;

  constructor(
    private tourService: TourService,
    private authService: AuthService,
    private router: Router
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
    if (this.user) {
  this.tourService.getPurchasedTours(this.user.id).subscribe({
    next: tours => {
      this.tours = tours.map(t => ({
        ...t,
        keyPoints: t.keyPoints?.map(kp => ({
          ...kp,
          imageURL: `http://localhost:8080/uploads/${kp.imageURL}`
        })) ?? []
      }));

      // Ovde možeš inicijalizovati mape za ture i keyPoints
      setTimeout(() => {
        this.tours.forEach(tour => {
          if (tour.keyPoints.length > 0) {
            const map = L.map(`map-${tour.id}`).setView(
              [tour.keyPoints[0].latitude, tour.keyPoints[0].longitude],
              13
            );

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            tour.keyPoints.forEach(kp => {
              const popupContent = `
                <strong>${kp.name}</strong><br/>
                ${kp.description}<br/>
                <img src="${kp.imageURL}" width="150"/>
              `;
              L.marker([kp.latitude, kp.longitude]).addTo(map)
                .bindPopup(popupContent);
            });

            // Fit map to show all markers
            const group: L.FeatureGroup<L.Marker> = L.featureGroup(
              tour.keyPoints.map(kp => L.marker([kp.latitude, kp.longitude]))
            );
            map.fitBounds(group.getBounds().pad(0.2));
          }
        });
      }, 0);
    },
    error: err => console.error('Greška prilikom učitavanja kupljenih tura:', err)
  });
}
  }

  startTour(tour: any) {
  this.tourService.startTour(this.user!.id, tour.id).subscribe({
    next: (res) => {
      console.log('Tour started', res);
      // res.tourExecutionId dolazi sa backa
      this.router.navigate(['/active-tour', res.tourExecutionId], {
        state: { tour } // možeš proslediti celu turu kroz state
      });
    },
    error: (err) => {
      console.error('Error starting tour', err);
    }
  });
}

}
