import { Component, signal } from '@angular/core';
import { UserRole } from '../../../core/models/user';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

interface DefaultUser {
  role: UserRole,
  email: String,
  mdp: String,
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  UserRole = UserRole;

  defaultUsers: DefaultUser[] = [
    { role: UserRole.Admin, email: 'admin@gmail.com', mdp: 'admintest' },
    { role: UserRole.Commercant, email: 'commercant@gmail.com', mdp: 'commercant' },
    { role: UserRole.Acheteur, email: 'acheteur@gmail.com', mdp: 'acheteur' }
  ]

  isLoading = signal(false);
  error = signal<String | null>(null);

  form: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      mdp: ['', [Validators.required]]
    })
  }

  onSelectDefaultUser(event: Event) {
    const role = (event.target as HTMLSelectElement).value as UserRole;
    const user = this.defaultUsers.find(u => u.role === role);

    if (user) {
      this.form.setValue({
        email: user.email,
        mdp: user.mdp
      });
    }
  }

  login() {
    if (this.form.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.authService.login(this.form.value)
      .subscribe({
        error: () => {
          this.error.set('Identifiants invalides');
          this.isLoading.set(false);
        },
        complete: () => this.isLoading.set(false)
      })
  }
}
