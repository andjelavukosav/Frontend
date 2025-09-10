import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Login } from '../model/login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

login(): void {
  const login: Login = {
    username: this.loginForm.value.username || "",
    password: this.loginForm.value.password || "",
  };

  if (this.loginForm.valid) {
    this.authService.login(login).subscribe({
      next: () => {
        // Dohvati korisnika iz AuthService
        const user = this.authService.user$.getValue();

        if (user.role === 'admin') {
          // Ako je admin, preusmeri na adminHome
          this.router.navigate(['/adminHome']);
        } else {
          // Inače, preusmeri na glavnu stranicu
          this.router.navigate(['/']);
        }
        console.log('Logged in user: ', user)

      },
      error: (err) => {
       let message = 'Login failed. Please check your credentials.'
      
        if (err.error && err.error.error) {
        switch (err.status) {
          case 400:
            message = 'Invalid request. Please try again.';
            break;
          case 401:
            message = 'Username or password is incorrect.';
            break;
          case 403:
            message = 'Your account has been blocked. Contact support.';
            break;
          case 500:
            message = 'Server error. Please try later.';
            break;
          default:
            message = err.error.error;
        }
      }
      alert(message);
    }
    });
  }
}

}
