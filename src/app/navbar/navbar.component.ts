import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { TourService } from '../services/tour.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  activeTourExecutionId: string | null = null;

   constructor(public authService: AuthService,
     private router: Router,
     private tourService: TourService) {}


  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user?.role === 'tourist') {
        this.tourService.getActiveTour(user.id).subscribe(activeTour => {
          this.activeTourExecutionId = activeTour?.executionId || null;
        });
      }
    });
  }

   
  logout() {
    this.authService.logout();
    this.router.navigate(['/']); // ili neka početna stranica
    this.authService.user$.next({username: "", id: '', email: "", role: "" });
    console.log('User: ', this.authService.user$.value)
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCurrentUsername(): string {
    return this.authService.user$.getValue().username;
  }
}
