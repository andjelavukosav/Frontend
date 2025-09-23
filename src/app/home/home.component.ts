import { Component, OnInit } from '@angular/core';
import { TourService } from '../services/tour.service';
import { Tour } from '../tour/model/create-tour.model';

// Prošireni interfejs sa dodatnim poljima za template
interface TourWithComputed extends Tour {
  difficultyText: string;
  firstImage: string;
  truncatedDescription: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  tours: TourWithComputed[] = []; // Koristite prošireni interfejs
  loading = true;

  constructor(private tourService: TourService) { }

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    console.log('Loading tours...');
    this.tourService.getAllTours().subscribe({
      next: (tours: Tour[]) => {
        console.log('Tours received:', tours);
        
        // Mapirajte ture sa precomputed vrednostima
        this.tours = tours.map(tour => this.enrichTourWithComputedValues(tour));
        
        this.loading = false;
        console.log('Number of tours:', this.tours.length);
        console.log('First tour with computed values:', this.tours[0]);
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.loading = false;
      }
    });
  }

  // Metoda za dodavanje computed vrednosti turi
  private enrichTourWithComputedValues(tour: Tour): TourWithComputed {
    return {
      ...tour,
      difficultyText: this.getDifficultyText(tour.difficulty),
      firstImage: this.getFirstImage(tour),
      truncatedDescription: this.truncateDescription(tour.description)
    };
  }

  // Ostale metode ostaju iste...
  getDifficultyText(difficulty: string): string {
    const difficultyMap: { [key: string]: string } = {
      'EASY': 'Lako',
      'MEDIUM': 'Srednje',
      'HARD': 'Teško',
      'EXTREME': 'Ekstremno'
    };
    return difficultyMap[difficulty] || difficulty;
  }

  getFirstImage(tour: Tour): string {
    if (!tour.keyPoints || tour.keyPoints.length === 0) {
      return 'assets/images/default-tour.jpg';
    }
    
    const keyPointWithImage = tour.keyPoints.find(kp => kp.imageURL);
    return keyPointWithImage?.imageURL || 'assets/images/default-tour.jpg';
  }

  truncateDescription(description: string, maxLength: number = 120): string {
    if (!description) return 'Nema opisa';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  trackByTourId(index: number, tour: TourWithComputed): string {
    return tour.id || index.toString();
  }
}