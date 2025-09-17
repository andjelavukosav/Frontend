import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { KeyPoint, KeyPointDialogData } from '../model/keypoint.model';
import { TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-create-keypoint-dialog',
  templateUrl: './create-keypoint-dialog.component.html',
  styleUrls: ['./create-keypoint-dialog.component.css']
})
export class CreateKeypointDialogComponent {

  keyPointForm: FormGroup;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    public dialogRef: MatDialogRef<CreateKeypointDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: KeyPointDialogData
  ) {
    this.keyPointForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      order: [data.keyPoint?.order ?? data.order ?? 1, [Validators.required, Validators.min(1)]]
    });
  }

  onFileSelected(event: Event){
    const input = event.target as HTMLInputElement;
    if(input.files && input.files.length > 0){
      this.selectedFile = input.files[0];
    }
  }

  save() {
    if (this.keyPointForm.valid) {

      if (!this.selectedFile) {
        alert('Please select an image!');
        return;
      }
      // Kreiraj FormData za slanje na backend
      const formData = new FormData();
      formData.append('tourId', this.data.tourId);
      formData.append('name', this.keyPointForm.get('name')?.value);
      formData.append('description', this.keyPointForm.get('description')?.value);
      formData.append('order', this.keyPointForm.get('order')?.value.toString());
      formData.append('latitude', this.data.latitude.toString());
      formData.append('longitude', this.data.longitude.toString());
      if (this.selectedFile) {
        formData.append('file', this.selectedFile);
      }

      this.tourService.addKeyPoint(formData).subscribe({
        next: (keyPoint) => {
          // Zatvori dijalog i proslijedi key point nazad
          this.dialogRef.close(keyPoint);
        },
        error: (err) => {
          console.error('Error adding key point', err);
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close();
  }

}
