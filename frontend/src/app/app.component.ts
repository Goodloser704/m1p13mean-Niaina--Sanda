import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto;">
      <!-- Header -->
      <header style="background: #3f51b5; color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h1 style="margin: 0; display: flex; align-items: center; gap: 10px;">
          🏬 Centre Commercial
        </h1>
      </header>

      <!-- Hero Section -->
      <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; margin-bottom: 40px;">
        <h2 style="font-size: 2.5rem; margin-bottom: 16px; font-weight: 300;">Bienvenue au Centre Commercial</h2>
        <p style="font-size: 1.2rem; margin-bottom: 32px; opacity: 0.9;">Découvrez nos boutiques et produits exceptionnels</p>
        <button style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 4px; cursor: pointer; font-size: 16px;" (click)="showLogin = !showLogin">
          {{ showLogin ? 'Retour' : 'Se connecter' }}
        </button>
      </section>

      <!-- Login Form -->
      <section *ngIf="showLogin" style="background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto 40px;">
        <h3 style="text-align: center; margin-bottom: 30px; color: #333;">Connexion</h3>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; color: #555;">Email</label>
          <input 
            type="email" 
            [(ngModel)]="email"
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
            placeholder="admin&#64;mall.com"
          >
        </div>

        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 5px; color: #555;">Mot de passe</label>
          <input 
            type="password" 
            [(ngModel)]="password"
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px;"
            placeholder="admin123"
          >
        </div>

        <button 
          (click)="login()"
          style="width: 100%; padding: 12px; background: #3f51b5; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer; margin-bottom: 20px;"
        >
          Se connecter
        </button>
        
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p><strong>Comptes de test :</strong></p>
          <p>admin&#64;mall.com / admin123</p>
          <p>fashion&#64;mall.com / boutique123</p>
          <p>client1&#64;test.com / client123</p>
        </div>
      </section>

      <!-- Categories -->
      <section *ngIf="!showLogin">
        <h3 style="text-align: center; margin-bottom: 32px; color: #333;">Catégories Populaires</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px;">
          <div *ngFor="let category of categories" style="background: white; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
            <div style="font-size: 48px; margin-bottom: 16px;">{{ category.icon }}</div>
            <h4 style="margin-bottom: 8px; color: #333;">{{ category.name }}</h4>
            <p style="color: #666; margin: 0;">{{ category.count }} boutiques</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section *ngIf="!showLogin" style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 12px;">
        <h3 style="margin-bottom: 16px;">Vous êtes commerçant ?</h3>
        <p style="margin-bottom: 24px; font-size: 1.1rem;">Rejoignez notre centre commercial et développez votre activité</p>
        <button style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 4px; cursor: pointer; font-size: 16px;" (click)="showLogin = true">
          Créer ma boutique
        </button>
      </section>

      <!-- Footer -->
      <footer style="text-align: center; margin-top: 40px; padding: 20px; color: #666;">
        <p>Backend API : <a href="https://m1p13mean-niaina-1.onrender.com" target="_blank" style="color: #3f51b5;">https://m1p13mean-niaina-1.onrender.com</a></p>
        <p>Application Centre Commercial - MEAN Stack</p>
      </footer>
    </div>
  `
})
export class AppComponent {
  showLogin = false;
  email = '';
  password = '';
  
  categories = [
    { name: 'Mode', icon: '👗', count: 15 },
    { name: 'Électronique', icon: '📱', count: 8 },
    { name: 'Alimentation', icon: '🍕', count: 12 },
    { name: 'Beauté', icon: '💄', count: 6 },
    { name: 'Sport', icon: '⚽', count: 4 },
    { name: 'Maison', icon: '🏠', count: 10 }
  ];

  login() {
    if (this.email && this.password) {
      alert(`Connexion simulée pour: ${this.email}\nBackend: https://m1p13mean-niaina-1.onrender.com/api/auth/login`);
      console.log('Login attempt:', { email: this.email, password: this.password });
    } else {
      alert('Veuillez remplir tous les champs');
    }
  }
}