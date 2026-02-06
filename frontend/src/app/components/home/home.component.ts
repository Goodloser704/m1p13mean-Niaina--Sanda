import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // État de l'utilisateur
  currentUser: User | null = null;
  isLoggedIn = false;
  
  // Navigation
  currentView: 'home' | 'notifications' | 'admin-boutiques' | 'admin-etages' | 'admin-espaces' | 'boutique-registration' | 'my-boutiques' = 'home';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    console.log('🚀 HomeComponent constructor appelé');
  }

  ngOnInit() {
    console.log('🔄 HomeComponent ngOnInit appelé');
    
    // S'abonner aux changements d'état d'authentification
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        console.log('👤 HomeComponent - Utilisateur actuel:', user?.email || 'Non connecté');
      })
    );
    
    this.subscriptions.push(
      this.authService.isLoggedIn$.subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;
        console.log('🔐 HomeComponent - État connexion:', isLoggedIn ? 'Connecté' : 'Déconnecté');
        
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

  // 📱 Navigation avec router
  setView(view: 'home' | 'notifications' | 'admin-boutiques' | 'admin-etages' | 'admin-espaces' | 'boutique-registration' | 'my-boutiques') {
    console.log('📱 Navigation vers:', view);
    if (view === 'home') {
      this.router.navigate(['/']);
    } else {
      this.router.navigate([`/${view}`]);
    }
  }

  // 🔔 Vérifier si l'utilisateur peut voir les notifications
  canViewNotifications(): boolean {
    return this.isLoggedIn;
  }

  // 🏪 Vérifier si l'utilisateur peut voir l'interface boutique
  canViewBoutiqueRegistration(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'Commercant';
  }

  // 🏪 Vérifier si l'utilisateur peut voir ses boutiques
  canViewMyBoutiques(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'Commercant';
  }

  // 👨‍💼 Vérifier si l'utilisateur peut voir l'interface admin
  canViewAdminBoutiques(): boolean {
    return this.isLoggedIn && this.currentUser?.role === 'Admin';
  }
}