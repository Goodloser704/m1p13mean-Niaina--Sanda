import { timeAgo } from '../../../core/functions/date-function';
import { Notification } from '../../../core/models/notification.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationsService } from './../../../core/services/notifications.service';
import { Component, OnInit, signal } from '@angular/core';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  notifications = signal<Notification[]>([]);
  total = signal(0);
  unreadCount = signal(0);
  page = signal(1);
  limit = 10;
  isLoading = signal(false);

  constructor(
    private notificationsService: NotificationsService,
    private authService: AuthService
  ) {

  }

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    this.isLoading.set(true);

    this.notificationsService
      .getNotifications(userId, this.page(), this.limit)
      .subscribe({
        next: (res) => {
          // tri récent en haut
          const sorted = res.data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          );

          this.notifications.set(sorted);
          this.total.set(res.total);
          this.unreadCount.set(res.unreadCount);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error(err);
        }
      });
  }

  markAsRead(notification: Notification) {
    if (notification.estLu) return;

    this.notificationsService
      .markAsRead(notification._id)
      .subscribe({
        next: () => {
          notification.estLu = true;
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
              estLu: true
            }))
          );

          this.unreadCount.set(0);
        },
        error: (err) => {
          console.error(err);
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
