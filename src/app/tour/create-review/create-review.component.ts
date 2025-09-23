import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Review } from '../model/review.model';
import { TourService } from 'src/app/services/tour.service';

@Component({
  selector: 'app-create-review',
  templateUrl: './create-review.component.html',
  styleUrls: ['./create-review.component.css']
})
export class CreateReviewComponent {
  reviewForm: FormGroup;
  maxImages = 5;
  hoverRating: number = 0;
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    public dialogRef: MatDialogRef<CreateReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      tourId: string, 
      touristId: string, 
      touristName: string 
    }
  ) {
    this.reviewForm = this.createForm();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
      images: this.fb.array([])
    });
  }

  get images(): FormArray {
    return this.reviewForm.get('images') as FormArray;
  }

  onImageSelected(event: any): void {
  const files = event.target.files;
  if (files && files.length > 0 && this.selectedFiles.length < this.maxImages) {
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Image is too large. Maximum size is 5MB.');
      return;
    }
    this.selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.images.push(this.fb.control(e.target.result));
    };
    reader.readAsDataURL(file);
  }
}


  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) return;

    const formData = new FormData();
    formData.append('rating', this.reviewForm.value.rating);
    formData.append('comment', this.reviewForm.value.comment);
    formData.append('tourist_id', this.data.touristId);
    formData.append('tour_id', this.data.tourId);
    formData.append('tourist_name', this.data.touristName);

    // datum možeš poslati kao string
    formData.append('visit_date', new Date().toISOString());
    formData.append('comment_date', new Date().toISOString());

    // Dodavanje fajlova
    this.selectedFiles.forEach((file: File) => {
      formData.append('images', file);
    });

    this.tourService.createReview(formData).subscribe({
      next: (savedReview) => {
        this.dialogRef.close(savedReview);
      },
      error: (err) => {
        console.error('Greška pri čuvanju recenzije:', err);
        alert(`Došlo je do greške: ${err.error?.error || err.message}`);
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  getRatingStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  setRating(rating: number): void {
    this.reviewForm.patchValue({ rating });
    this.hoverRating = 0;
  }

  onStarHover(star: number): void {
    this.hoverRating = star;
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }

  shouldShowActive(star: number): boolean {
    if (this.hoverRating > 0) {
      return star <= this.hoverRating;
    }
    return star <= (this.reviewForm.get('rating')?.value || 0);
  }
}