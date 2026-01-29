import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PendingBoutique {
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  adresse?: any;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  businessInfo?: {
    siret?: string;
    description?: string;
    category?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly API_URL = this.getBackendUrl() + '/api/auth';

  constructor(private http: HttpClient) {}

  /**
   * 🌐 Obtenir l'URL du backend selon l'environnement
   */
  private getBackendUrl(): string {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ''; // URL relative pour utiliser le proxy
      }
      
      if (hostname.includes('vercel.app')) {
        return 'https://m1p13mean-niaina-1.onrender.com';
      }
    }
    
    return 'https://m1p13mean-niaina-1.onrender.com';
  }

  /**
   * 📋 Obtenir les boutiques en attente de validation
   */
  getPendingBoutiques(): Observable<{
    boutiques: PendingBoutique[];
    count: number;
  }> {
    return this.http.get<{
      boutiques: PendingBoutique[];
      count: number;
    }>(`${this.API_URL}/boutiques/pending`);
  }

  /**
   * ✅ Approuver une boutique
   */
  approveBoutique(boutiqueId: string): Observable<{
    message: string;
    boutique: any;
  }> {
    return this.http.put<{
      message: string;
      boutique: any;
    }>(`${this.API_URL}/boutiques/${boutiqueId}/approve`, {});
  }

  /**
   * ❌ Rejeter une boutique
   */
  rejectBoutique(boutiqueId: string, reason?: string): Observable<{
    message: string;
    boutique: any;
  }> {
    return this.http.put<{
      message: string;
      boutique: any;
    }>(`${this.API_URL}/boutiques/${boutiqueId}/reject`, { reason });
  }

  /**
   * 🔍 Rechercher des utilisateurs
   */
  searchUsers(query: string, role?: string): Observable<{
    users: any[];
    count: number;
  }> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (role) params.append('role', role);

    return this.http.get<{
      users: any[];
      count: number;
    }>(`${this.API_URL}/users/search?${params.toString()}`);
  }

  /**
   * 🔄 Mettre à jour le statut d'un utilisateur
   */
  updateUserStatus(userId: string, isActive: boolean): Observable<{
    message: string;
    user: any;
  }> {
    return this.http.put<{
      message: string;
      user: any;
    }>(`${this.API_URL}/users/${userId}/status`, { isActive });
  }
}