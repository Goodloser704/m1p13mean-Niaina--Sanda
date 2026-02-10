import { Component, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user';
import { TitleCasePipe, DatePipe } from "@angular/common";

@Component({
  selector: 'app-user-profil',
  imports: [TitleCasePipe, DatePipe],
  templateUrl: './user-profil.html',
  styleUrl: './user-profil.scss',
})
export class UserProfil {
  currentUser = signal<User | null>(null);

  constructor(
    private authService: AuthService
  ) {
    this.currentUser.set(authService.getCurrentUser());
  }
}
