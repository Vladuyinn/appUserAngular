import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verif-email',
  templateUrl: './verif-email.component.html',
  styleUrls: ['./verif-email.component.css']
})
export class VerifEmailComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // After a short delay, redirect to the login page with the verified parameter
    setTimeout(() => {
      this.router.navigate(['/connexion'], { queryParams: { verified: 'true' } });
    }, 5000);  // Redirect after 2 seconds (you can adjust the delay as needed)
  }
}
