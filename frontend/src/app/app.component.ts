import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from "./shared/header/header.component";
import { Footer } from "./shared/footer/footer.component";
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    Header,
    Footer
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Centre Commercial';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Forcer la restauration de session au démarrage de l'application
    console.log('🚀 Démarrage de l\'application - vérification de session');
    
    // Attendre un peu pour que les services soient initialisés
    setTimeout(() => {
      const currentUser = this.authService.getCurrentUser();
      const isLoggedIn = this.authService.isAuthenticated();
      
      console.log('📊 État actuel:', {
        currentUser: currentUser?.email || 'Aucun',
        isLoggedIn: isLoggedIn
      });
      
      // Si pas d'utilisateur mais qu'on a des données en stockage, forcer la restauration
      if (!currentUser || !isLoggedIn) {
        console.log('🔄 Tentative de restauration de session...');
        this.authService.forceRestoreSession();
      }
    }, 100);
  }
}