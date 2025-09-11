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
    price: 0
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

  this.tourService.getAuthorTours(this.user.id).subscribe({
    next: (data) => this.tours = data,
    error: (err) => console.error(err)
  });
}


  createTour(): void {
  // Pretvori string tagova u niz
  this.newTour.tags = this.tagsInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t !== ''); // izbacujemo prazne tagove

  console.log('Nova tura:', this.newTour);
  this.newTour.authorId = this.user?.id;
  // Poziv servisa za backend
  this.tourService.createTour(this.newTour).subscribe({
    next: (createdTour) => {
      // Dodaj novu turu u listu (backend može vratiti sa ID-jem)
      this.tours.push(createdTour);

      // Resetuj formu
      this.newTour = {
        name: '',
        description: '',
        difficulty: '',
        tags: [],
        status: 'draft',
        price: 0
      };
      this.tagsInput = '';
    },
    error: (err) => {
      console.error('Greška pri kreiranju ture:', err);
    }
  });
}

  
}
