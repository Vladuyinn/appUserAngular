import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service"; // Import your service
import { Router } from "@angular/router"; // Import Router for redirection
import { MatSnackBar } from "@angular/material/snack-bar"; // For pop-up notification

@Component({
  selector: "app-connexion",
  templateUrl: "./connexion.component.html",
  styleUrl: "./connexion.component.css",
})
export class ConnexionComponent implements OnInit {

  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar // Inject MatSnackBar for pop-up
  ) {}

  ngOnInit(): void {
    // Check if the user is already logged in (JWT token is in localStorage)
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, navigate to the /home page
      this.router.navigate(['/home']);
    }
  }

  onConnexion() {
    const identifier = (document.getElementById('identifier') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    const loginData = {
      identifier: identifier,
      password: password
    };

  // Call your API service to login
  this.apiService.loginUser(loginData).subscribe(response => {
    if (response && response.token) {
      // Store the JWT token and "droit" in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('droit', response.droit);  // Save droit value for later use

      // Redirect to /home after successful login
      this.router.navigate(['/home']);
    } else {
      console.error('Login failed');
    }
  }, error => {
    console.error('Error during login:', error);
  });
}}