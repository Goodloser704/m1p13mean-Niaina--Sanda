import { Component, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder } from '@angular/forms';
import { UserRole } from '../../../core/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inscription',
  imports: [],
  templateUrl: './inscription.html',
  styleUrl: './inscription.scss',
})
export class Inscription implements OnInit {
  isLoading = signal(false);
  error = signal<String | null>(null);

  registrationRole: UserRole | null = null;
  form: any;


  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registrationRole = authService.registrationRole();
  }

  ngOnInit() {
    if (!this.authService.registrationRole()) {
      console.warn("Registration role is null");
      this.router.navigate(["/login"]);
    }
  }
}
