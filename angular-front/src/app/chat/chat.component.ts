import { Component, OnInit } from "@angular/core";
import { ApiService } from "../api.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent {

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  onLogout() {
    // Remove the token from localStorage
    localStorage.removeItem("token");

    // Show a snack-bar notification for successful logout
    this.snackBar.open("Déconnexion réussie", "Fermer", {
      duration: 3000, // Duration of the pop-up
      verticalPosition: "top",
      horizontalPosition: "center",
    });

    // Redirect to the login page
    this.router.navigate(["/connexion"]);
  }

}
