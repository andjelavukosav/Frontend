import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { TourService } from 'src/app/services/tour.service';
import { PositionSimulatorService } from 'src/app/services/position-simulator.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit {

  executionId!: string;
  tour: any;
  user: User | null = null;

  tourMap!: L.Map;
  currentPositionMarker!: L.Marker;
  currentPosition: { latitude: number; longitude: number } | null = null;

  positionCheckInterval!: Subscription;
  checkDistanceSeconds = 10; // svake 10 sekundi
  proximityThreshold = 0.05; // prag udaljenosti u km (~50m)

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tourService: TourService,
    private positionService: PositionSimulatorService
  ) {}

  ngOnInit(): void {
    this.executionId = this.route.snapshot.paramMap.get('executionId')!;
    this.tour = history.state.tour;

    this.authService.user$.subscribe(user => {
      this.user = user;

      // ako je user već učitan i tour postoji, učitaj trenutnu poziciju
      if (this.tour && this.tour.keyPoints && this.tour.keyPoints.length > 0) {
        setTimeout(() => this.initMap(), 0);
      }
    });
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

  private getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Zemljin poluprečnik u km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
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

  leaveTour(): void {
    if (!this.user?.id) return;

    this.tourService.leaveTour(this.executionId, this.user.id).subscribe({
      next: res => {
        console.log('Tour left, status:', res.status);
        this.router.navigate(['/purchased-tours']);
      },
      error: err => {
        console.error('Error leaving tour', err);
      }
    });
  }

  private checkProximity(): void {
    if (!this.user?.id || !this.tour?.keyPoints) return;

    // 1️⃣ prvo uzmi trenutnu poziciju iz PositionSimulatorService
    this.positionService.getCurrentPosition(this.user.id).subscribe(pos => {
      if (!pos) return;

      this.currentPosition = { latitude: pos.latitude, longitude: pos.longitude };
      this.setCurrentPositionMarker(pos.latitude, pos.longitude);

      // 2️⃣ proveri udaljenost do svih ključnih tačaka
      this.tour.keyPoints.forEach((kp: any) => {
        const distance = this.getDistanceInKm(pos.latitude, pos.longitude, kp.latitude, kp.longitude);
        if (distance <= this.proximityThreshold) {
          console.log(`Tourist is near key point: ${kp.name} (distance: ${distance.toFixed(3)} km)`);

          // 3️⃣ ovde možeš poslati zahtev na backend da obavestiš da je turista blizu
          this.tourService.notifyNearKeyPoint(this.executionId, kp.id, this.user!.id)
            .subscribe(res => {
              console.log('Backend notified about proximity', res);
            });
        }
      });
    });
  }


}
