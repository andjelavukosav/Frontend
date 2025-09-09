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
    next: (res: any) => {
      console.log("📌 Odgovor sa servera:", res);

      const userList = res.users ?? []; // uzmi res.users, ako postoji
      if (this.user) {
        this.users = userList.filter((u: User) => u.id !== this.user!.id);
      } else {
        this.users = userList;
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
