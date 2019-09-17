import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationSummary } from '@core/model/notifications.model';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<NotificationSummary[]> = new BehaviorSubject(null);
  public activeNotification$: BehaviorSubject<Notification> = new BehaviorSubject(null);
  constructor(private http: HttpClient) {}

  getAllNotifications() {
    return this.http.get<NotificationSummary[]>('/api/user/my/notifications');
  }

  getNotification(workplaceUid: string, notificationUid) {
    return of({
      uid: '1',
      subject: 'Change data owner',
      date: '2019-08-21T15:20:53.205Z',
      status: 'pending',
    } as Notification);
  }

  set notifications(notifications: NotificationSummary[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): NotificationSummary[] {
    return this.notifications$.value;
  }

  set activeNotification(notification: Notification) {
    this.activeNotification$.next(notification);
  }

  get activeNotification(): Notification {
    return this.activeNotification$.value;
  }
}
