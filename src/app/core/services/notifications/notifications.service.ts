import { Injectable } from '@angular/core';
import { Notification, NotificationSummary } from '@core/model/notifications.model';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<NotificationSummary[]> = new BehaviorSubject(null);
  public activeNotification$: BehaviorSubject<Notification> = new BehaviorSubject(null);
  constructor() {}

  getAllNotifications() {
    return of([
      { notificationUid: '1', type: 'Change data owner', isViewed: false, created: '2019-08-21T15:20:53.205Z' },
      { notificationUid: '2', type: 'Request to become a parent', isViewed: false, created: '2019-08-18T15:20:53.205Z' },
      { notificationUid: '3', type: 'Remove parent link', isViewed: true, created: '2019-08-13T15:20:53.205Z' },
      { notificationUid: '4', type: 'Changes to Terms and Conditions', isViewed: false, created: '2019-07-13T15:20:53.205Z' },
      { notificationUid: '6', type: 'New workplace application', isViewed: true, created: '2019-03-13T15:20:53.205Z' },
    ] as NotificationSummary[]);
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
