import { Component, OnInit } from '@angular/core';
import { Tour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-create-tour',
  templateUrl: './create-tour.component.html',
  styleUrls: ['./create-tour.component.css']
})
export class CreateTourComponent implements OnInit {
  tours: Tour[] = [];
  user: User | null = null;
  
  newTour: Tour = {
    name: '',
    description: '',
    difficulty: '',
    tags: [],
    status: 'draft',
    price: 0,
    keyPoints: []   // ✅
  };

  tagsInput: string = '';   // 👈 ovde čuvaš unos korisnika

  constructor(private tourService: TourService,
              private authService: AuthService, 
    
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(currentUser => {
      this.user = currentUser;
    });
    this.loadTours();
  }

  loadTours(): void {
  if (!this.user) return;

  /*this.tourService.getAuthorTours(this.user.id).subscribe({
    next: (data) => this.tours = data,
    error: (err) => console.error(err)
  });*/
}


  // ... (your existing code) ...

createTour(): void {
  // Convert tags string to an array
  this.newTour.tags = this.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== ''); // Remove empty tags

  console.log('New tour:', this.newTour);
  this.newTour.authorId = this.user?.id;

  // Call the backend service
  this.tourService.createTour(this.newTour).subscribe({
    next: (createdTour) => {
      // Add the new tour to the list
      this.tours.push(createdTour);

      // Reset the form
      this.newTour = {
        name: '',
        description: '',
        difficulty: '',
        tags: [],
        status: 'draft',
        price: 0,
        keyPoints: []
      };
      this.tagsInput = '';

      // Success alert
      alert('Tour successfully created!');
    },
    error: (err) => {
      console.error('Error creating tour:', err);

      // Failure alert
      alert('Failed to create tour. Please try again.');
    }
  });
}

  
}
