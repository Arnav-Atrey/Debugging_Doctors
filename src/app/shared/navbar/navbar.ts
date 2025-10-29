import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CapitalizeNamePipe } from '../../pipes/capitalize-name.pipe';
import { AuthService } from '../../services/authservices';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
  standalone: true,
  imports: [CommonModule, RouterLink, CapitalizeNamePipe]
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false;
  userRole: string = '';
  userEmail: string = '';
  userFullName: string = '';

  constructor(private router: Router, private authService: AuthService) {
    // Update navbar when route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
    });

    // Subscribe to current user changes
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userRole = user.role;
        this.userEmail = user.email;
        this.userFullName = user.fullName || '';
      }
    });
  }

  ngOnInit(): void {
    this.checkLoginStatus();
  }

  checkLoginStatus(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedIn = true;
      const userData = JSON.parse(user);
      this.userRole = userData.role;
      this.userEmail = userData.email;
      this.userFullName = userData.fullName || '';
    } else {
      this.isLoggedIn = false;
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }

  // checkLoginStatus(): void {
  //   this.isLoggedIn = this.authService.isLoggedIn;
  //   const user = this.authService.currentUserValue;
  //   if (user) {
  //     this.userRole = user.role;
  //     this.userEmail = user.email;
  //     this.userFullName = user.fullName || '';
  //   }
  // }

  // logout(): void {
  //   this.authService.logout();
  // }

  getProfileRoute(): string {
    if (this.userRole === 'Patient') {
      return '/patient/profile';
    } else if (this.userRole === 'Doctor') {
      return '/doctor/profile';
    }else if (this.userRole === 'Admin') {
    return '/admin/profile';  // Add this line
    }
    return '/profile';
  }
}