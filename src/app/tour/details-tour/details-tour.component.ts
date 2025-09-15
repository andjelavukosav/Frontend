import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { KeyPoint } from '../model/keypoint.model';

@Component({
  selector: 'app-details-tour',
  templateUrl: './details-tour.component.html',
  styleUrls: ['./details-tour.component.css']
})
export class DetailsTourComponent implements OnInit, OnDestroy { // Dodat OnDestroy
  tours: Tour[] = [];
  user: User | null = null;
  selectedFile: File | null = null;
  private pointMaps: { [key: string]: L.Map } = {}; 
  showPointsMap: { [tourId: string]: boolean } = {};

  newPoint: KeyPoint = {
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    imageURL: ''
  };

  activeTourForForm: Tour | null = null;
  private formMap: L.Map | null = null;
  private formMarker: L.Marker | null = null;

  constructor(private tourService: TourService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loadTours();
    });
  }
  toggleKeyPoints(tour: Tour): void {
  if (tour.id) {
    // Prebacivanje stanja za datu turu
    this.showPointsMap[tour.id] = !this.showPointsMap[tour.id];

    // Ako je prikaz omogućio, inicijalizujte mape
    if (this.showPointsMap[tour.id]) {
      setTimeout(() => {
        tour.keyPoints.forEach(point => {
          if (point.id) {
            this.initPointMap(point.id, point.latitude, point.longitude);
          }
        });
      }, 100);
    }
  }
  }

  ngAfterViewInit(): void {
    // Inicijalizacija mapa nakon što se pogled (view) renderuje
    this.tours.forEach(tour => {
      tour.keyPoints.forEach(point => {
        if (point.id) { // Proverite da li point ima id
          this.initPointMap(point.id, point.latitude, point.longitude);
        }
      });
    });
  }

  private initPointMap(pointId: string, lat: number, lng: number): void {
    const mapId = `map-${pointId}`;

    // Provera da li mapa već postoji kako bi se izbegla ponovna inicijalizacija
    if (this.pointMaps[mapId]) {
      this.pointMaps[mapId].remove();
      delete this.pointMaps[mapId];
    }

    const map = L.map(mapId).setView([lat, lng], 14);
    this.pointMaps[mapId] = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    // Prilagodite veličinu mape nakon renderovanja
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }
  // Koristi ngOnDestroy da očisti resurse mape kad se komponenta uništi
  ngOnDestroy(): void {
    if (this.formMap) {
      this.formMap.remove();
    }
  }

  loadTours(): void {
  if (!this.user) return;
  this.tourService.getAuthorTours(this.user.id).subscribe({
    next: tours => {
      this.tours = tours.map(t => ({
        ...t,
        keyPoints: t.keyPoints ?? []
      }));

      // Inicijalizujte showPointsMap za sve ture
      this.tours.forEach(tour => {
        if (tour.id) {
          this.showPointsMap[tour.id] = false; // Postavite početno stanje na sakriveno
        }
      });

      // Uklonite setTimeout() za inicijalizaciju mapa ovde jer će sada
      // to raditi toggleKeyPoints() metoda.
    },
    error: err => console.error(err)
  });
}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // Otvara formu i inicijalizuje mapu
  openForm(tour: Tour) {
    this.activeTourForForm = tour;
    this.resetForm();

    // Čeka da DOM bude renderovan, pa inicijalizuje mapu
    setTimeout(() => {
      this.initFormMap(tour.id || "");
    }, 100);
  }

 // U DetailsTourComponent.ts
// ... (your existing imports and component setup) ...

addKeyPoint(tour: Tour) {
  if (
    this.newPoint.name &&
    this.newPoint.description &&
    this.newPoint.latitude &&
    this.newPoint.longitude
  ) {
    if (!tour.id) {
        alert('ID ture nije dostupan.');
        return;
    }

    const formData = new FormData();
    formData.append('tourId', tour.id);
    formData.append('name', this.newPoint.name);
    formData.append('description', this.newPoint.description);
    formData.append('latitude', this.newPoint.latitude.toString());
    formData.append('longitude', this.newPoint.longitude.toString());

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // Call the service to upload the file and add the KeyPoint
    this.tourService.addKeyPoint(formData).subscribe({
      next: (savedPoint: KeyPoint) => {
        // Step 1: Add the new point to the local array
        tour.keyPoints.push(savedPoint);
        
        // Step 2: Manually initialize the map for the new point
        // Use a slight delay to ensure the DOM element is rendered
        setTimeout(() => {
          if (savedPoint.id) {
            this.initPointMap(savedPoint.id, savedPoint.latitude, savedPoint.longitude);
          }
        }, 100);

        // Step 3: Close the form
        this.cancelForm();
      },
      error: (err) => {
        console.error('Greška pri dodavanju ključne tačke:', err);
        alert('Došlo je do greške pri dodavanju ključne tačke.');
      }
    });
  } else {
    alert('Molimo popunite sva obavezna polja i odaberite lokaciju na mapi.');
  }
}

  // Zatvara formu i čisti resurse mape
  cancelForm() {
    this.activeTourForForm = null;
    this.resetForm();
    if (this.formMap) {
      this.formMap.remove(); // Uništenje mape
      this.formMap = null;
      this.formMarker = null;
    }
  }

  // Poništava vrednosti u formi
  private resetForm() {
    this.newPoint = {
      name: '',
      description: '',
      latitude: 0,
      longitude: 0,
      imageURL: ''
    };
  }

  // Inicijalizuje mapu i dodaje interakciju
  private initFormMap(tourId: string) {
    if (this.formMap) {
      this.formMap.remove();
    }

    const mapId = `map-${tourId}`;
    this.formMap = L.map(mapId).setView([44.787197, 20.457273], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.formMap);

    // Dodaj slušač za klik na mapi
    this.formMap.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      this.setCoordinates(lat, lng);

      // Ukloni stari marker
      if (this.formMarker) {
        this.formMap!.removeLayer(this.formMarker);
      }
      
      // Dodaj novi marker
      this.formMarker = L.marker([lat, lng]).addTo(this.formMap!);
    });

    // Podesi veličinu mape nakon renderovanja
    setTimeout(() => {
      this.formMap!.invalidateSize();
    }, 200);
  }

  // Ažurira koordinate u modelu forme
  private setCoordinates(lat: number, lng: number) {
    this.newPoint.latitude = lat;
    this.newPoint.longitude = lng;
  }
}