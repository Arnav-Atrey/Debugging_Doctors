import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = localStorage.getItem('user');
    
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    const userData = JSON.parse(user);
    const requiredRole = route.data['role'];

    if (requiredRole && userData.role !== requiredRole) {
      // Redirect to appropriate dashboard
      switch (userData.role) {
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