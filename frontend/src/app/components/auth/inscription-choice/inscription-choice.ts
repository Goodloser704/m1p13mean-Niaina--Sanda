import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription-choice',
  imports: [],
  templateUrl: './inscription-choice.html',
  styleUrl: './inscription-choice.scss',
})
export class InscriptionChoice {
  location = inject(Location);
  
  constructor(private authService: AuthService, private router: Router) {}

  UserRole = UserRole;

  registerAs(userRole: UserRole) {
    this.authService.registrationRole.set(userRole);
    this.router.navigate(["/inscription"]);
  }
}
