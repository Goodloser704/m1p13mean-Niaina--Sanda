import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.scss',
})
export class LoginModal implements OnInit {
  @Output() closeModal = new EventEmitter<boolean>();

  showLogin = true;
  showRegister = false;
  currentUser: User | null = null;

  // Formulaires
  loginForm = {
    email: '',
    password: '',
    role: 'client' as 'admin' | 'boutique' | 'client'
  };

  registerForm = {
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'client' as 'boutique' | 'client',
    telephone: '',
    adresse: ''
  };

  // Profils de démonstration (conformes à la base de données)
  demoProfiles = [
    {
      role: 'admin',
      email: 'admin@mall.com',
      password: 'admin123',
      nom: 'Dubois',
      prenom: 'Pierre'
    },
    {
      role: 'boutique',
      email: 'marie.leroy@boutique.com',
      password: 'boutique123',
      nom: 'Leroy',
      prenom: 'Marie (3 boutiques)'
    },
    {
      role: 'boutique',
      email: 'jean.moreau@boutique.com',
      password: 'boutique123',
      nom: 'Moreau',
      prenom: 'Jean (2 boutiques)'
    },
    {
      role: 'boutique',
      email: 'carmen.garcia@boutique.com',
      password: 'boutique123',
      nom: 'Garcia',
      prenom: 'Carmen (2 boutiques)'
    },
    {
      role: 'client',
      email: 'paul.dupont@client.com',
      password: 'client123',
      nom: 'Dupont',
      prenom: 'Paul'
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // S'abonner aux changements d'utilisateur
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Fermer la modal si connexion réussie
        this.onClose();
      }
    });
  }

  // 🔐 Connexion
  async login() {
    if (!this.loginForm.email || !this.loginForm.password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    console.log(`🔐 Tentative de connexion: ${this.loginForm.email} (${this.loginForm.role})`);

    try {
      await this.authService.login(this.loginForm.email, this.loginForm.password).toPromise();

      console.log('✅ Connexion réussie');
      alert(`Connexion réussie !\nBienvenue ${this.currentUser?.prenom} ${this.currentUser?.nom}`);

      this.resetForms();
      this.onClose();

    } catch (error: any) {
      console.error('❌ Échec de la connexion:', error);
      alert(`Erreur de connexion:\n${error.error?.message || 'Erreur serveur'}`);
    }
  }

  // 📝 Inscription
  async register() {
    if (!this.registerForm.email || !this.registerForm.password ||
        !this.registerForm.nom || !this.registerForm.prenom) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    console.log(`📝 Tentative d'inscription: ${this.registerForm.email} (${this.registerForm.role})`);

    try {
      const response = await this.authService.register(this.registerForm).toPromise();

      console.log('✅ Inscription réussie');

      // Message différent selon le rôle
      if (this.registerForm.role === 'boutique') {
        alert(`Inscription réussie !\n\n${response?.message || 'Demande envoyée'}\n\nVous recevrez un email une fois votre boutique validée par un administrateur.`);
      } else {
        alert(`Inscription réussie !\nBienvenue ${this.registerForm.prenom} ${this.registerForm.nom}`);
      }

      this.resetForms();
      this.onClose();

    } catch (error: any) {
      console.error('❌ Échec de l\'inscription:', error);
      alert(`Erreur d'inscription:\n${error.error?.message || 'Erreur serveur'}`);
    }
  }

  // 🎭 Sélectionner un profil de démonstration
  selectDemoProfile(profile: any) {
    if (this.showLogin) {
      this.loginForm.email = profile.email;
      this.loginForm.password = profile.password;
      this.loginForm.role = profile.role;
    } else if (this.showRegister) {
      this.registerForm.email = profile.email;
      this.registerForm.password = profile.password;
      this.registerForm.nom = profile.nom;
      this.registerForm.prenom = profile.prenom;
      this.registerForm.role = profile.role === 'admin' ? 'boutique' : profile.role;
    }
    console.log('🎭 Profil sélectionné:', profile.role);
  }

  // 🔄 Réinitialiser les formulaires
  resetForms() {
    this.loginForm = { email: '', password: '', role: 'client' };
    this.registerForm = {
      email: '', password: '', nom: '', prenom: '',
      role: 'client', telephone: '', adresse: ''
    };
  }

  // 🎯 Basculer entre connexion et inscription
  toggleAuthMode() {
    this.showLogin = !this.showLogin;
    this.showRegister = !this.showRegister;
    this.resetForms();
  }

  // ❌ Fermer la modal
  onClose() {
    this.closeModal.emit(false);
  }

  // 📱 Obtenir l'icône du rôle
  getRoleIcon(role: string): string {
    switch (role) {
      case 'admin': return '👨‍💼';
      case 'boutique': return '🏪';
      case 'client': return '🛍️';
      default: return '👤';
    }
  }

  // 🎨 Obtenir la couleur du rôle
  getRoleColor(role: string): string {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'boutique': return '#28a745';
      case 'client': return '#007bff';
      default: return '#6c757d';
    }
  }
}