import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/authservices';

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
  ): boolean {
    // Check if token exists and is not expired
    if (!this.authService.isLoggedIn || this.authService.isTokenExpired()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRole = route.data['role'];
    const userRole = this.authService.userRole;

    if (requiredRole && userRole !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (userRole) {
        case 'Admin':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'Doctor':
          this.router.navigate(['/doctor/dashboard']);
          break;
        case 'Patient':
          this.router.navigate(['/patient/doctors']);
          break;
        default:
          this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}