import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TourService } from 'src/app/services/tour.service';
import { Tour } from '../model/create-tour.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateReviewComponent } from '../create-review/create-review.component';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { Review } from '../model/review.model';

@Component({
  selector: 'app-single-tour',
  templateUrl: './single-tour.component.html',
  styleUrls: ['./single-tour.component.css']
})
export class SingleTourComponent implements OnInit {
  tour: Tour | null = null;
  loading: boolean = true;
  error: string | null = null;
  user: User | undefined;
  reviewsList: Review[] = [];  

  constructor(
    private route: ActivatedRoute,
    private tourService: TourService,
    private dialog: MatDialog,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Učitaj korisničke podatke
    this.authService.user$.subscribe(user => {
      this.user = user;
    });

    this.route.paramMap.subscribe(params => {
      const tourId = params.get('id');
      if (tourId) {
        this.loadTour(tourId);
      } else {
        this.error = 'Tour ID not provided';
        this.loading = false;
      }
    });
  }

  loadTour(id: string): void {
  this.loading = true;
  this.error = null;

  this.tourService.getTourById(id).subscribe({
    next: (tour) => {
      this.tour = tour;
        this.loading = false;

        if (this.tour && this.tour.id) {
          this.loadReviews(this.tour.id.toString());
        }

      },
      error: (err) => {
        this.loading = false;
        console.error('Error loading tour:', err);
      }
    });
  }

  loadReviews(tourId: string): void {
  this.tourService.getReviewsByTour(tourId).subscribe({
    next: (res: any) => {

      // Proveravamo da li je res niz ili objekat sa poljem reviews
      const rawReviews: any[] = Array.isArray(res) ? res : res.reviews || [];

      // Mapiramo svaki review na front-end model
      this.reviewsList = rawReviews.map(r => this.mapReviewFromBackend(r));
    },
    error: (err) => {
      console.error('Error loading reviews:', err);
      this.reviewsList = [];
    }
  });
}

  openReviewDialog(): void {
  this.authService.user$.subscribe(user => {
    console.log('Trenutni korisnik:', user);
    if (!user || !user.id || !user.username) {
      console.warn('Korisnik nije validan ili polja su prazna, preusmeravam na login.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.tour) {
      alert('Tura nije učitana');
      return;
    }

    const dialogRef = this.dialog.open(CreateReviewComponent, {
      width: '600px',
      data: {
        tourId: this.tour.id,
        touristId: user.id,
        touristName: `${user.username}`
      }
    });

    dialogRef.afterClosed().subscribe(savedReview => {
      if (savedReview) {
        alert('Recenzija je uspešno sačuvana!');
        this.reviewsList = [...this.reviewsList, savedReview];
        if (this.tour && this.tour.id) {
          this.loadReviews(this.tour.id.toString());
        }
      }
    });
  }).unsubscribe(); // ili pipe(take(1)) da ne zadrži subscription
}


  mapReviewFromBackend(r: any): Review {
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      tourist_id: r.tourist_id,
      tour_id: r.tour_id,
      visit_date: r.visit_date
        ? new Date(r.visit_date.seconds * 1000 + Math.floor(r.visit_date.nanos / 1000000))
        : new Date(),
      comment_date: r.comment_date
        ? new Date(r.comment_date.seconds * 1000 + Math.floor(r.comment_date.nanos / 1000000))
        : new Date(),
      images: r.images || [],
      tourist_name: r.tourist_name,
      tourist_image: r.tourist_image
    };
  }

}