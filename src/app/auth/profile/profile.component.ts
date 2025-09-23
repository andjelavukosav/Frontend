// profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserProfile } from '../model/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user: UserProfile | null = null;
  isLoading = true;
  isEditing = false;
  profileForm!: FormGroup;
  private authSubscription: Subscription | null = null;
  isOwnProfile = true; // Da li je korisnik na svom profilu

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.checkAuthAndLoadProfile();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  initForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      biography: [''],
      motto: ['']
    });
  }

  checkAuthAndLoadProfile(): void {
    // Proverimo prvo da li je korisnik uopšte ulogovan
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.user$.getValue();
    const username = currentUser.username;

    if (username) {
      this.isLoading = true;
      this.authService.getUserProfile(username).subscribe({
        next: (userData) => {
          this.user = userData;
          this.populateForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Greška pri učitavanju profila:', error);
          this.isLoading = false;
          alert('Došlo je do greške pri učitavanju profila.');
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  populateForm(): void {
    if (this.user) {
      this.profileForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        biography: this.user.biography,
        motto: this.user.motto
      });
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.populateForm(); // Vrati originalne vrednosti
  }

  onSave(): void {
    if (this.profileForm.invalid || !this.user) {
      return;
    }

    const formData = this.profileForm.value;
    const updateData = {
      username: this.user.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      profileImage: this.user.profileImage,
      biography: formData.biography,
      motto: formData.motto
    };

    this.isLoading = true;
    this.authService.updateUserProfile(updateData).subscribe({
      next: (response) => {
        console.log('Profil uspešno ažuriran:', response);
        this.isEditing = false;
        this.isLoading = false;
        
        // Ažuriramo lokalne podatke
        if (this.user) {
          this.user.firstName = formData.firstName;
          this.user.lastName = formData.lastName;
          this.user.biography = formData.biography;
          this.user.motto = formData.motto;
        }
        
        alert('Profil je uspešno sačuvan!');
      },
      error: (error) => {
        console.error('Greška pri ažuriranju profila:', error);
        this.isLoading = false;
        alert('Došlo je do greške pri čuvanju profila.');
      }
    });
  }

  getRoleDisplayName(): string {
    const roleMap: { [key: string]: string } = {
      'tourist': 'Turista',
      'guide': 'Vodič',
      'admin': 'Administrator'
    };
    return roleMap[this.user?.role || 'tourist'] || this.user?.role || '';
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
  
}

  getAvatarUrl(): string {
  if (this.user?.profileImage) {
    return this.user.profileImage;
  }

  let name = 'User';

  if (this.user) {
    if (this.user.firstName?.trim() || this.user.lastName?.trim()) {
      name = `${this.user.firstName || ''}+${this.user.lastName || ''}`;
    } else {
      name = this.user.username || 'User';
    }
  }

  return `https://ui-avatars.com/api/?name=${name}&size=200&background=random&color=fff&bold=true`;
}

  goToHome(): void {
      this.router.navigate(['/']); 
  }
}