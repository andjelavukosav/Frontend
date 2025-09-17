import { AfterViewInit, Component, Inject } from '@angular/core';
import { KeyPoint } from '../model/keypoint.model';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Tour } from '../model/create-tour.model';
import * as L from 'leaflet';
import { TourService } from 'src/app/services/tour.service';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-key-point-details-dialog',
  templateUrl: './key-point-details-dialog.component.html',
  styleUrls: ['./key-point-details-dialog.component.css']
})
export class KeyPointDetailsDialogComponent implements AfterViewInit{

  tour: Tour;
  keyPoint: KeyPoint;
  map!: L.Map;
  marker!: L.Marker;
  previewImage: string | ArrayBuffer | null = null;
  selectedFile: File | null = null
  currentKeyPoint : KeyPoint; 

  constructor(
    private tourService: TourService,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {tour: Tour, keyPoint: KeyPoint},
    private dialogRef: MatDialogRef<KeyPointDetailsDialogComponent>
  ) {
    this.tour = data.tour;
    this.keyPoint = {...data.keyPoint} //pravi se kopija, da ne bi pokazivali na isti objekat u memoriji
    this.currentKeyPoint = {...data.keyPoint}
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(){
    this.map = L.map('keypoint-map').setView([this.keyPoint.latitude, this.keyPoint.longitude], 15);

     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // draggable marker
    this.marker = L.marker([this.keyPoint.latitude, this.keyPoint.longitude], { draggable: true}).addTo(this.map);

    // update keyPoint koordinata da prevlacenje
    this.marker.on('dragend', (e: L.DragEndEvent) => {
      const latlng = e.target.getLatLng();
      this.keyPoint.latitude = latlng.lat;
      this.keyPoint.longitude = latlng.lng;
    });
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if(!input.files?.length) return;

    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result;
    reader.readAsDataURL(this.selectedFile);

  }

  hasChanges(): boolean{
    return JSON.stringify(this.keyPoint) !== JSON.stringify(this.currentKeyPoint) ||
            this.selectedFile !== null;
  }

  save() {

    if(!this.hasChanges()) return;

    if (this.selectedFile) {
      const formData = new FormData();

      formData.append('id', this.keyPoint.id!);
      formData.append('name', this.keyPoint.name);
      formData.append('description', this.keyPoint.description);
      formData.append('latitude', this.keyPoint.latitude.toString());
      formData.append('longitude', this.keyPoint.longitude.toString());
      formData.append('order', this.keyPoint.order.toString());
      formData.append('file', this.selectedFile);

      this.tourService.updateKeyPointMultipart(this.tour.id!, formData).subscribe({
        next: updatedKP => this.dialogRef.close(updatedKP),
        error: err => console.error('Greška pri update (multipart):', err)
      });
    } else {
      this.tourService.updateKeyPoint(this.keyPoint, this.tour.id!).subscribe({
        next: updatedKP => this.dialogRef.close(updatedKP),
        error: err => console.error('Greška pri update:', err)
      });
    }
  }

  deleteKeyPoint() {

    const confirmRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this key point?'}
    });

    confirmRef.componentInstance.confirmed.subscribe((result: boolean) => {
      if(result){
        if (!this.data.tour || !this.data.keyPoint) return;

        const tourId = this.data.tour.id;
        const keyPointId = this.data.keyPoint.id;

        // Poziv servisa
        this.tourService.deleteKeyPoint(tourId!, keyPointId!).subscribe({
          next: () => {
            // Obavijesti roditeljsku komponentu da je obrisano
            this.dialogRef.close({ deleted: true, keyPointId });
          },
          error: err => console.error('Failed to delete key point', err)
        });
      }
    });
    
  }

  cancel() {
    this.dialogRef.close();
  }

}
