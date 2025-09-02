import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  user: User | null = null;
  showUsersTable = false;
  users: User[] = [];

  constructor(private authService: AuthService, private http: HttpClient) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(currentUser => {
      this.user = currentUser;
    });
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (res) => {
        if (this.user) {  // ✅ proverimo da user nije null
          this.users = res.filter(u => u.id !== this.user!.id);
        } else {
          this.users = res;
        }
        this.showUsersTable = true;
      },
      error: (err) => {
        console.error(err);
        alert('Failed to load users');
      }
    });
  }



}
