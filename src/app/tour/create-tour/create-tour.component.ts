import { Component, OnDestroy, OnInit } from '@angular/core';
import { CreateTourRequest, Tour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { TourStatus } from '../model/enum/tour-status.enum';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-tour',
  templateUrl: './create-tour.component.html',
  styleUrls: ['./create-tour.component.css']
})
export class CreateTourComponent implements OnInit, OnDestroy{
  tours: Tour[] = [];
  user: User | null = null;
  
  newTour: Tour = {
    name: '',
    description: '',
    difficulty: '',
    tags: [],
    status: TourStatus.DRAFT,
    price: 0,
    keyPoints: []   
  };

  private destroy$ = new Subject<void>(); 

  tagsInput: string = ''; // cuva se unos korisnika

  constructor(
    private tourService: TourService,
    private authService: AuthService, 
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.user$
    .pipe(takeUntil(this.destroy$))
    .subscribe(currentUser => {
      this.user = currentUser;
    });
  }

createTour(): void {
  const request: CreateTourRequest = {
    name: this.newTour.name,
    description: this.newTour.description,
    difficulty: this.newTour.difficulty,
    tags: this.tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== ''),
    authorId: this.user?.id!,
  };

  console.log('CreateTourRequest:', request);


  // Call the backend service
  this.tourService.createTour(request).subscribe({
    next: (createdTour) => {
      // Add the new tour to the list
      this.tours.push(createdTour);

      // Reset the form
      this.newTour = {
        name: '',
        description: '',
        difficulty: '',
        tags: [],
        status: TourStatus.DRAFT,
        price: 0,
        keyPoints: []
      };
      this.tagsInput = '';

      // Success 
      this.snackBar.open('Tour successfuly created.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      this.router.navigate(['/tours'], {queryParams: { highlight: createdTour.id } });
    },
    error: (err) => {
      console.error('Error creating tour:', err);

      // Failure
      this.snackBar.open('Failed to create tour. Please try again.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    }
  });
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

  
}
