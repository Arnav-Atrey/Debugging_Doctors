import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CapitalizeNamePipe } from '../../pipes/capitalize-name.pipe';

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

  constructor(private router: Router) {
    // Update navbar when route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkLoginStatus();
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

  getProfileRoute(): string {
    if (this.userRole === 'Patient') {
      return '/patient/profile';
    } else if (this.userRole === 'Doctor') {
      return '/doctor/profile';
    }
    return '/profile';
  }

  logout(): void {
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.router.navigate(['/login']);
  }
}