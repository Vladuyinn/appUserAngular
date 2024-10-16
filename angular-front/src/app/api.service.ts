import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = "http://192.168.0.210:4270";

  constructor(private http: HttpClient) { }

  // Fonction pour récupérer les utilisateurs
  getUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`);
  }

  // Fonction pour ajouter un utilisateur
  addUser(user: { nom: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/user`, user);
  }

  //Méthode DELETE pour supprimer tous les utilisateurs
  deleteUser(): Observable<any> {
    return this.http.delete(this.apiUrl + "/user");
  }

  //Méthode UPDATE pour modifier les utilisateurs
  updateUser(userId: number, user: { nom: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${userId}`, user); // Envoyer la requête PUT
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  loginUser(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  // Méthode pour appeler l'API de vérification d'email
  verifyEmail(token: string, options?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify-email?token=${token}`, options);
  }
}
