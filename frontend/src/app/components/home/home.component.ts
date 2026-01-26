import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>Bienvenue au Centre Commercial</h1>
          <p>Découvrez nos boutiques et produits exceptionnels</p>
          <button mat-raised-button color="primary">
            Explorer les boutiques
          </button>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <h2>Catégories Populaires</h2>
        <div class="categories-grid">
          <mat-card *ngFor="let category of categories" class="category-card">
            <mat-card-content>
              <mat-icon class="category-icon">{{ category.icon }}</mat-icon>
              <h3>{{ category.name }}</h3>
              <p>{{ category.count }} boutiques</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta">
        <mat-card class="cta-card">
          <mat-card-content>
            <h2>Vous êtes commerçant ?</h2>
            <p>Rejoignez notre centre commercial et développez votre activité</p>
            <button mat-raised-button color="accent" routerLink="/login">
              Créer ma boutique
            </button>
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 80px 20px;
      text-align: center;
      border-radius: 12px;
      margin-bottom: 40px;
    }

    .hero-content h1 {
      font-size: 3rem;
      margin-bottom: 16px;
      font-weight: 300;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 32px;
      opacity: 0.9;
    }

    .categories, .cta {
      margin-bottom: 40px;
    }

    .categories h2 {
      text-align: center;
      margin-bottom: 32px;
      color: #333;
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .category-card {
      text-align: center;
      cursor: pointer;
      transition: transform 0.3s ease;
    }

    .category-card:hover {
      transform: translateY(-4px);
    }

    .category-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
      color: #3f51b5;
      margin-bottom: 16px;
    }

    .cta-card {
      text-align: center;
      padding: 40px;
      background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .cta-card h2 {
      margin-bottom: 16px;
    }

    .cta-card p {
      margin-bottom: 24px;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }
      
      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  
  categories = [
    { name: 'Mode', icon: 'checkroom', count: 15 },
    { name: 'Électronique', icon: 'devices', count: 8 },
    { name: 'Alimentation', icon: 'restaurant', count: 12 },
    { name: 'Beauté', icon: 'face', count: 6 },
    { name: 'Sport', icon: 'fitness_center', count: 4 },
    { name: 'Maison', icon: 'home', count: 10 }
  ];

  ngOnInit(): void {
    console.log('Home component loaded');
  }
}