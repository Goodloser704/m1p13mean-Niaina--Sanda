import { finalize } from 'rxjs';
import { timeAgo } from '../../../core/functions/date-function';
import { Notification } from '../../../core/models/notification.model';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { NotificationsService } from './../../../core/services/notifications.service';
import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { logSafe } from '../../../core/functions/console-function';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit, AfterViewInit {
  @ViewChild('childSection') childSection!: ElementRef;
  
  notifications = signal<Notification[]>([]);
  total = signal(0);
  unreadCount = signal(0);
  page = signal(1);
  limit = 10;
  loaderService = inject(LoaderService);

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.loadNotifications();
  }

  ngAfterViewInit() {
    this.childSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  loadNotifications() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.loaderService.show();

    this.notificationsService
      .getNotifications(userId, this.page(), this.limit)
      .pipe(finalize(() => this.loaderService.hide()))
      .subscribe({
        next: (res) => {
          // tri récent en haut
          const sorted = res.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

          logSafe(res.data, 'Notifications: ');

          this.notifications.set(sorted);
          this.total.set(res.total);
          this.unreadCount.set(res.unreadCount);
        },
        error: console.error
      });
  }

  markAsRead(notification: Notification) {
    if (notification.isRead) return;

    this.notificationsService
      .markAsRead(notification._id)
      .subscribe({
        next: () => {
          notification.isRead = true;
          this.unreadCount.update(v => v - 1);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  markAllAsRead() {
    this.notificationsService
      .markAllAsRead()
      .subscribe({
        next: () => {
          this.notifications.update((notifications) => 
            notifications.map(n => ({
              ...n,
              isRead: true
            }))
          );

          this.unreadCount.set(0);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  archiveNotification(notification: Notification) {
    if (!confirm('Archiver cette notification ?')) return;

    this.notificationsService
      .archiveNotification(notification._id)
      .subscribe({
        next: () => {
          // Retirer la notification de la liste
          this.notifications.update((notifications) => 
            notifications.filter(n => n._id !== notification._id)
          );
          
          this.total.update(v => v - 1);
          
          if (!notification.isRead) {
            this.unreadCount.update(v => v - 1);
          }
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l\'archivage');
        }
      });
  }

  nextPage() {
    this.page.update(v => v + 1);
    this.loadNotifications();
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update(v => v - 1);
      this.loadNotifications();
    }
  }

  timeAgo(date: string): string {
    return timeAgo(date);
  }
}
