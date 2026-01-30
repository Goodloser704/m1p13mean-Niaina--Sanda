import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { LoginService } from '../../core/services/auth/login-service';

@Component({
  selector: 'app-login-modal',
  imports: [FormsModule],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  email = '';
  password = '';
  logError = signal<String | null>(null);

  // Event mivoaka ivelan'ilay component, 
  // ex: mandefa valeur true/false refa akatona, valeur true/false recuperable avec $event dans html
  @Output() closeEvent = new EventEmitter<boolean>();

  constructor(private loginService: LoginService) {}

  onClose() {
    this.closeEvent.emit(false);
  }

  login() {
    if (!this.email || !this.password) {
      this.logError.set('⚠️ Champs manquants pour la connexion');
      alert('Veuillez remplir tous les champs');
      return;
    }

    this.loginService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          console.log(`👤 Utilisateur: ${response.user.nom} ${response.user.prenom}`);
          console.log(`🎭 Rôle: ${response.user.role}`);
          console.log('🎫 Token reçu et sauvegardé');
      
          // Sauvegarder le token
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        },
        error: (err) => {
          console.error(err);
          this.logError.set(`Erreur: ${err.error?.message || err.messager}`);
        }
      })
  }
}
