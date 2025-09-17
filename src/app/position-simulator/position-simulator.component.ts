import { Component, OnDestroy, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { Position } from './model/position.model';
import { PositionSimulatorService } from '../services/position-simulator.service';
import { AuthService } from '../services/auth.service';
import { User } from '../auth/model/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-position-simulator',
  templateUrl: './position-simulator.component.html',
  styleUrls: ['./position-simulator.component.css']
})
export class PositionSimulatorComponent implements OnInit, OnDestroy {

  map!: L.Map;
  marker!: L.Marker;
  position: Position | null = null;
  currentPosition: Position | null = null; //cuva posljednju sacuvanu poziciju 

  currentUser: User | null = null;
  touristId: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private positionSimulatorService: PositionSimulatorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe(user => {
      this.currentUser = user;
      this.touristId = this.currentUser.id;
      this.initMap();
      this.loadCurrentPosition();
    });
  }

  private initMap(): void {
    this.map = L.map('map').setView([45.2671, 19.8335], 13); // Novi Sad

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.setMarker(lat, lng);
      this.position = { touristId: this.touristId, latitude: lat, longitude: lng };
    });
  }

  private normalizeLatitude(lat: number): number {
    if (lat > 90) return 90;
    if (lat < -90) return -90;
    return lat;
  }

  private normalizeLongitude(lng: number): number {
    return ((lng + 180) % 360 + 360) % 360 - 180;
  }

  private setMarker(lat: number, lng: number): void {
     lat = this.normalizeLatitude(lat);
    lng = this.normalizeLongitude(lng);
    
    const popupContent = `<b>Your position</b><br>Latitude: ${lat.toFixed(5)}<br>Longitude: ${lng.toFixed(5)}`;

    if (this.marker) {
      this.marker.setLatLng([lat, lng])
        .bindPopup(popupContent)
        .openPopup();
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map)
        .bindPopup(popupContent)
        .openPopup();
    }

    this.map.setView([lat, lng], 13);
  }


  private loadCurrentPosition(): void {
    if (!this.touristId) return;

    this.positionSimulatorService.getCurrentPosition(this.touristId).subscribe(pos => {
      if (pos && (pos.latitude !== 0 || pos.longitude !== 0)) {
        this.currentPosition = {...pos} //cuva se kopija
        this.setMarker(pos.latitude, pos.longitude);
        this.position = { touristId: this.touristId, latitude: pos.latitude, longitude: pos.longitude };
      }
    });
  }

  get latitude(): number | null {
    return this.position?.latitude ?? null;
  }

  get longitude(): number | null {
    return this.position?.longitude ?? null;
  }

  get hasPosition(): boolean {
    return !!this.position && !(this.position.latitude === 0 && this.position.longitude === 0);
  }

  get canUndo(): boolean {
    if (!this.position || !this.currentPosition) return false;
    return this.position.latitude !== this.currentPosition.latitude ||
          this.position.longitude !== this.currentPosition.longitude;
  }

  savePosition(): void {
    if (this.position) {
      this.positionSimulatorService.recordPosition(this.position)
        .subscribe((pos) => {
          this.currentPosition = {...pos} //cuva se kopija
          console.log('Position saved successfully!');
        });
    }
  }

  undoPosition(): void {
    if(this.currentPosition){
      this.position = { ...this.currentPosition};
      this.setMarker(this.position.latitude, this.position.longitude);
    }
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
