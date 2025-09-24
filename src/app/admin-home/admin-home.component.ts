import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/auth/model/user.model';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../services/admin.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit {
  user: User | null = null;
  showUsersTable = false;
  users: User[] = [];

  confirmingUser: User | null = null;
  confirmMessage: string = '';

  constructor(
    private authService: AuthService, 
    private http: HttpClient,
    private adminService: AdminService,
    private dialog: MatDialog
  ) {}

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


  /*confirmToggleBlock(user: User): void {
    this.confirmingUser = user;
    this.confirmMessage = user.isBlocked
      ? `Are you sure you want to unblock ${user.username}?`
      : `Are you sure you want to block ${user.username}?`;
  }

  onDialogConfirmed(confirmed: boolean): void {
    if(!this.confirmingUser) return;

     if (confirmed) {
        const user = this.confirmingUser;

        if (user.isBlocked) {
            this.adminService.unblockUser(user.id).subscribe(() => {
                user.isBlocked = false;
            });
        } else {
            this.adminService.blockUser(user.id).subscribe(() => {
                user.isBlocked = true;
            });
        }
    }

    this.confirmingUser = null; 
}*/


confirmToggleBlock(user: User): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      message: user.isBlocked
        ? `Are you sure you want to unblock ${user.username}?`
        : `Are you sure you want to block ${user.username}?`
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      if (user.isBlocked) {
        this.adminService.unblockUser(user.id).subscribe(() => {
          user.isBlocked = false;
        });
      } else {
        this.adminService.blockUser(user.id).subscribe(() => {
          user.isBlocked = true;
        });
      }
    }
  });
}

isCurrentUser(u: User): boolean {
  return !!this.user && u.id === this.user.id;
}


}
