import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Manager } from '../models/manager';
import { AuthResponse } from '../models/auth';



@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentManagerSubject = new BehaviorSubject<Manager | null>(null);
  public currentManager$ = this.currentManagerSubject.asObservable();

  private api = environment.crmUrl;
  private tokenKey = 'kfc_token';
  private userKey = 'kfc_user';

  constructor(private http: HttpClient, private router: Router) {
    const stored = this.getCurrentManager();
    if (stored) {
      this.currentManagerSubject.next(stored);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password }, { withCredentials: true }
    ).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        localStorage.setItem(this.userKey, JSON.stringify(res.manager));
        this.currentManagerSubject.next(res.manager);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.api}/auth/change-password`, { old_password: oldPassword, new_password: newPassword });
  }

  getProfile(): Observable<Manager> {
    return this.http.get<Manager>(`${this.api}/auth/me`);
  }

  updateProfile(data: { name?: string; email?: string }): Observable<Manager> {
    return this.http.patch<Manager>(`${this.api}/auth/profile`, data).pipe(
      tap(manager => {
        this.updateCurrentUser(manager);
      })
    );
  }

  updateCurrentUser(partial: Partial<Manager>): void {
    const user = this.getCurrentManager();
    if (user) {
      const updated = { ...user, ...partial };
      localStorage.setItem(this.userKey, JSON.stringify(updated));
      this.currentManagerSubject.next(updated);
    }
  }

  logout(): void {
    this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }).subscribe({
      error: () => {}
    });
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentManagerSubject.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/auth/refresh`, {}, { withCredentials: true });
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentManager(): Manager | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentManager();
    return user ? roles.includes(user.role) : false;
  }
}