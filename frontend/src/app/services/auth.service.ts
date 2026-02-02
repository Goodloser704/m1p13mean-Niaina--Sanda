import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private readonly API_URL = `${environment.apiUrl}/auth`;
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
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('📦 Utilisateur récupéré du stockage:', user.email, user.role);
        return user;
      } else {
        console.log('📦 Aucun utilisateur trouvé dans le stockage');
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * 🎫 Obtenir le token
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    console.log('🎫 Token récupéré:', token ? 'Présent' : 'Absent');
    return token;
  }

  /**
   * ✅ Vérifier si un token valide existe
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    const isValid = !!(token && user);
    
    console.log('🔍 Vérification token au démarrage:', {
      hasToken: !!token,
      hasUser: !!user,
      isValid: isValid,
      userEmail: user?.email
    });
    
    return isValid;
  }

  /**
   * 🔍 Vérifier la validité du token
   */
  private checkTokenValidity(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    
    if (token && user) {
      // D'abord, restaurer l'état depuis le stockage local
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      console.log('🔄 Session restaurée depuis le stockage local:', user.email);
      
      // Ensuite, vérifier optionnellement avec le serveur (sans déconnecter en cas d'erreur)
      this.http.get(`${this.API_URL}/me`).subscribe({
        next: (response: any) => {
          console.log('✅ Token validé avec le serveur');
          // Mettre à jour avec les données fraîches du serveur
          this.currentUserSubject.next(response.user);
          // Sauvegarder les données mises à jour
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        },
        error: (error) => {
          console.warn('⚠️ Impossible de valider le token avec le serveur:', error.message);
          console.log('🔄 Utilisation des données en cache - utilisateur reste connecté');
          // Ne pas déconnecter, garder la session locale
          // L'utilisateur reste connecté avec les données en cache
        }
      });
    } else {
      console.log('❌ Aucune session trouvée');
      this.isLoggedInSubject.next(false);
      this.currentUserSubject.next(null);
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

  /**
   * 📝 Mettre à jour le profil utilisateur
   */
  updateProfile(profileData: any): Observable<any> {
    console.group('🔍 DEBUG - AuthService.updateProfile');
    console.log('📤 Données reçues:', profileData);
    console.log('🔗 URL complète:', `${this.API_URL}/profile`);
    console.log('🎫 Token présent:', !!this.getToken());
    console.groupEnd();
    
    return this.http.put(`${this.API_URL}/profile`, profileData)
      .pipe(
        tap(response => {
          console.group('✅ SUCCESS - AuthService.updateProfile');
          console.log('📥 Réponse:', response);
          console.groupEnd();
        }),
        catchError(error => {
          console.group('❌ ERROR - AuthService.updateProfile');
          console.log('🔴 Erreur HTTP complète:', error);
          console.log('📊 Status:', error.status);
          console.log('📝 Status Text:', error.statusText);
          console.log('🗂️ Error body:', error.error);
          console.log('🔗 URL appelée:', error.url);
          console.groupEnd();
          throw error;
        })
      );
  }

  /**
   * 🔑 Changer le mot de passe
   */
  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.API_URL}/change-password`, passwordData);
  }

  /**
   * 🗑️ Supprimer le compte utilisateur
   */
  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.API_URL}/account`);
  }

  /**
   * 🔄 Forcer la restauration de session depuis le stockage local
   */
  forceRestoreSession(): void {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    
    console.log('🔄 Tentative de restauration forcée de session');
    
    if (token && user) {
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      console.log('✅ Session restaurée avec succès:', user.email);
    } else {
      console.log('❌ Impossible de restaurer la session - données manquantes');
    }
  }

  /**
   * 🔄 Rafraîchir les données de l'utilisateur actuel
   */
  refreshCurrentUser(): void {
    this.http.get(`${this.API_URL}/me`).subscribe({
      next: (response: any) => {
        this.currentUserSubject.next(response.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement du profil:', error);
      }
    });
  }
}