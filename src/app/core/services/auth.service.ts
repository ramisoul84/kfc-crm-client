// core/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Manager } from '../models/manager';
import { AuthResponse } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentManagerSubject = new BehaviorSubject<Manager | null>(null);
  public currentManager$ = this.currentManagerSubject.asObservable();

  private readonly api = environment.crmUrl;
  private readonly tokenKey = 'kfc_token';
  private readonly managerKey = 'kfc_manager';
  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    if (!this.isBrowser) return;

    const token = this.getToken();
    const manager = this.getStoredManager();

    if (token && manager) {
      if (this.isTokenExpired(token)) {
        this.clearAuth();
        return;
      }
      this.currentManagerSubject.next(manager);
    } else{
      this.clearAuth()
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.api}/auth/login`,
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.setToken(response.access_token);
        this.setStoredManager(response.manager);
        this.currentManagerSubject.next(response.manager);
      }),
      catchError(this.handleError)
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<{ message: string }>(
      `${this.api}/auth/change-password`,
      { old_password: oldPassword, new_password: newPassword }
    ).pipe(
      tap(() => {
        const manager = this.getCurrentManager();
        if (manager) {
          manager.password_updated = true;
          this.setStoredManager(manager);
          this.currentManagerSubject.next(manager);
        }
      }),
      catchError(this.handleError)
    );
  }


  logout(): void {
    if (this.isBrowser) {
      // Attempt server logout
      this.http.post(`${this.api}/auth/logout`, {}, { withCredentials: true }).subscribe({
        next: () => this.clearAuth(),
        error: () => this.clearAuth()
      });
    }
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.api}/auth/refresh`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this.setToken(response.access_token);
        if (response.manager) {
          this.setStoredManager(response.manager);
          this.currentManagerSubject.next(response.manager);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        this.clearAuth();
        return throwError(() => error);
      })
    );
  }

  // Token Management
  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentManager(): Manager | null {
    if (!this.isBrowser) return null;
    return this.currentManagerSubject.value || this.getStoredManager();
  }

  updateCurrentManager(partial: Partial<Manager>): void {
    const user = this.getCurrentManager();
    if (user) {
      const updated = { ...user, ...partial };
      localStorage.setItem(this.managerKey, JSON.stringify(updated));
      this.currentManagerSubject.next(updated);
    }
  }

  /*
  getProfile(): Observable<Manager> {
    return this.http.get<{ manager: Manager }>(`${this.api}/auth/me`).pipe(
      map(response => response.manager || response),
      tap(manager => {
        if (manager) {
          this.setStoredManager(manager);
          this.currentManagerSubject.next(manager);
        }
      }),
      catchError(this.handleError)
    );
  }
*/
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasRole(roles: string[]): boolean {
    const user = this.getCurrentManager();
    return user ? roles.includes(user.role) : false;
  }

  isPasswordUpdated(): boolean {
    const manager = this.getCurrentManager();
    return manager?.password_updated ?? true;
  }

  // Private helper methods
  private getStoredManager(): Manager | null {
    if (!this.isBrowser) return null;

    const userJson = localStorage.getItem(this.managerKey);
    if (!userJson) return null;

    try {
      return JSON.parse(userJson);
    } catch {
      localStorage.removeItem(this.managerKey);
      return null;
    }
  }

  private setStoredManager(manager: Manager): void {
    if (this.isBrowser) {
      localStorage.setItem(this.managerKey, JSON.stringify(manager));
    }
  }


  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.managerKey);
    }
    this.currentManagerSubject.next(null);
    this.router.navigate(['/login']);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch {
      return true;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 401) {
      this.clearAuth();
      errorMessage = 'Your session has expired. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 422) {
      errorMessage = error.error?.message || 'Validation failed. Please check your input.';
    } else if (error.status === 429) {
      errorMessage = 'Too many requests. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}