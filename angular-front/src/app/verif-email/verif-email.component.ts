import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../api.service';  // Importer votre service API

@Component({
  selector: 'app-verif-email',
  templateUrl: './verif-email.component.html',
  styleUrls: ['./verif-email.component.css']
})
export class VerifEmailComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // Récupérer le token depuis l'URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      // Appeler l'API pour vérifier l'email avec le token
      if (token) {
        this.apiService.verifyEmail(token, { responseType: 'text' }).subscribe(
          response => {
            console.log('Réponse du serveur:', response);
            setTimeout(() => {
              this.router.navigate(['/connexion'], { queryParams: { verified: 'true' } });
            }, 5000);
          },
          error => {
            // Vérifier si l'erreur est due à un lien expiré
            if (error.status === 400 && error.error.error === 'Lien expiré') {
              this.router.navigate(['/erreur-lien-expire']);  // Rediriger vers la page d'erreur
            } else {
              alert('Le lien a expiré veuillez en demander un autre !');
            }
          }
        );
      }
    });
  }
}
