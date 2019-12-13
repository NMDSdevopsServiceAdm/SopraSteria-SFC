import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationRequest } from '@core/model/notifications.model';
import { filter } from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  getAllNotifications() {
    return this.http.get<Notification[]>('/api/user/my/notifications');
  }
  public getNotification(notificationUid: string): Notification {
    return filter(this.notifications, { notificationUid })[0];
  }

  set notifications(notifications: Notification[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): Notification[] {
    return this.notifications$.value;
  }
  public getNotificationDetails(notificationId): Observable<any> {
    return this.http.get<any>(`/api/user/my/notifications/${notificationId}`);
  }
  public approveOwnership(ownershipChangeRequestId, data): Observable<NotificationRequest> {
    return this.http.put<any>(`/api/ownershipRequest/${ownershipChangeRequestId}`, data);
  }
  public setNoticationViewed(notificationUid: string): Observable<Notification> {
    return this.http.post<any>(`/api/user/my/notifications/${notificationUid}`, { isViewed: true });
  }
}
