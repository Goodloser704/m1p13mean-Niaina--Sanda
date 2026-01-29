import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'boutique' | 'client';
  telephone?: string;
  adresse?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = this.getBackendUrl() + '/api/auth';
  private readonly TOKEN_KEY = 'mall_token';
  private readonly USER_KEY = 'mall_user';

  // État de l'utilisateur connecté
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // État de connexion
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {
    // Vérifier le token au démarrage
    this.checkTokenValidity();
  }

  /**
   * 🌐 Obtenir l'URL du backend selon l'environnement
   */
  private getBackendUrl(): string {
    // En production, utiliser l'URL de Render
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Si on est sur Vercel (production)
      if (hostname.includes('vercel.app')) {
        return 'https://m1p13mean-niaina-1.onrender.com';
      }
      
      // Si on est en local
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
      }
    }
    
    // Par défaut, utiliser l'URL de production
    return 'https://m1p13mean-niaina-1.onrender.com';
  }

  /**
   * 🔐 Connexion utilisateur
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap(response => {
          this.setSession(response.token, response.user);
        })
      );
  }

  /**
   * 📝 Inscription utilisateur
   */
  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, userData)
      .pipe(
        tap(response => {
          this.setSession(response.token, response.user);
        })
      );
  }

  /**
   * 🚪 Déconnexion
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    
    console.log('🚪 Utilisateur déconnecté');
  }

  /**
   * 💾 Sauvegarder la session
   */
  private setSession(token: string, user: User): void {
    // Sauvegarder dans localStorage (persistant)
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Sauvegarder aussi dans sessionStorage (sécurité)
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Mettre à jour les observables
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
    
    console.log('💾 Session sauvegardée:', user.role, user.email);
  }

  /**
   * 👤 Obtenir l'utilisateur depuis le stockage
   */
  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * 🎫 Obtenir le token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * ✅ Vérifier si un token valide existe
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    return !!(token && user);
  }

  /**
   * 🔍 Vérifier la validité du token
   */
  private checkTokenValidity(): void {
    const token = this.getToken();
    if (token) {
      // Optionnel: Vérifier avec le serveur
      this.http.get(`${this.API_URL}/me`).subscribe({
        next: (response: any) => {
          console.log('✅ Token valide, utilisateur connecté');
          this.currentUserSubject.next(response.user);
          this.isLoggedInSubject.next(true);
        },
        error: () => {
          console.log('❌ Token invalide, déconnexion');
          this.logout();
        }
      });
    }
  }

  /**
   * 👤 Obtenir l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * 🎭 Vérifier le rôle de l'utilisateur
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * 🔐 Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }
}