import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PasswordUpdateGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        const manager = this.authService.getCurrentManager();

        // If no manager data, redirect to login
        if (!manager) {
            return this.router.createUrlTree(['/login']);
        }

        // Only allow access to force-change-password if password hasn't been updated
        // If password is already updated, redirect to dashboard
        if (manager.password_updated) {
            return this.router.createUrlTree(['/dashboard']);
        }

        // Password hasn't been updated, allow access
        return true;
    }
}