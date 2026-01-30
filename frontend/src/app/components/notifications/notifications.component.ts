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
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
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