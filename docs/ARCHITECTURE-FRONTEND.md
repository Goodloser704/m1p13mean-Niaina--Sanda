# 🌐 Architecture Frontend - Guide d'Explication Angular

## 📋 Vue d'Ensemble

Salut ! Je vais t'expliquer comment j'ai structuré le frontend de notre application mall avec Angular. J'ai organisé tout ça avec des **composants** qui communiquent avec notre backend via des **services HTTP**.

```
Structure que j'ai créée :
├── src/app/
│   ├── components/     # Composants UI
│   ├── services/       # Services HTTP
│   ├── models/         # Interfaces TypeScript
│   ├── guards/         # Protection des routes
│   └── interceptors/   # Interception HTTP
```

## 🧩 1. COMPOSANTS ANGULAR

### Comment j'explique un composant
Un composant, c'est comme une brique de construction qui combine **logique** (TypeScript) + **template** (HTML) + **styles** (CSS).

### Voici comment j'ai structuré mes composants
```typescript
// login.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',           // Nom du tag HTML que j'utilise
  templateUrl: './login.component.html',  // Mon template HTML
  styleUrls: ['./login.component.css']    // Mes styles CSS
})
export class LoginComponent {
  // MES PROPRIÉTÉS
  email: string = '';
  password: string = '';
  loading: boolean = false;
  error: string = '';

  // INJECTION DE DÉPENDANCE
  constructor(private authService: AuthService) {}

  // MES MÉTHODES
  async login() {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.authService.login(this.email, this.password);
      console.log('Connexion réussie:', response);
      // Redirection ou autre logique
    } catch (error) {
      this.error = 'Identifiants invalides';
    } finally {
      this.loading = false;
    }
  }
}
```

### Mon template HTML
```html
<!-- login.component.html -->
<div class="login-form">
  <h2>Connexion</h2>
  
  <!-- FORMULAIRE -->
  <form (ngSubmit)="login()">
    <div class="form-group">
      <label for="email">Email:</label>
      <input 
        type="email" 
        id="email" 
        [(ngModel)]="email"    <!-- Two-way binding -->
        required>
    </div>
    
    <div class="form-group">
      <label for="password">Mot de passe:</label>
      <input 
        type="password" 
        id="password" 
        [(ngModel)]="password"
        required>
    </div>
    
    <!-- AFFICHAGE CONDITIONNEL -->
    <div *ngIf="error" class="error">{{ error }}</div>
    
    <button 
      type="submit" 
      [disabled]="loading">    <!-- Property binding -->
      {{ loading ? 'Connexion...' : 'Se connecter' }}
    </button>
  </form>
</div>
```

## 🔧 2. SERVICES HTTP

### Comment j'explique un service
Un service, c'est là où je mets toute la **logique métier** et la **communication avec notre API**. C'est comme un assistant qui fait le travail en arrière-plan.

### Exemple concret : AuthService
Voici comment j'ai créé le service d'authentification :

```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'  // Service singleton
})
export class AuthService {
  private apiUrl = 'https://m1p13mean-niaina-1.onrender.com/api';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Je récupère l'utilisateur depuis localStorage au démarrage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // CONNEXION
  async login(email: string, password: string): Promise<any> {
    const loginData = { email, password };
    
    try {
      const response = await this.http.post(`${this.apiUrl}/auth/login`, loginData).toPromise();
      
      // Je sauvegarde le token et l'utilisateur
      localStorage.setItem('token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      // Je mets à jour le subject
      this.currentUserSubject.next(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // INSCRIPTION
  async register(userData: any): Promise<any> {
    try {
      const response = await this.http.post(`${this.apiUrl}/auth/register`, userData).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  // DÉCONNEXION
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  // VÉRIFIER SI CONNECTÉ
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // OBTENIR LE TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // OBTENIR L'UTILISATEUR ACTUEL
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
```

### Service Produits que j'ai créé
```typescript
// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://m1p13mean-niaina-1.onrender.com/api/products';

  constructor(private http: HttpClient) {}

  // RÉCUPÉRER TOUS LES PRODUITS
  getProducts(filters?: any): Observable<any> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get(this.apiUrl, { params });
  }

  // RÉCUPÉRER UN PRODUIT
  getProduct(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // CRÉER UN PRODUIT (nécessite authentification)
  createProduct(productData: any): Observable<any> {
    return this.http.post(this.apiUrl, productData);
  }

  // METTRE À JOUR UN PRODUIT
  updateProduct(id: string, productData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, productData);
  }

  // SUPPRIMER UN PRODUIT
  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

## 🔐 3. INTERCEPTEURS HTTP

### Comment j'explique un intercepteur
Un intercepteur, c'est comme un garde du corps qui intercepte **toutes les requêtes HTTP** pour ajouter des en-têtes, gérer les erreurs, etc.

### Exemple concret : AuthInterceptor
Voici comment j'ai créé l'intercepteur d'authentification :

```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    // Je récupère le token
    const token = this.authService.getToken();

    // Si token existe, je l'ajoute aux en-têtes
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    // Sinon, je continue sans modification
    return next.handle(req);
  }
}
```

### Comment j'enregistre l'intercepteur
```typescript
// app.module.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}
```

## 🛡️ 4. GUARDS (PROTECTION DES ROUTES)

### Comment j'explique un guard
Un guard, c'est comme un videur qui protège les routes en vérifiant les **permissions d'accès**.

### Exemple concret : AuthGuard
Voici comment j'ai créé le guard d'authentification :

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;  // J'autorise l'accès
    } else {
      this.router.navigate(['/login']);  // Je redirige vers login
      return false; // Je bloque l'accès
    }
  }
}
```

### Comment j'utilise le guard dans mes routes
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]  // Protection par guard
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
```

## 📱 5. COMPOSANTS AVANCÉS

### Exemple : Composant Liste Produits que j'ai créé
```typescript
// product-list.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="product-list">
      <h2>Produits</h2>
      
      <!-- FILTRES -->
      <div class="filters">
        <input 
          [(ngModel)]="searchTerm" 
          (input)="onSearch()"
          placeholder="Rechercher...">
        
        <select [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
          <option value="">Toutes catégories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- LOADING -->
      <div *ngIf="loading" class="loading">Chargement...</div>

      <!-- LISTE PRODUITS -->
      <div class="products-grid" *ngIf="!loading">
        <div 
          *ngFor="let product of products" 
          class="product-card"
          (click)="selectProduct(product)">
          
          <img [src]="product.images[0]" [alt]="product.nom">
          <h3>{{ product.nom }}</h3>
          <p>{{ product.prix | currency:'EUR' }}</p>
          <span class="category">{{ product.categorie }}</span>
        </div>
      </div>

      <!-- PAGINATION -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button 
          *ngFor="let page of getPages()" 
          [class.active]="page === currentPage"
          (click)="goToPage(page)">
          {{ page }}
        </button>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  categories: string[] = [];
  loading: boolean = false;
  
  // FILTRES
  searchTerm: string = '';
  selectedCategory: string = '';
  
  // PAGINATION
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 12;

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  async loadProducts() {
    this.loading = true;
    
    const filters = {
      page: this.currentPage,
      limit: this.limit,
      search: this.searchTerm,
      categorie: this.selectedCategory
    };

    try {
      const response = await this.productService.getProducts(filters).toPromise();
      this.products = response.products;
      this.totalPages = response.totalPages;
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.productService.getCategories().toPromise();
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  }

  onSearch() {
    this.currentPage = 1;
    this.loadProducts();
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  selectProduct(product: any) {
    // Navigation vers détail produit
    this.router.navigate(['/products', product._id]);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadProducts();
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
```

## 🔄 6. FLUX DE DONNÉES FRONTEND ↔ BACKEND

### Exemple : Comment fonctionne la connexion utilisateur
```
1. Utilisateur saisit email/password dans mon LoginComponent
2. Mon LoginComponent.login() appelle AuthService.login()
3. Mon AuthService fait requête HTTP POST /api/auth/login
4. Mon AuthInterceptor ajoute automatiquement les en-têtes
5. Backend traite la requête et renvoie { token, user }
6. Mon AuthService sauvegarde token dans localStorage
7. Mon AuthService met à jour currentUserSubject
8. Mes composants abonnés reçoivent la mise à jour
9. Redirection vers dashboard
```

### Exemple : Comment fonctionne le chargement de produits
```
1. Mon ProductListComponent.ngOnInit() appelle loadProducts()
2. Mon ProductService.getProducts() fait requête GET /api/products
3. Backend renvoie { products, totalPages, total }
4. Mon ProductListComponent met à jour this.products
5. Mon template Angular affiche la liste via *ngFor
6. Utilisateur peut filtrer/paginer → nouvelles requêtes
```

## 🎨 7. DATA BINDING ANGULAR

### Types de binding que j'utilise
```html
<!-- INTERPOLATION -->
<h1>{{ title }}</h1>

<!-- PROPERTY BINDING -->
<img [src]="imageUrl" [alt]="imageAlt">
<button [disabled]="isLoading">Cliquer</button>

<!-- EVENT BINDING -->
<button (click)="onClick()">Cliquer</button>
<input (input)="onInput($event)">

<!-- TWO-WAY BINDING -->
<input [(ngModel)]="username">
```

### Directives structurelles que j'utilise
```html
<!-- *ngIf : Affichage conditionnel -->
<div *ngIf="isLoggedIn">Bienvenue !</div>
<div *ngIf="error; else noError">Erreur: {{ error }}</div>

<!-- *ngFor : Boucles -->
<div *ngFor="let product of products; let i = index">
  {{ i + 1 }}. {{ product.nom }}
</div>

<!-- *ngSwitch : Conditions multiples -->
<div [ngSwitch]="userRole">
  <div *ngSwitchCase="'admin'">Interface Admin</div>
  <div *ngSwitchCase="'boutique'">Interface Boutique</div>
  <div *ngSwitchDefault">Interface Client</div>
</div>
```

## 🚀 8. COMMENT TU PEUX MODIFIER LE FRONTEND

### Pour ajouter un nouveau composant
```bash
ng generate component ton-composant
```

### Pour ajouter un nouveau service
```bash
ng generate service services/ton-service
```

### Pour ajouter une nouvelle route
```typescript
// app-routing.module.ts
const routes: Routes = [
  // ... routes existantes
  { path: 'ta-nouvelle-page', component: TaNouvellePageComponent }
];
```

### Pour connecter à une nouvelle API
```typescript
// Dans un service
getNouvellesDonnees(): Observable<any> {
  return this.http.get(`${this.apiUrl}/nouvelles-donnees`);
}

// Dans un composant
async chargerDonnees() {
  try {
    const donnees = await this.monService.getNouvellesDonnees().toPromise();
    this.donnees = donnees;
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

Voilà comment j'ai construit notre interface utilisateur moderne et réactive avec Angular ! Si tu as des questions, n'hésite pas ! 🎉