import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule
  ],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <h1>Bienvenue au Centre Commercial</h1>
          <p>Découvrez nos boutiques et produits exceptionnels</p>
          <div class="search-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher des produits, boutiques...</mat-label>
              <input matInput [(ngModel)]="searchTerm" (keyup.enter)="search()">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="search()">
              Rechercher
            </button>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories">
        <h2>Catégories Populaires</h2>
        <div class="categories-grid">
          <mat-card *ngFor="let category of categories" class="category-card" 
                    (click)="navigateToCategory(category.name)">
            <mat-card-content>
              <mat-icon class="category-icon">{{ category.icon }}</mat-icon>
              <h3>{{ category.name }}</h3>
              <p>{{ category.count }} boutiques</p>
            </mat-card-content>
          </mat-card>
        </div>
      </section>

      <!-- Featured Boutiques -->
      <section class="featured">
        <h2>Boutiques en Vedette</h2>
        <div class="boutiques-grid">
          <mat-card *ngFor="let boutique of featuredBoutiques" class="boutique-card">
            <img mat-card-image [src]="boutique.logo || '/assets/default-shop.jpg'" 
                 [alt]="boutique.nom">
            <mat-card-content>
              <h3>{{ boutique.nom }}</h3>
              <p>{{ boutique.description }}</p>
              <div class="rating">
                <mat-icon>star</mat-icon>
                <span>{{ boutique.note.moyenne | number:'1.1-1' }}</span>
                <span>({{ boutique.note.nombreAvis }} avis)</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" 
                      [routerLink]="['/boutiques', boutique._id]">
                Voir la boutique
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="cta">
        <mat-card class="cta-card">
          <mat-card-content>
            <h2>Vous êtes commerçant ?</h2>
            <p>Rejoignez notre centre commercial et développez votre activité</p>
            <button mat-raised-button color="accent" routerLink="/register">
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

    .search-bar {
      display: flex;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
      align-items: flex-end;
    }

    .search-field {
      flex: 1;
    }

    .search-field ::ng-deep .mat-mdc-form-field {
      background-color: white;
      border-radius: 4px;
    }

    .categories, .featured {
      margin-bottom: 40px;
    }

    .categories h2, .featured h2 {
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

    .boutiques-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .boutique-card img {
      height: 200px;
      object-fit: cover;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #ff9800;
      margin-top: 8px;
    }

    .cta {
      margin: 60px 0;
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
      
      .search-bar {
        flex-direction: column;
        align-items: stretch;
      }
      
      .categories-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  searchTerm = '';
  
  categories = [
    { name: 'Mode', icon: 'checkroom', count: 15 },
    { name: 'Électronique', icon: 'devices', count: 8 },
    { name: 'Alimentation', icon: 'restaurant', count: 12 },
    { name: 'Beauté', icon: 'face', count: 6 },
    { name: 'Sport', icon: 'fitness_center', count: 4 },
    { name: 'Maison', icon: 'home', count: 10 }
  ];

  featuredBoutiques = [
    {
      _id: '1',
      nom: 'Fashion Store',
      description: 'Les dernières tendances mode',
      logo: '/assets/shop1.jpg',
      note: { moyenne: 4.5, nombreAvis: 124 }
    },
    {
      _id: '2', 
      nom: 'Tech Corner',
      description: 'Électronique et gadgets',
      logo: '/assets/shop2.jpg',
      note: { moyenne: 4.2, nombreAvis: 89 }
    },
    {
      _id: '3',
      nom: 'Gourmet Délices',
      description: 'Produits gastronomiques',
      logo: '/assets/shop3.jpg',
      note: { moyenne: 4.8, nombreAvis: 156 }
    }
  ];

  ngOnInit(): void {
    // Charger les données réelles depuis l'API
  }

  search(): void {
    if (this.searchTerm.trim()) {
      // Implémenter la recherche
      console.log('Recherche:', this.searchTerm);
    }
  }

  navigateToCategory(category: string): void {
    // Navigation vers la catégorie
    console.log('Catégorie:', category);
  }
}