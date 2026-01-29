import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <!-- Header avec compteur -->
      <div class="notifications-header">
        <h2>🔔 Notifications</h2>
        <div class="notification-actions">
          <span class="unread-badge" *ngIf="unreadCount > 0">
            {{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }}
          </span>
          <button 
            class="btn-small" 
            (click)="markAllAsRead()"
            *ngIf="unreadCount > 0">
            ✅ Tout marquer comme lu
          </button>
          <button class="btn-small" (click)="refreshNotifications()">
            🔄 Actualiser
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="notification-filters">
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'all'"
          (click)="setFilter('all')">
          Toutes ({{ notifications.length }})
        </button>
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'unread'"
          (click)="setFilter('unread')">
          Non lues ({{ unreadCount }})
        </button>
        <button 
          class="filter-btn"
          [class.active]="selectedFilter === 'action'"
          (click)="setFilter('action')">
          Action requise ({{ getActionRequiredCount() }})
        </button>
      </div>

      <!-- Liste des notifications -->
      <div class="notifications-list">
        <div 
          *ngFor="let notification of getFilteredNotifications()" 
          class="notification-item"
          [class.unread]="!notification.isRead"
          [class.high-priority]="notification.priority === 'high' || notification.priority === 'urgent'">
          
          <!-- Icône et priorité -->
          <div class="notification-icon">
            <span class="icon">{{ getNotificationIcon(notification.type) }}</span>
            <div 
              class="priority-indicator"
              [style.background-color]="getPriorityColor(notification.priority)">
            </div>
          </div>

          <!-- Contenu -->
          <div class="notification-content" (click)="markAsRead(notification._id)">
            <div class="notification-header">
              <h4>{{ notification.title }}</h4>
              <span class="notification-time">{{ getRelativeTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            
            <!-- Actions spécifiques -->
            <div class="notification-actions" *ngIf="notification.actionRequired">
              <div *ngIf="notification.actionType === 'approve_boutique'" class="boutique-actions">
                <button 
                  class="btn-approve"
                  (click)="approveBoutique(notification.relatedEntity?.entityId, $event)">
                  ✅ Approuver
                </button>
                <button 
                  class="btn-reject"
                  (click)="rejectBoutique(notification.relatedEntity?.entityId, $event)">
                  ❌ Rejeter
                </button>
              </div>
            </div>
          </div>

          <!-- Actions générales -->
          <div class="notification-menu">
            <button 
              class="btn-icon"
              (click)="markAsRead(notification._id)"
              *ngIf="!notification.isRead"
              title="Marquer comme lu">
              ✅
            </button>
            <button 
              class="btn-icon"
              (click)="archiveNotification(notification._id)"
              title="Archiver">
              🗑️
            </button>
          </div>
        </div>

        <!-- Message si aucune notification -->
        <div class="no-notifications" *ngIf="getFilteredNotifications().length === 0">
          <div class="empty-state">
            <span class="empty-icon">🔔</span>
            <h3>Aucune notification</h3>
            <p>{{ getEmptyMessage() }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="notifications-pagination" *ngIf="notifications.length >= 20">
        <button class="btn-small" (click)="loadMore()">
          Charger plus
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 1rem;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .notifications-header h2 {
      margin: 0;
      color: #333;
    }

    .notification-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .unread-badge {
      background: #dc3545;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .notification-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .filter-btn {
      padding: 0.5rem 1rem;
      border: 2px solid #ddd;
      background: white;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .filter-btn:hover {
      border-color: #667eea;
    }

    .filter-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }

    .notification-item:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    .notification-item.unread {
      border-left-color: #667eea;
      background: #f8f9ff;
    }

    .notification-item.high-priority {
      border-left-color: #dc3545;
    }

    .notification-icon {
      position: relative;
      flex-shrink: 0;
    }

    .notification-icon .icon {
      font-size: 1.5rem;
      display: block;
    }

    .priority-indicator {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid white;
    }

    .notification-content {
      flex: 1;
      cursor: pointer;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .notification-header h4 {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }

    .notification-time {
      color: #666;
      font-size: 0.8rem;
      white-space: nowrap;
    }

    .notification-message {
      color: #666;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .boutique-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .btn-approve {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .btn-reject {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .notification-menu {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .btn-icon:hover {
      background: #f0f0f0;
    }

    .btn-small {
      padding: 0.25rem 0.75rem;
      font-size: 0.8rem;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-small:hover {
      background: #5a6268;
    }

    .no-notifications {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-state .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      color: #666;
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: #999;
    }

    .notifications-pagination {
      text-align: center;
      margin-top: 2rem;
    }

    @media (max-width: 768px) {
      .notifications-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .notification-actions {
        justify-content: center;
      }

      .notification-filters {
        flex-wrap: wrap;
      }

      .notification-item {
        flex-direction: column;
        gap: 0.5rem;
      }

      .notification-header {
        flex-direction: column;
        gap: 0.25rem;
      }
    }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  selectedFilter: 'all' | 'unread' | 'action' = 'all';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadNotifications();
    
    // S'abonner aux mises à jour
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
      })
    );
    
    this.subscriptions.push(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadNotifications() {
    this.notificationService.getNotifications({ limit: 20, includeRead: true }).subscribe({
      next: (response) => {
        console.log('✅ Notifications chargées:', response.notifications.length);
      },
      error: (error) => {
        console.error('❌ Erreur chargement notifications:', error);
      }
    });
  }

  refreshNotifications() {
    this.notificationService.refreshNotifications().subscribe();
  }

  markAsRead(notificationId: string) {
    this.notificationService.markAsRead(notificationId).subscribe({
      next: () => {
        console.log('✅ Notification marquée comme lue');
      },
      error: (error) => {
        console.error('❌ Erreur marquage notification:', error);
      }
    });
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        console.log('✅ Toutes les notifications marquées comme lues');
      },
      error: (error) => {
        console.error('❌ Erreur marquage toutes notifications:', error);
      }
    });
  }

  archiveNotification(notificationId: string) {
    this.notificationService.archiveNotification(notificationId).subscribe({
      next: () => {
        console.log('✅ Notification archivée');
      },
      error: (error) => {
        console.error('❌ Erreur archivage notification:', error);
      }
    });
  }

  approveBoutique(boutiqueId: string | undefined, event: Event) {
    event.stopPropagation();
    
    if (!boutiqueId) return;
    
    this.adminService.approveBoutique(boutiqueId).subscribe({
      next: (response) => {
        console.log('✅ Boutique approuvée:', response.message);
        alert('Boutique approuvée avec succès !');
        this.refreshNotifications();
      },
      error: (error) => {
        console.error('❌ Erreur approbation boutique:', error);
        alert('Erreur lors de l\'approbation de la boutique');
      }
    });
  }

  rejectBoutique(boutiqueId: string | undefined, event: Event) {
    event.stopPropagation();
    
    if (!boutiqueId) return;
    
    const reason = prompt('Raison du rejet (optionnel):');
    
    this.adminService.rejectBoutique(boutiqueId, reason || '').subscribe({
      next: (response) => {
        console.log('❌ Boutique rejetée:', response.message);
        alert('Boutique rejetée');
        this.refreshNotifications();
      },
      error: (error) => {
        console.error('❌ Erreur rejet boutique:', error);
        alert('Erreur lors du rejet de la boutique');
      }
    });
  }

  setFilter(filter: 'all' | 'unread' | 'action') {
    this.selectedFilter = filter;
  }

  getFilteredNotifications(): Notification[] {
    switch (this.selectedFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.isRead);
      case 'action':
        return this.notifications.filter(n => n.actionRequired && !n.isRead);
      default:
        return this.notifications;
    }
  }

  getActionRequiredCount(): number {
    return this.notifications.filter(n => n.actionRequired && !n.isRead).length;
  }

  getEmptyMessage(): string {
    switch (this.selectedFilter) {
      case 'unread':
        return 'Toutes vos notifications ont été lues';
      case 'action':
        return 'Aucune action n\'est requise pour le moment';
      default:
        return 'Vous n\'avez aucune notification';
    }
  }

  getNotificationIcon(type: string): string {
    return this.notificationService.getNotificationIcon(type);
  }

  getPriorityColor(priority: string): string {
    return this.notificationService.getPriorityColor(priority);
  }

  getRelativeTime(dateString: string): string {
    return this.notificationService.getRelativeTime(dateString);
  }

  loadMore() {
    // TODO: Implémenter la pagination
    console.log('Charger plus de notifications...');
  }
}