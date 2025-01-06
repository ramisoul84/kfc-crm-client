// core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // 2. Get manager data
    const manager = this.authService.getCurrentManager();

    // 3. If no manager data (corrupted state), force logout
    if (!manager) {
      this.authService.logout();
      return this.router.createUrlTree(['/login']);
    }

    // 4. Check if account is active
    if (!manager.is_active) {
      this.authService.logout();
      return this.router.createUrlTree(['/login'], {
        queryParams: { error: 'account_inactive' }
      });
    }

    // 5. Check if password needs to be updated
    // Skip this check if we're already going to force-change-password
    const isForceChangePasswordRoute = state.url.includes('/force-change-password');
    if (!manager.password_updated && !isForceChangePasswordRoute) {
      return this.router.createUrlTree(['/force-change-password']);
    }

    return true;
  }
}