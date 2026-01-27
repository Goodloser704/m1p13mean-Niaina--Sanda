# 🔗 Communication Frontend ↔ Backend - Guide d'Explication

## 📋 Vue d'Ensemble

Salut ! Je vais t'expliquer comment j'ai fait communiquer Angular (frontend) et Express.js (backend) via **requêtes HTTP** et **API REST**.

```
┌─────────────────┐    HTTP Request     ┌─────────────────┐
│   ANGULAR       │ ──────────────────► │   EXPRESS.JS    │
│   (Frontend)    │                     │   (Backend)     │
│                 │ ◄────────────────── │                 │
│ - HttpClient    │    HTTP Response    │ - Routes        │
│ - Services      │                     │ - Controllers   │
│ - Components    │                     │ - Models        │
└─────────────────┘                     └─────────────────┘
```

## 🌐 1. PROTOCOLE HTTP

### Les méthodes HTTP que j'utilise
```
GET    → Je récupère des données (lecture)
POST   → Je crée des données
PUT    → Je mets à jour des données complètes
PATCH  → Je mets à jour des données partielles
DELETE → Je supprime des données
```

### Structure d'une requête HTTP que j'envoie
```
POST /api/auth/login HTTP/1.1
Host: m1p13mean-niaina-1.onrender.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "email": "admin@mall.com",
  "password": "admin123"
}
```

### Structure d'une réponse HTTP que je reçois
```
HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "admin@mall.com",
    "role": "admin"
  }
}
```

## 🔧 2. CÔTÉ FRONTEND (ANGULAR)

### Comment j'ai configuré HttpClient
```typescript
// app.module.ts
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    HttpClientModule  // Nécessaire pour mes requêtes HTTP
  ]
})
export class AppModule {}
```

### Service de base que j'ai créé
```typescript
// base.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  protected apiUrl = 'https://m1p13mean-niaina-1.onrender.com/api';

  constructor(protected http: HttpClient) {}

  // MÉTHODE GET GÉNÉRIQUE
  protected get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // MÉTHODE POST GÉNÉRIQUE
  protected post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  // MÉTHODE PUT GÉNÉRIQUE
  protected put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data)
      .pipe(catchError(this.handleError));
  }

  // MÉTHODE DELETE GÉNÉRIQUE
  protected delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // GESTION DES ERREURS
  private handleError(error: any) {
    console.error('Erreur API:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(errorMessage);
  }
}
```

### Service d'authentification que j'ai créé
```typescript
// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseService } from './base.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
    this.loadUserFromStorage();
  }

  // CONNEXION
  async login(email: string, password: string): Promise<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    
    try {
      const response = await this.post<LoginResponse>('auth/login', loginData).toPromise();
      
      // Je sauvegarde localement
      this.saveUserData(response.token, response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // INSCRIPTION
  async register(userData: any): Promise<any> {
    try {
      const response = await this.post('auth/register', userData).toPromise();
      return response;
    } catch (error) {
      throw error;
    }
  }

  // OBTENIR PROFIL UTILISATEUR
  async getProfile(): Promise<any> {
    try {
      const response = await this.get('auth/me').toPromise();
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

  // MÉTHODES UTILITAIRES
  private saveUserData(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
```

### Service produits que j'ai créé
```typescript
// product.service.ts
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';

interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categorie?: string;
  boutique?: string;
  prixMin?: number;
  prixMax?: number;
  sortBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService {

  // RÉCUPÉRER LISTE PRODUITS
  getProducts(filters?: ProductFilters) {
    return this.get('products', filters);
  }

  // RÉCUPÉRER UN PRODUIT
  getProduct(id: string) {
    return this.get(`products/${id}`);
  }

  // CRÉER UN PRODUIT (authentification requise)
  createProduct(productData: any) {
    return this.post('products', productData);
  }

  // METTRE À JOUR UN PRODUIT
  updateProduct(id: string, productData: any) {
    return this.put(`products/${id}`, productData);
  }

  // SUPPRIMER UN PRODUIT
  deleteProduct(id: string) {
    return this.delete(`products/${id}`);
  }

  // RÉCUPÉRER CATÉGORIES
  getCategories() {
    return this.get('products/categories/list');
  }
}
```

## 🛡️ 3. AUTHENTIFICATION ET SÉCURITÉ

### Intercepteur d'authentification que j'ai créé
```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Je récupère le token
    const token = this.authService.getToken();

    // Je clone la requête et ajoute l'en-tête Authorization
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }

    return next.handle(req);
  }
}
```

### Intercepteur d'erreurs que j'ai créé
```typescript
// error.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        
        // Erreur 401 : Token expiré ou invalide
        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }

        // Erreur 403 : Accès refusé
        if (error.status === 403) {
          console.error('Accès refusé - Permissions insuffisantes');
        }

        // Erreur 500 : Erreur serveur
        if (error.status === 500) {
          console.error('Erreur serveur interne');
        }

        return throwError(error);
      })
    );
  }
}
```

## 🔧 4. CÔTÉ BACKEND (EXPRESS.JS)

### Configuration CORS que j'ai mise
```javascript
// server.js
const cors = require('cors');

// Configuration CORS pour autoriser mon frontend
app.use(cors({
  origin: [
    'http://localhost:4200',           // Développement local
    'https://votre-app.vercel.app'     // Production Vercel
  ],
  credentials: true,                   // J'autorise les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Middleware de parsing que j'ai configuré
```javascript
// server.js
app.use(express.json({ limit: '10mb' }));           // Je parse le JSON
app.use(express.urlencoded({ extended: true }));    // Je parse les formulaires
```

### Route d'authentification que j'ai créée
```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. VALIDATION DES DONNÉES
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email et mot de passe requis' 
      });
    }

    // 2. RECHERCHE UTILISATEUR
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Identifiants invalides' 
      });
    }

    // 3. VÉRIFICATION MOT DE PASSE
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Identifiants invalides' 
      });
    }

    // 4. GÉNÉRATION TOKEN JWT
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    // 5. RÉPONSE SUCCÈS
    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
```

### Route produits avec filtres que j'ai créée
```javascript
// routes/products.js
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      categorie, 
      prixMin, 
      prixMax 
    } = req.query;

    // CONSTRUCTION DU FILTRE
    const filter = { isActive: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (categorie) {
      filter.categorie = categorie;
    }
    
    if (prixMin || prixMax) {
      filter.prix = {};
      if (prixMin) filter.prix.$gte = parseFloat(prixMin);
      if (prixMax) filter.prix.$lte = parseFloat(prixMax);
    }

    // EXÉCUTION REQUÊTE
    const products = await Product.find(filter)
      .populate('boutique', 'nom logo')
      .sort({ dateCreation: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(filter);

    // RÉPONSE
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Erreur récupération produits:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
```

## 🔄 5. FLUX COMPLET DE DONNÉES

### Exemple : Comment fonctionne la connexion utilisateur
```
1. FRONTEND (Angular)
   ├── Utilisateur saisit email/password
   ├── Mon LoginComponent.login() appelé
   ├── Mon AuthService.login(email, password)
   └── HttpClient.post('/api/auth/login', {email, password})

2. RÉSEAU
   ├── Requête HTTP POST envoyée
   ├── Headers: Content-Type: application/json
   └── Body: {"email": "admin@mall.com", "password": "admin123"}

3. BACKEND (Express.js)
   ├── Ma route POST /api/auth/login reçue
   ├── Validation des données
   ├── Recherche utilisateur dans MongoDB
   ├── Vérification mot de passe (bcrypt)
   ├── Génération token JWT
   └── Réponse JSON {token, user}

4. FRONTEND (Angular)
   ├── Réception réponse HTTP 200
   ├── Sauvegarde token dans localStorage
   ├── Mise à jour currentUserSubject
   ├── Redirection vers dashboard
   └── Mon intercepteur ajoute token aux futures requêtes
```

### Exemple : Comment fonctionne le chargement de produits avec filtres
```
1. FRONTEND
   ├── Mon ProductListComponent.loadProducts()
   ├── Mon ProductService.getProducts({categorie: 'Mode', page: 1})
   └── HttpClient.get('/api/products?categorie=Mode&page=1')

2. BACKEND
   ├── Ma route GET /api/products
   ├── Extraction query parameters
   ├── Construction filtre MongoDB
   ├── Requête Product.find(filter).populate('boutique')
   └── Réponse {products: [...], totalPages: 5, total: 58}

3. FRONTEND
   ├── Réception données
   ├── Mise à jour this.products = response.products
   └── Mon template Angular affiche via *ngFor
```

## 🚨 6. GESTION DES ERREURS

### Côté Frontend - Comment je gère les erreurs
```typescript
// Dans un composant
async loadData() {
  try {
    this.loading = true;
    const data = await this.productService.getProducts().toPromise();
    this.products = data.products;
  } catch (error) {
    this.error = error;
    console.error('Erreur chargement:', error);
  } finally {
    this.loading = false;
  }
}
```

### Côté Backend - Comment je gère les erreurs
```javascript
// Dans une route
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

## 🔧 7. DEBUGGING ET OUTILS

### Outils de développement que j'utilise
```typescript
// Logs côté frontend
console.log('Requête envoyée:', requestData);
console.log('Réponse reçue:', response);
console.log('Erreur:', error);

// Network tab dans DevTools du navigateur
// Postman pour tester les API
// Angular DevTools pour inspecter les services
```

### Logs côté Backend que j'utilise
```javascript
// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

Voilà comment j'ai créé une communication robuste et sécurisée entre notre frontend et backend ! Si tu as des questions, n'hésite pas ! 🎉