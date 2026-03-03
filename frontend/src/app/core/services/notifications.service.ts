import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';
import { Notification, NotificationResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService implements OnInit {
  apiUrl: string = environment.apiUrl;

  unreadCount = signal(0);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {}

  getNotifications(
    userId: string,
    page = 1,
    limit = 10
  ): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(
      `${this.apiUrl}/api/users/${userId}/notifications`,
      { params: { page, limit } }
    );
  }

  getUnreadCount() {
    return this.http.get<{ unreadCount: number }>(`${this.apiUrl}/api/notifications/count`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/api/notifications/${notificationId}/read`, 
      {}
    )
      .pipe(tap(() => {
        this.unreadCount.update(c => c - 1);
      }));
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/api/notifications/read-all`, 
      {}
    )
      .pipe(tap(() => {
        this.unreadCount.update(c => 0);
      }));
  }
}
