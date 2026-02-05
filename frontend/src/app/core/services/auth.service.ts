import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthInfo, LoginResponse } from '../models/auth-info';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  private setSession(res: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
  }

  login(authInfo: AuthInfo): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/api/auth/login`, authInfo)
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

  // ---- Getters ----

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
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
