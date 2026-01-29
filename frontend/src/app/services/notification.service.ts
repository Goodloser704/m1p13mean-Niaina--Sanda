import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

export interface Notification {
  _id: string;
  type: 'boutique_registration' | 'order_placed' | 'payment_received' | 'system_alert';
  title: string;
  message: string;
  recipient: string;
  recipientRole: 'admin' | 'boutique' | 'client';
  relatedEntity?: {
    entityType: string;
    entityId: string;
  };
  data: any;
  isRead: boolean;
  isArchived: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired: boolean;
  actionType: 'approve_boutique' | 'review_order' | 'verify_payment' | 'none';
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  byType: Array<{
    _id: string;
    total: number;
    unread: number;
    actionRequired: number;
  }>;
  totalUnread: number;
  totalActionRequired: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = this.getBackendUrl() + '/api/notifications';

  // État des notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Polling automatique des notifications toutes les 30 secondes
    this.startPolling();
  }

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
   * 🔄 Démarrer le polling automatique
   */
  private startPolling(): void {
    // Polling toutes les 30 secondes
    interval(30000).pipe(
      switchMap(() => this.refreshNotifications())
    ).subscribe();
  }

  /**
   * 📋 Obtenir les notifications de l'utilisateur
   */
  getNotifications(options: {
    page?: number;
    limit?: number;
    includeRead?: boolean;
    type?: string;
  } = {}): Observable<{
    notifications: Notification[];
    unreadCount: number;
    pagination: any;
  }> {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.includeRead !== undefined) params.append('includeRead', options.includeRead.toString());
    if (options.type) params.append('type', options.type);

    return this.http.get<{
      notifications: Notification[];
      unreadCount: number;
      pagination: any;
    }>(`${this.API_URL}?${params.toString()}`).pipe(
      tap(response => {
        this.notificationsSubject.next(response.notifications);
        this.unreadCountSubject.next(response.unreadCount);
      })
    );
  }

  /**
   * 🔢 Obtenir le nombre de notifications non lues
   */
  getUnreadCount(): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(`${this.API_URL}/count`).pipe(
      tap(response => {
        this.unreadCountSubject.next(response.unreadCount);
      })
    );
  }

  /**
   * ✅ Marquer une notification comme lue
   */
  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.refreshNotifications().subscribe();
      })
    );
  }

  /**
   * ✅ Marquer toutes les notifications comme lues
   */
  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.API_URL}/read-all`, {}).pipe(
      tap(() => {
        this.refreshNotifications().subscribe();
      })
    );
  }

  /**
   * 🗑️ Archiver une notification
   */
  archiveNotification(notificationId: string): Observable<any> {
    return this.http.put(`${this.API_URL}/${notificationId}/archive`, {}).pipe(
      tap(() => {
        this.refreshNotifications().subscribe();
      })
    );
  }

  /**
   * 📊 Obtenir les statistiques admin
   */
  getAdminStats(): Observable<NotificationStats> {
    return this.http.get<NotificationStats>(`${this.API_URL}/admin/stats`);
  }

  /**
   * 🔄 Rafraîchir les notifications
   */
  refreshNotifications(): Observable<any> {
    return this.getNotifications({ limit: 20, includeRead: true });
  }

  /**
   * 🎨 Obtenir l'icône selon le type de notification
   */
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'boutique_registration': return '🏪';
      case 'order_placed': return '📦';
      case 'payment_received': return '💰';
      case 'system_alert': return '⚠️';
      default: return '🔔';
    }
  }

  /**
   * 🎨 Obtenir la couleur selon la priorité
   */
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  }

  /**
   * 📅 Formater la date relative
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  }
}