import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../api.service";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})

export class HomeComponent implements OnInit {
  listUser: { idUser: number; prenom: string }[] = [];
  showUsers: boolean = false;
  newUser: string = "";
  editingIndex: number | null = null; // Stocke l'index de l'utilisateur en cours d'édition
  editedUserName: string = ""; // Stocke le nom d'utilisateur modifié
  editingUserId: number | null = null;
  droit: number | null = null; // Sotck le "droit" depuis le backend

  constructor(
    private apiService: ApiService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  //Fonction GET
  ngOnInit() {
    
    // Check if the user is logged in by checking the token
    const token = localStorage.getItem("token");
    const droitValue = localStorage.getItem("droit");

    if (!token) {
      // If no token, redirect to login
      this.router.navigate(["/login"]);
    } else if (droitValue !== null) {
      // Parse the stored "droit" value
      this.droit = parseInt(droitValue, 10);
    } else {
      // Handle error or missing "droit" case
      console.error("Droit not found");
      this.router.navigate(["/login"]);
    }

    //Interaction avec la BDD
    this.apiService.getUser().subscribe((users: any) => {
      this.listUser = users; // Récupère les utilisateurs (idUser et prenom)
    });
  }

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

  // Fonction pour ajouter un utilisateur
  ajoutUser(userName: string) {
    //Interaction avec la BDD
    if (userName.trim() !== "") {
      this.apiService.addUser({ nom: userName }).subscribe(() => {
        this.ngOnInit();
      });
    }
  }

  // Fonction pour afficher ou cacher les utilisateurs
  toggleDisplayUsers() {
    this.showUsers = !this.showUsers;
  }

  // Activer le mode édition pour un utilisateur
  editUser(index: number) {
    this.editingIndex = index;
    this.editedUserName = this.listUser[index].prenom; // Charge le prénom actuel
    this.editingUserId = this.listUser[index].idUser; // Charge l'idUser actuel
  }

  // Annuler la modification
  cancelEdit() {
    this.editingIndex = null;
    this.editedUserName = "";
    this.editingUserId = null;
  }

  // Mettre à jour un utilisateur
  updateUser() {
    if (this.editingUserId !== null && this.editedUserName.trim() !== "") {
      this.apiService
        .updateUser(this.editingUserId, { nom: this.editedUserName })
        .subscribe(() => {
          this.ngOnInit(); // Recharge la liste des utilisateurs après la mise à jour
          this.cancelEdit(); // Réinitialise le mode édition
        });
    }
  }

  // Fonction pour effacer tous les utilisateurs
  // Supprimer tous les utilisateurs
  clearAllUsers() {
    this.apiService.deleteUser().subscribe(() => {
      this.ngOnInit(); // Recharge la liste après suppression de tous les utilisateurs
    });
  }
}
