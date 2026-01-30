import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from "./shared/header/header";
import { Footer } from "./shared/footer/footer";
import { AuthService, User } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AdminBoutiquesComponent } from './components/admin-boutiques/admin-boutiques.component';
import { BoutiqueRegistrationComponent } from './components/boutique-registration/boutique-registration.component';
import { MyBoutiquesComponent } from './components/my-boutiques/my-boutiques.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    FormsModule, 
    Header, 
    Footer,
    NotificationsComponent,
    AdminBoutiquesComponent,
    BoutiqueRegistrationComponent,
    MyBoutiquesComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  // État de l'utilisateur
  currentUser: User | null = null;
  isLoggedIn = false;
  
  // Navigation
  currentView: 'home' | 'notifications' | 'admin-boutiques' | 'boutique-registration' | 'my-boutiques' = 'home';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    console.log('🚀 App constructor appelé');
  }

  ngOnInit() {
    console.log('🔄 App ngOnInit appelé');
    
    // S'abonner aux changements d'état d'authentification
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('👤 App - Utilisateur actuel:', user?.email || 'Non connecté');
      })
    );
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        console.log('🔐 App - État connexion:', isLoggedIn ? 'Connecté' : 'Déconnecté');
        
        // Retourner à l'accueil si déconnecté
        if (!isLoggedIn && this.currentView !== 'home') {
          this.currentView = 'home';
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // 📱 Navigation
  setView(view: 'home' | 'notifications' | 'admin-boutiques' | 'boutique-registration' | 'my-boutiques') {
    this.currentView = view;
    console.log('📱 Navigation vers:', view);
  }

  // 🔔 Vérifier si l'utilisateur peut voir les notifications
  canViewNotifications(): boolean {
    return this.isLoggedIn;
  }

  // 🏪 Vérifier si l'utilisateur peut voir l'interface boutique
  canViewBoutiqueRegistration(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'boutique';
  }

  // 🏪 Vérifier si l'utilisateur peut voir ses boutiques
  canViewMyBoutiques(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'boutique';
  }

  // 👨‍💼 Vérifier si l'utilisateur peut voir l'interface admin
  canViewAdminBoutiques(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'admin';
  }
}