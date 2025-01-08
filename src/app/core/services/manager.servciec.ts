// core/services/manager.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProfileData } from '../models/manager';

@Injectable({ providedIn: 'root' })
export class ManagerService {
    private readonly api = environment.crmUrl;
    private http = inject(HttpClient);

    getProfile(): Observable<ProfileData> {
        return this.http.get<{ manager: ProfileData }>(`${this.api}/auth/me`).pipe(
            map(response => response.manager),
            catchError(this.handleError)
        );
    }

    updateProfile(data: { name?: string; email?: string; city_id?: string }): Observable<ProfileData> {
        return this.http.patch<{ manager: ProfileData }>(`${this.api}/auth/profile`, data).pipe(
            map(response => response.manager),
            catchError(this.handleError)
        );
    }

    changePassword(oldPassword: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.api}/auth/change-password`, {
            old_password: oldPassword,
            new_password: newPassword,
        }).pipe(
            catchError(this.handleError)
        );
    }

    // Get all managers without pagination (for dropdowns, exports, etc.)
    getAllManagers(): Observable<ProfileData[]> {
        return this.http.get<{ managers: ProfileData[] }>(`${this.api}/managers`).pipe(
            map(response => response.managers),
            catchError(this.handleError)
        );
    }

    

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unexpected error occurred';

        if (error.status === 0) {
            errorMessage = 'Network error. Please check your connection.';
        } else if (error.status === 401) {
            errorMessage = 'Session expired. Please login again.';
        } else if (error.status === 400) {
            errorMessage = error.error?.error || 'Invalid request';
        } else if (error.status === 409) {
            errorMessage = 'Email already in use';
        } else if (error.status === 422) {
            errorMessage = error.error?.error || 'Validation failed';
        } else if (error.error?.error) {
            errorMessage = error.error.error;
        }

        return throwError(() => new Error(errorMessage));
    }
}