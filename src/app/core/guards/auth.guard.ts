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
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const manager = this.authService.getCurrentManager();
    if (manager) {
      if (!manager.password_updated) {
        return this.router.createUrlTree(['/force-change-password']);
      }
      if (!manager.is_active) {
        return this.router.createUrlTree(['/awaiting-activation']);
      }
    }

    return true;
  }
}
