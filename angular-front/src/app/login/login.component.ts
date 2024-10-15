import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "../api.service";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.css",
})
export class LoginComponent {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }

  onRegister() {
    const username = (document.getElementById("login") as HTMLInputElement)
      .value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    const droit = (document.getElementById("droit") as HTMLInputElement).value;
    const verifié = (document.getElementById("verifié") as HTMLInputElement).value;

    const registerData = {
      username: username,
      email: email,
      password: password,
      droit: droit,
      verifié: verifié,
    };

    // Call your API service to register
    this.apiService.registerUser(registerData).subscribe(
      (response) => {
        if (response && response.token) {

          // Show success pop-up after redirection
          this.snackBar.open("Inscription en cours. Un email de validation a été envoyé.", "x", {
            duration: 3000, // The pop-up will last for 3 seconds
            verticalPosition: "top", // Position at the top of the screen
            horizontalPosition: "center", // Centered horizontally
          });
          this.router.navigate(["/connexion"]); // Redirect after successful registration
        } else {
          console.error("Registration failed");
        }
      },
      (error) => {
        console.error("Error during registration:", error);
      }
    );
  }
}
