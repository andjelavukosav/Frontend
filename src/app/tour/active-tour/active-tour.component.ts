import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { TourService } from 'src/app/services/tour.service';
import { PositionSimulatorService } from 'src/app/services/position-simulator.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit, OnDestroy {

  executionId!: string;
  tour: any;
  user: User | null = null;

  tourMap!: L.Map;
  currentPositionMarker!: L.Marker;
  currentPosition: { latitude: number; longitude: number } | null = null;

  positionCheckInterval!: Subscription;
  checkDistanceSeconds = 10; // svake 10 sekundi
  proximityThreshold = 2; // prag udaljenosti u km (~2km)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tourService: TourService,
    private positionService: PositionSimulatorService
  ) {}

  ngOnInit(): void {
    console.log('ActiveTourComponent initialized');

    this.executionId = this.route.snapshot.paramMap.get('executionId')!;
    console.log('Execution ID:', this.executionId);

    this.authService.user$.subscribe({
  next: (user) => {
    this.user = user;
    if (!this.user) return;

    // 1️⃣ Učitaj aktivnu turu
    this.tourService.getActiveTour(this.user.id).subscribe({
      next: (active) => {
      if (!active) {
        this.router.navigate(['/purchased-tours']);
        return;
      }

      this.executionId = active.executionId;

      // Umesto getPurchasedTours, pozovi getTourById
      this.tourService.getTourById(active.tourId).subscribe({
        next: (tour) => {
          if (!tour) {
            console.error('Tour not found with id', active.tourId);
            return;
          }

          this.tour = tour; // sada imamo sve podatke

          // Inicijalizuj mapu i interval
          if (this.tour.keyPoints && this.tour.keyPoints.length > 0) {
            setTimeout(() => this.initMap(), 0);
            this.positionCheckInterval = interval(this.checkDistanceSeconds * 1000)
              .subscribe(() => this.checkProximity());
          } else {
            console.warn('Tour has no key points, skipping map and proximity checks');
          }
        },
        error: (err) => console.error('Error fetching tour by id', err)
      });
    },
    error: (err) => console.error('Error fetching active tour', err)
    });
  }
});

  }

  ngOnDestroy(): void {
    if (this.positionCheckInterval) {
      this.positionCheckInterval.unsubscribe();
    }
  }

  private initMap(): void {
    const firstPoint = this.tour.keyPoints[0];
    this.tourMap = L.map(`map-${this.tour.id}`).setView(
      [firstPoint.latitude, firstPoint.longitude],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.tourMap);

    // Dodaj sve ključne tačke
    this.tour.keyPoints.forEach((kp: any) => {
      const popupContent = `
        <strong>${kp.name}</strong><br/>
        ${kp.description}<br/>
        <img src="http://localhost:8080/uploads/${kp.imageURL}" width="150"/>
      `;
      L.marker([kp.latitude, kp.longitude]).addTo(this.tourMap)
        .bindPopup(popupContent);
    });

    // Fit map da se vide sve tačke
    const group: L.FeatureGroup<L.Marker> = L.featureGroup(
      this.tour.keyPoints.map((kp: any) => L.marker([kp.latitude, kp.longitude]))
    );
    this.tourMap.fitBounds(group.getBounds().pad(0.2));

    // Učitaj trenutnu poziciju korisnika
    this.loadCurrentPosition();
  }

  private loadCurrentPosition(): void {
    if (!this.user?.id) return;

    this.positionService.getCurrentPosition(this.user.id).subscribe(pos => {
      if (pos && (pos.latitude !== 0 || pos.longitude !== 0)) {
        this.currentPosition = { latitude: pos.latitude, longitude: pos.longitude };
        this.setCurrentPositionMarker(pos.latitude, pos.longitude);
      }
    });
  }

  private setCurrentPositionMarker(lat: number, lng: number): void {
    if (!this.tourMap) return;

    const popupContent = `<b>Your position</b><br>Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}`;

    if (this.currentPositionMarker) {
      this.currentPositionMarker.setLatLng([lat, lng])
        .bindPopup(popupContent)
        .openPopup();
    } else {
      this.currentPositionMarker = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'assets/current-position.png', // posebna ikona za korisnika
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(this.tourMap)
        .bindPopup(popupContent)
        .openPopup();
    }

    this.tourMap.setView([lat, lng], 13);
  }

  private getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) ** 2 +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private checkProximity(): void {
    if (!this.user?.id || !this.tour?.keyPoints) return;

    this.positionService.getCurrentPosition(this.user.id).subscribe(pos => {
      if (!pos) return;

      this.currentPosition = { latitude: pos.latitude, longitude: pos.longitude };
      this.setCurrentPositionMarker(pos.latitude, pos.longitude);

      this.tour.keyPoints.forEach((kp: any) => {
        const distance = this.getDistanceInKm(pos.latitude, pos.longitude, kp.latitude, kp.longitude);
        if (distance <= this.proximityThreshold) {
          console.log(`Tourist is near key point: ${kp.name} (distance: ${distance.toFixed(3)} km)`);

          // Pošalji zahtev na backend
          this.tourService.notifyNearKeyPoint(this.executionId, kp.id, this.user!.id)
              .subscribe({
                next: res => {
                  console.log('Backend notified about proximity', res);

                  // ❗ Ovde pozovi proveru da li je tura završena
                  this.checkIfTourCompleted();
                },
                error: err => console.error('Error notifying proximity', err)
              });

        }
      });
    });
  }

  leaveTour(): void {
    if (!this.user?.id) return;

    this.tourService.leaveTour(this.executionId, this.user.id).subscribe({
      next: res => {
        console.log('Tour left, status:', res.status);
        this.router.navigate(['/purchased-tours']);
      },
      error: err => console.error('Error leaving tour', err)
    });
  }

  private checkIfTourCompleted(): void {
    this.tourService.checkTourCompletion(this.executionId).subscribe({
      next: (res) => {
        if (res.completed) { // backend vraća npr. { completed: true/false }
          console.log('Tour successfully completed!');
          
          // Opcionalno, prikaži notifikaciju korisniku
          alert('🎉 Čestitamo! Uspešno ste završili turu.');

          // Lokalno promeni status ture
          this.tour.status = 'COMPLETE';

          // Opcionalno, zaustavi interval proveravanja blizine
          if (this.positionCheckInterval) {
            this.positionCheckInterval.unsubscribe();
          }
        }
      },
      error: (err) => console.error('Error checking tour completion', err)
    });
  }

}


