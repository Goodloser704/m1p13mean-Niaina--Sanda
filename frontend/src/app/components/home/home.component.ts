import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 12px; margin-bottom: 40px;">
        <h1 style="font-size: 2.5rem; margin-bottom: 16px; font-weight: 300;">Bienvenue au Centre Commercial</h1>
        <p style="font-size: 1.2rem; margin-bottom: 32px; opacity: 0.9;">Découvrez nos boutiques et produits exceptionnels</p>
        <button style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 4px; cursor: pointer; font-size: 16px;">
          Explorer les boutiques
        </button>
      </div>

      <div style="margin-bottom: 40px;">
        <h2 style="text-align: center; margin-bottom: 32px; color: #333;">Catégories Populaires</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div *ngFor="let category of categories" style="background: white; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer;">
            <div style="font-size: 48px; margin-bottom: 16px;">{{ category.icon }}</div>
            <h3 style="margin-bottom: 8px;">{{ category.name }}</h3>
            <p style="color: #666; margin: 0;">{{ category.count }} boutiques</p>
          </div>
        </div>
      </div>

      <div style="background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%); color: white; padding: 40px; text-align: center; border-radius: 12px;">
        <h2 style="margin-bottom: 16px;">Vous êtes commerçant ?</h2>
        <p style="margin-bottom: 24px; font-size: 1.1rem;">Rejoignez notre centre commercial et développez votre activité</p>
        <button style="padding: 12px 24px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 4px; cursor: pointer; font-size: 16px;">
          Créer ma boutique
        </button>
      </div>
    </div>
  `
})
export class HomeComponent {
  categories = [
    { name: 'Mode', icon: '👗', count: 15 },
    { name: 'Électronique', icon: '📱', count: 8 },
    { name: 'Alimentation', icon: '🍕', count: 12 },
    { name: 'Beauté', icon: '💄', count: 6 },
    { name: 'Sport', icon: '⚽', count: 4 },
    { name: 'Maison', icon: '🏠', count: 10 }
  ];
}