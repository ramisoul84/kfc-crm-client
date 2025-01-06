// core/interceptors/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, switchMap, tap, throwError, take } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthResponse } from '../models/auth';

let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Skip token for auth endpoints
    const isAuthRoute = req.url.includes('/auth/login') ||
        req.url.includes('/auth/refresh') ||
        req.url.includes('/auth/logout');

    if (token && !isAuthRoute) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(req).pipe(
        catchError(err => {
            if (err.status === 401 && !isAuthRoute && token) {
                if (isRefreshing) {
                    return refreshSubject.pipe(
                        filter(t => t !== null),
                        take(1), // Add this!
                        switchMap(t => {
                            const retryReq = req.clone({
                                setHeaders: { Authorization: `Bearer ${t}` }
                            });
                            return next(retryReq);
                        })
                    );
                }

                isRefreshing = true;
                refreshSubject.next(null);

                return authService.refreshToken().pipe(
                    tap((res: AuthResponse) => {
                        isRefreshing = false;
                        refreshSubject.next(res.access_token);
                    }),
                    switchMap((res: AuthResponse) => {
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${res.access_token}` }
                        });
                        return next(retryReq);
                    }),
                    catchError(refreshErr => {
                        isRefreshing = false;
                        refreshSubject.next(null);
                        authService.logout();
                        return throwError(() => refreshErr);
                    })
                );
            }

            return throwError(() => err);
        })
    );
};