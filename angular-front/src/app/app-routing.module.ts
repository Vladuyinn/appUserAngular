import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { HomeComponent } from "./home/home.component";
import { ConnexionComponent } from "./connexion/connexion.component";
import { ChatComponent } from "./chat/chat.component";
import {VerifEmailComponent} from "./verif-email/verif-email.component";
import { ErreurLienExpireComponent } from './erreur-lien-expire/erreur-lien-expire.component';
import { AuthGuard } from './authGuard/auth.guard';  // Import the AuthGuard
// import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "home", component: HomeComponent, canActivate: [AuthGuard] }, // Route explicite pour HomeComponent
  { path: "connexion", component: ConnexionComponent },
  { path: "chat", component: ChatComponent },
  { path: 'erreur-lien-expire', component: ErreurLienExpireComponent },
  { path : "verify-email", component : VerifEmailComponent },
  { path: "", redirectTo: "/connexion", pathMatch: "full" }, // Redirection vers /home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
