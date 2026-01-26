import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span routerLink="/" style="cursor: pointer;">
        <mat-icon>shopping_mall</mat-icon>
        Centre Commercial
      </span>
      
      <span class="spacer"></span>
      
      <div *ngIf="!authService.isAuthenticated(); else userMenu">
        <button mat-button routerLink="/login">Connexion</button>
        <button mat-button routerLink="/register">Inscription</button>
      </div>
      
      <ng-template #userMenu>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            Déconnexion
          </button>
        </mat-menu>
      </ng-template>
    </mat-toolbar>
    
    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    main {
      min-height: calc(100vh - 64px);
      padding: 20px;
    }
    
    mat-toolbar span {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}
  
  logout() {
    this.authService.logout();
  }
}