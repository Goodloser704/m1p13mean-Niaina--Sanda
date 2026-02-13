import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Notification, NotificationResponse } from '../models/notification';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

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

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/notifications/read-all`, {});
  }
}
