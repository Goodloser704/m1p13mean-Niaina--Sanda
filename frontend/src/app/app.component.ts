import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AdminBoutiquesComponent } from './components/admin-boutiques/admin-boutiques.component';
import { BoutiqueRegistrationComponent } from './components/boutique-registration/boutique-registration.component';
import { MyBoutiquesComponent } from './components/my-boutiques/my-boutiques.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule, NotificationsComponent, AdminBoutiquesComponent, BoutiqueRegistrationComponent, MyBoutiquesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly title = signal('Centre Commercial');
  
  // 🔐 État de connexion
  showLogin = false;
  showRegister = false;
  currentUser: User | null = null;
  isLoggedIn = false;
  
  // 🔔 État des notifications
  unreadNotifications = 0;
  
  // 📱 Navigation
  currentView: 'home' | 'notifications' | 'admin-boutiques' | 'boutique-registration' | 'my-boutiques' = 'home';
  
  // 📝 Formulaires
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

  // 📊 Profils de démonstration
  demoProfiles = [
    {
      role: 'admin',
      email: 'admin@mall.com',
      password: 'admin123',
      nom: 'Administrateur',
      prenom: 'Principal'
    },
    {
      role: 'boutique',
      email: 'fashion@mall.com',
      password: 'boutique123',
      nom: 'Fashion',
      prenom: 'Store'
    },
    {
      role: 'client',
      email: 'client1@test.com',
      password: 'client123',
      nom: 'Dupont',
      prenom: 'Jean'
    }
  ];

  // 📊 Variables pour monitoring (simplifiées)
  backendStatus = 'Vérification...';
  backendUrl = this.getBackendUrl();
  
  private subscriptions: Subscription[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    console.log('🚀 AppComponent constructor appelé');
  }

  /**
   * 🌐 Obtenir l'URL du backend selon l'environnement
   */
  private getBackendUrl(): string {
    // En développement local avec proxy
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Si on est en local, utiliser le proxy
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('🔧 Mode développement local - Utilisation du proxy');
        return ''; // URL relative pour utiliser le proxy
      }
      
      // Si on est sur Vercel (production)
      if (hostname.includes('vercel.app')) {
        console.log('🌐 Mode production Vercel');
        return 'https://m1p13mean-niaina-1.onrender.com';
      }
    }
    
    // Par défaut, utiliser l'URL de production
    console.log('🌐 Mode production par défaut');
    return 'https://m1p13mean-niaina-1.onrender.com';
  }

  ngOnInit() {
    console.log('🔄 AppComponent ngOnInit appelé');
    
    // S'abonner aux changements d'état d'authentification
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('👤 Utilisateur actuel:', user?.email || 'Non connecté');
        
        // Charger les notifications si l'utilisateur est connecté
        if (user) {
          this.loadNotifications();
        }
      })
    );
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        console.log('🔐 État connexion:', isLoggedIn ? 'Connecté' : 'Déconnecté');
      })
    );
    
    // S'abonner aux notifications
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadNotifications = count;
      })
    );
    
    this.checkBackendConnection();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 🔔 Charger les notifications
  loadNotifications() {
    if (this.isLoggedIn) {
      this.notificationService.getUnreadCount().subscribe();
    }
  }

  // 🔍 Vérifier la connexion backend (simplifié)
  async checkBackendConnection() {
    try {
      const response = await this.http.get(`${this.backendUrl}/`).toPromise() as any;
      this.backendStatus = '✅ Connecté';
      console.log('✅ Backend accessible');
    } catch (error) {
      this.backendStatus = '❌ Erreur';
      console.error('❌ Erreur connexion backend:', error);
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
      
      this.showLogin = false;
      this.resetForms();
      
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
      
      this.showRegister = false;
      this.resetForms();
      
    } catch (error: any) {
      console.error('❌ Échec de l\'inscription:', error);
      alert(`Erreur d'inscription:\n${error.error?.message || 'Erreur serveur'}`);
    }
  }

  // 🚪 Déconnexion
  logout() {
    this.authService.logout();
    this.currentView = 'home';
    alert('Vous avez été déconnecté');
    console.log('🚪 Déconnexion effectuée');
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

  // 📱 Navigation
  setView(view: 'home' | 'notifications' | 'admin-boutiques' | 'boutique-registration' | 'my-boutiques') {
    this.currentView = view;
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

  // 🔔 Vérifier si l'utilisateur peut voir les notifications
  canViewNotifications(): boolean {
    return this.isLoggedIn;
  }

  // 🏪 Vérifier si l'utilisateur peut voir l'interface boutique
  canViewBoutiqueRegistration(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'boutique';
  }

  // 👨‍💼 Vérifier si l'utilisateur peut voir l'interface admin
  canViewAdminBoutiques(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'admin';
  }
}