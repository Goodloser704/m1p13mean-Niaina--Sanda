import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthInfo, AuthResponse } from '../models/auth-info';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl: string = environment.apiUrl;
  
  private readonly USER_KEY = 'auth_user';
  private readonly TOKEN_KEY = 'auth_token';

  registrationRole = signal<UserRole | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  private setSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
  }

  // --- Fonctions appel api ---

  login(authInfo: AuthInfo): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/login`, authInfo)
      .pipe(
        tap(res => {
          this.setSession(res);
          this.redirectByRole(res.user.role);
        })
      );
  }
  
  logOut() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }

  inscription(user: User) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/api/auth/register`, user)
      .pipe(
        tap(res => {
          this.setSession(res);
          this.redirectByRole(res.user.role);
        })
      );
  }

  // ----- End fonctions -----

  // ---- Getters ----

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (user) {
      const userObject = JSON.parse(user);
      console.log(`User not null, role: ${userObject.role}`);
      return userObject;
    } else {
      console.warn("User is null in local storage");
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // -- End Getters --

  // ---- Setter ----

  setUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // -- End Setter --

  // Gestion des tokens
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  // Redirection des roles
  redirectByRole(role: UserRole) {
    console.log(`Redirect to ${role}`);
    this.router.navigate([this.getHomeByRole(role)]);
  }

  getHomeByRole(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return '/admin/dashboard';
      case UserRole.Commercant:
        return '/commercant/home';
      case UserRole.Acheteur:
        return '/acheteur/home';
      default:
        return '/login';
    }
  }
}
