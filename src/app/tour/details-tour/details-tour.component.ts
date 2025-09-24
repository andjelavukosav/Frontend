import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Tour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { KeyPoint, KeyPointDialogData } from '../model/keypoint.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateKeypointDialogComponent } from '../create-keypoint-dialog/create-keypoint-dialog.component';
import { KeyPointDetailsDialogComponent } from '../key-point-details-dialog/key-point-details-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { TourStatus } from '../model/enum/tour-status.enum';
import { MatSnackBar } from '@angular/material/snack-bar';
import { error } from 'console';

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

  activeTourForForm: Tour | null = null;
  private formMap: L.Map | null = null;

  highlightedTourId: string | null = null;

  constructor(
    private tourService: TourService, 
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      this.user = user;
      this.loadTours();
    });

    //Subcribe na query params ako treba da se istakne novokreirana tura
    this.route.queryParams.subscribe(params => {
      this.highlightedTourId = params['highlight'] || null;

      if(this.highlightedTourId) {
        // Timeout da se saceka render tura prije scroll-a
        setTimeout(() => {
          const element = document.getElementById(this.highlightedTourId!);
          if(element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center'});
            element.classList.add('highlighted');
          }
        }, 100);
      }
    })
  }

  private initTourMap(tour: Tour) {
    if (this.pointMaps[tour.id!]) return; //vec postoji
    
    const mapId = `map-tour-${tour.id}`;
    const map = L.map(mapId).setView([45.267136, 19.833549], 12); // Novi Sad

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Klik handler za dodavanje novog key point-a
    map.on('click', (e: L.LeafletMouseEvent) => {
        this.openForm(tour, e.latlng.lat, e.latlng.lng);
    });

    // Sačuvaj mapu (opcionalno za kasnije)
    this.pointMaps[tour.id!] = map;
    this.refreshTourMap(tour); // iscrtaj markere/linije
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
            this.showPointsMap[tour.id] = true; // Postavite početno stanje na sakriveno
            
            //inicijalizacija mapre za ovu turu 
            setTimeout(() => this.initTourMap(tour), 0); 
          }
        });
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

  openForm(tour: Tour, initialLat?: number, initialLng?: number) {
    const dialogRef = this.dialog.open(CreateKeypointDialogComponent, {
      width: '450px',
      data: {
        tourId: tour.id,
        latitude: initialLat || 44.787197,  // Beograd default
        longitude: initialLng || 20.457273,
        keyPoint: undefined
      } as KeyPointDialogData,
      disableClose: false  // omogucava zatvaranje klikom izvan dijaloga
    });

    dialogRef.afterClosed().subscribe((newKeyPoint: KeyPoint | undefined) => {
      if (!newKeyPoint) return;

      this.reloadTour(tour.id!);
      return;
    });
  }

  addMarkerForKeyPoint(keyPoint: KeyPoint, map: L.Map, tour: Tour) {
    const marker = L.marker([keyPoint.latitude, keyPoint.longitude]).addTo(map);
    
    // Popup koji se vidi na hover
    const popupContent = `
        <h3>${keyPoint.name} (Order: ${keyPoint.order})</h3>
        <p>${keyPoint.description}</p>
        <img src="http://localhost:8080/tours/uploads/${keyPoint.imageURL}" 
             alt="${keyPoint.name}" style="width:100px;height:auto;">
    `;
    // bindTooltip je za hover
    marker.bindTooltip(popupContent, { direction: 'top', offset: [0, -10], permanent: false }); 


    marker.on('click', () => {
      this.openKeyPointDialog(keyPoint, tour);
    });
  }

  drawTourLine(tour: Tour, map: L.Map) {
    if(!tour.keyPoints || tour.keyPoints.length < 2) return;

    // Sortiraj keyPoint po order
    const points = [...tour.keyPoints].sort((a, b) => a.order - b.order);

    // Kreiraj niz koordinata
    const latLngs = points.map(p => [p.latitude, p.longitude] as [number, number]);

    // Nacrtaj Polyline
    const polyline = L.polyline(latLngs, { color: 'blue', weight: 3 }).addTo(map);

    // fit mapu da obuhvati sve tačke
    const group = L.featureGroup(points.map(p => L.marker([p.latitude, p.longitude])));
    map.fitBounds(group.getBounds().pad(0.2));
  }

  openKeyPointDialog(keyPoint: KeyPoint, tour: Tour) {
    const dialogRef = this.dialog.open(KeyPointDetailsDialogComponent, {
      width: '80vw',
      maxWidth: '650px',
      maxHeight: '80vh',
      data: { tour, keyPoint },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      // DELETE 
      if (result.deleted) {
        this.reloadTour(tour.id!);
        return;
      }

      // UPDATE 
      const updatedKeyPoint: KeyPoint = result;
      console.log('Updated key point: ', updatedKeyPoint);

      if(updatedKeyPoint.order !== keyPoint.order || updatedKeyPoint.latitude !== keyPoint.latitude || updatedKeyPoint.longitude !== keyPoint.longitude) {
        this.reloadTour(tour.id!);
        return;
      }

      // Ako se order nije mijenjao samo update-uj lokalno
      const index = tour.keyPoints.findIndex(kp => kp.id === updatedKeyPoint.id);
      if (index > -1) {
        tour.keyPoints[index] = updatedKeyPoint;
      }

      // 2. Osvjezi mapu
      this.refreshTourMap(tour);
    });
  }

  private reloadTour(tourId: string) {
    this.tourService.getTourById(tourId).subscribe({
      next: refreshedTour => {
        const tourIndex = this.tours.findIndex(t => t.id === tourId);
        if (tourIndex > -1) {
          this.tours[tourIndex] = {
            ...refreshedTour,
            keyPoints: refreshedTour.keyPoints ?? []
          };
          // Obrisi staru mapu ako postoji
          const oldMap = this.pointMaps[tourId];
          if (oldMap) {
            oldMap.remove();
            delete this.pointMaps[tourId];
          }

          // Ponovo inicijalizuj mapu
          setTimeout(() => this.initTourMap(this.tours[tourIndex]), 0);
        }
      },
      error: err => console.error(err)
    });
  }

  private refreshTourMap(tour: Tour) {
    const map = this.pointMaps[tour.id!];
    if (!map) return;

    // Očisti postojeće markere i linije
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) layer.remove();
      if (layer instanceof L.Polyline) layer.remove();
    });

    // Ponovo iscrtaj sa sortiranjem
    const sortedPoints = [...tour.keyPoints].sort((a, b) => a.order - b.order);

    sortedPoints.forEach(kp => this.addMarkerForKeyPoint(kp, map, tour));
    this.drawTourLine(tour, map);
  }


  canPublish(tour: Tour): boolean {
    return !!tour.name &&
          !!tour.description &&
          !!tour.difficulty &&
          tour.tags.length > 0 &&
          tour.keyPoints.length >= 2 &&
          tour.durations !== undefined &&
          tour.durations.length > 0;
  }

  publishTour(tour: Tour) {
    if (this.canPublish(tour)) {

      this.tourService.updateTourStatus(tour.id!, TourStatus.PUBLISHED).subscribe({
        next: (response: UpdateTourStatusResponse) => {
          
          tour.status = TourStatus.PUBLISHED
          if (response.updatedAt) {
            const ts = response.updatedAt as any; // gRPC Timestamp
            tour.publishedAt = new Date(ts.seconds * 1000 + ts.nanos / 1e6);
          }
          this.snackBar.open('Tour successfully published!', 'Close', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        }, 
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to publish tour.', 'Close', {
            duration: 4000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });
      
    } else {
      this.snackBar.open('Tour cannot be published. Check required fields, key points, and durations.', 'Close', {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['snackbar-error']
      });
    }
  }

   /* publishTour(tour: Tour) {
  if (this.canPublish(tour)) {

    this.tourService.updateTourStatus(tour.id!, TourStatus.PUBLISHED).subscribe({
      next: (response: UpdateTourStatusResponse) => {
        if(response.status === TourStatus.PENDING_PUBLISH){
          tour.status = TourStatus.PENDING_PUBLISH;
          this.snackBar.open('Publishing tour...', 'Close', {
            duration: 3000,
            panelClass: ['snackbar-info']
          });

          // startuj polling da čekaš finalni status
          this.pollTourStatus(tour);
        }
      }, 
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to publish tour.', 'Close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });

  } else {
    this.snackBar.open('Tour cannot be published. Check required fields, key points, and durations.', 'Close', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}


  pollTourStatus(tour: Tour) {
  const interval = setInterval(() => {
    this.tourService.getTourById(tour.id!).subscribe(updatedTour => {
      tour.status = updatedTour.status;
      if (tour.status === TourStatus.PUBLISHED) {
        tour.publishedAt = updatedTour.publishedAt;
        clearInterval(interval);
        this.snackBar.open('Tour successfully published!', 'Close', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      }
    });
  }, 2000); 
}*/


  archiveTour(tour: Tour) {
    this.tourService.updateTourStatus(tour.id!, TourStatus.ARCHIVED).subscribe({
      next: (response: UpdateTourStatusResponse) => {
        tour.status = TourStatus.ARCHIVED;

        if (response.updatedAt) {
          const ts = response.updatedAt as any; // gRPC Timestamp
          tour.archivedAt = new Date(ts.seconds * 1000 + ts.nanos / 1e6);
        }

        this.snackBar.open('Tour successfully archived!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to archive tour.', 'Close', {
          duration: 4000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
    });
  }




}