import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { TitleCasePipe, DatePipe } from "@angular/common";
import { Router } from "@angular/router";

@Component({
  selector: 'app-user-profil',
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './user-profil.html',
  styleUrl: './user-profil.scss',
})
export class UserProfil {
  currentUser = signal<User | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser.set(authService.getCurrentUser());
  }

  goToPorteFeuille() {
    const path = `${this.authService.getCurrentUserHomeByRole()}/porte-feuille`;
    console.log(`Porte-feuille path: ${path}`);
    this.router.navigate([path]);
  }
}
