import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    const droit = localStorage.getItem('droit');

    if (!token) {
      // If no token, redirect to login
      this.router.navigate(['/login']);
      return false;
    }

    if (droit !== null && parseInt(droit, 10) === 0) {
      // If droit is 0, redirect to the cat page
      this.router.navigate(['/chat']);
      return false;
    }

    // If droit is 1, allow access
    if (droit !== null && parseInt(droit, 10) === 1) {
      return true;
    }

    // If no valid droit found, redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
