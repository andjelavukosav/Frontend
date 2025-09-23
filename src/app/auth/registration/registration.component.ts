import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Registration } from '../model/registration.model';
import { Router } from '@angular/router'; // <-- import Router

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  user: Registration = {
    username: '',
    password: '',
    email: '',
    role: ''  // Default role, user can select it
  };

  constructor(
    private authService: AuthService,
    private router: Router // <-- injektuj Router
  ) {}

  onSubmit() {
    console.log('User data submitted:', this.user);

    this.authService.register(this.user).subscribe({
      next: (res) => {
        console.log(res);
        // Show success alert
        alert('You have successfully registered!');
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error(err);
        // Show error alert
        alert('An error occurred during registration. Please try again.');
      }
    });
  }
}
