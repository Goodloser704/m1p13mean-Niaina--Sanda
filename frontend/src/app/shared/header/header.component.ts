import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { environment, title } from '../../../environments/environment';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LoginModal } from "../../components/login-modal/login-modal.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, LoginModal],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class Header implements OnInit, OnDestroy {
  title = title;
  showLogin = signal<boolean>(false);
  
  // État d'authentification
  currentUser: User | null = null;
  isLoggedIn = false;
  unreadNotifications = 0;
  
  // État des menus déroulants
  showAdminMenu = false;
  showBoutiqueMenu = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    const apiUrl: string = environment.apiUrl;
    console.log(`🌐 Current API Url: ${apiUrl}`);
    
    // S'abonner aux changements d'authentification
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('👤 Header - Utilisateur actuel:', user?.email || 'Non connecté');
        console.log('🎭 Header - Rôle:', user?.role || 'N/A');
        
        // Charger les notifications si connecté
        if (user) {
          this.loadNotifications();
        }
      })
    );
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        console.log('🔐 Header - État connexion:', isLoggedIn ? 'Connecté' : 'Déconnecté');
      })
    );
    
    // S'abonner aux notifications
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadNotifications = count;
      })
    );
  }

  // 🔍 Vérifier le rôle (insensible à la casse)
  hasRole(role: string): boolean {
    if (!this.currentUser?.role) return false;
    return this.currentUser.role.toLowerCase() === role.toLowerCase();
  }

  // 🔍 Vérifier si l'utilisateur est admin
  isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  // 🔍 Vérifier si l'utilisateur est commerçant
  isCommercant(): boolean {
    return this.hasRole('Commercant');
  }

  // 🔍 Vérifier si l'utilisateur est acheteur
  isAcheteur(): boolean {
    return this.hasRole('Acheteur');
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

  // 🔐 Gestion de la modal de connexion
  onShowLogin() {
    this.showLogin.update(current => !current);
  }

  onCloseLogin(value: boolean) {
    this.showLogin.set(value);
  }

  // 🚪 Déconnexion
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    alert('Vous avez été déconnecté');
    console.log('🚪 Déconnexion effectuée depuis le header');
  }

  // 📱 Obtenir l'icône du rôle
  getRoleIcon(role: string): string {
    switch (role) {
      case 'Admin': return '👨‍💼';
      case 'Commercant': return '🏪';
      case 'Acheteur': return '🛍️';
      default: return '👤';
    }
  }

  // 🎨 Obtenir la couleur du rôle
  getRoleColor(role: string): string {
    switch (role) {
      case 'Admin': return '#dc3545';
      case 'Commercant': return '#28a745';
      case 'Acheteur': return '#007bff';
      default: return '#6c757d';
    }
  }

  // 📋 Gestion des menus déroulants
  toggleAdminMenu() {
    this.showAdminMenu = !this.showAdminMenu;
    this.showBoutiqueMenu = false; // Fermer les autres menus
  }

  toggleBoutiqueMenu() {
    this.showBoutiqueMenu = !this.showBoutiqueMenu;
    this.showAdminMenu = false; // Fermer les autres menus
  }

  // Fermer tous les menus
  closeAllMenus() {
    this.showAdminMenu = false;
    this.showBoutiqueMenu = false;
  }
}