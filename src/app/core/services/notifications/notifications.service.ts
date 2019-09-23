import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification } from '@core/model/notifications.model';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'lodash';

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
}
