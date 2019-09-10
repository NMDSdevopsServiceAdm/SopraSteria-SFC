import { Injectable } from '@angular/core';
import { Notification } from '@core/model/notifications.model';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  public notifications$: BehaviorSubject<Notification[]> = new BehaviorSubject(null);
  constructor() {}

  getNotifications(workplaceUid: string) {
    return of([
      { uid: '1', subject: 'Change data owner', read: false, date: '2019-08-21T15:20:53.205Z' },
      { uid: '2', subject: 'Request to become a parent', read: false, date: '2019-08-18T15:20:53.205Z' },
      { uid: '3', subject: 'Remove parent link', read: true, date: '2019-08-13T15:20:53.205Z' },
      { uid: '4', subject: 'Changes to Terms and Conditions', read: false, date: '2019-07-13T15:20:53.205Z' },
      { uid: '6', subject: 'New workplace application', read: true, date: '2019-03-13T15:20:53.205Z' },
    ] as Notification[]);
  }

  set notifications(notifications: Notification[]) {
    this.notifications$.next(notifications);
  }

  get notifications(): Notification[] {
    return this.notifications$.value;
  }
}
