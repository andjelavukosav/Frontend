import { Component, OnInit } from '@angular/core';
import { Tour } from '../model/create-tour.model';
import { TourService } from 'src/app/services/tour.service';
import { User } from 'src/app/auth/model/user.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-details-tour',
  templateUrl: './details-tour.component.html',
  styleUrls: ['./details-tour.component.css']
})
export class DetailsTourComponent implements OnInit{
    tours: Tour[] = [];
    user: User | null = null;
  
    constructor(private tourService: TourService,
                private authService:AuthService
    ){}

    ngOnInit(): void {
      this.authService.user$.subscribe(currentUser => {
      this.user = currentUser;
    });
      this.loadTours();
    }

   loadTours(): void {
    if (!this.user) return;

    this.tourService.getAuthorTours(this.user.id).subscribe({
      next: (tours) => this.tours = tours,  // više ne treba data.tours
      error: (err) => console.error(err)
    });
  }


}
