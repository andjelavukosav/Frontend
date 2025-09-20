import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { TokenStorage } from '../auth/jwt/token.service';
import { Router } from '@angular/router';
import { User } from '../auth/model/user.model';
import { AuthenticationResponse } from '../auth/model/authentication-response.model';
import { Registration } from '../auth/model/registration.model';
import { Login } from '../auth/model/login.model';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UpdateProfileRequest, UserProfile } from '../auth/model/user-profile.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/users'; // Go backend endpoint
  user$ = new BehaviorSubject<User>({username: "", id: '', email: "", role: "" });

  constructor(private http: HttpClient,
    private router: Router,
    private tokenStorage: TokenStorage
  ) {}

   register(registration: Registration): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(`${this.apiUrl}/register`, registration)
      .pipe(
      tap((authenticationResponse) => {
        this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
        this.setUser();
      })
    );
  }

  login(login: Login): Observable<AuthenticationResponse> {
    return this.http
      .post<AuthenticationResponse>(this.apiUrl + '/login', login)
      .pipe(
        tap((authenticationResponse) => {
          this.tokenStorage.saveAccessToken(authenticationResponse.accessToken);
          this.setUser();
        })
      );
  }

   logout(): void {
    this.router.navigate(['/home']).then(_ => {
      this.tokenStorage.clear();
      this.user$.next({username: "", id: '', email: "", role: "" });
      }
    );
  }

  checkIfUserExists(): void {
    const accessToken = this.tokenStorage.getAccessToken();
    if (accessToken == null) {
      return;
    }
    this.setUser();
  }

  private setUser(): void {
    const jwtHelperService = new JwtHelperService();
    const accessToken = this.tokenStorage.getAccessToken() || "";
    const user: User = {
      id: jwtHelperService.decodeToken(accessToken).id,
      username: jwtHelperService.decodeToken(accessToken).username,
      email: jwtHelperService.decodeToken(accessToken).email,
      role: jwtHelperService.decodeToken(accessToken)[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ],
    };
    this.user$.next(user);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:8080/admin/users/all');
  }

 // U Angular servisu
  getUserProfile(username: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile/${username}`);
  }

  updateUserProfile(updateRequest: UpdateProfileRequest): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/profile/${updateRequest.username}`,
      updateRequest
    );
  }

  isLoggedIn(): boolean {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return false;
    
    try {
      const jwtHelper = new JwtHelperService();
      return !jwtHelper.isTokenExpired(token);
    } catch (error) {
      return false;
    }
  }
/*
  uploadProfileImage(username: string, file: File): Observable<{ profileImageUrl: string }> {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('file', file, file.name);

  return this.http.post<{ profileImageUrl: string }>(
    'http://localhost:8080/users/profile/upload-image',
    formData
  );
}
*/
}
