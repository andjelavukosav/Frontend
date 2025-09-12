import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/admin';

  constructor(private http: HttpClient) { }

  
  blockUser(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/block/${userId}`, {});
  }

  unblockUser(userId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/unblock/${userId}`, {});
  }
}
