import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Notification, NotificationData } from '@core/model/notifications.model';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Observable, of } from 'rxjs';

@Injectable()
export class MockNotificationsService extends NotificationsService {
  private approved = false;
  private singleNotification: Notification = {
    created: '2020-01-01',
    type: 'BECOMEAPARENT',
    typeContent: {
      status: this.approved ? 'Approved' : 'Rejected',
    },
    isViewed: false,
    notificationUid: ''
  }

  public static factory(approved = false) {
    return (httpClient: HttpClient) => {
      const service = new MockNotificationsService(httpClient);
      service.approved = approved;
      return service;
    };
  }

  get notifications(): Notification[] {
    return [
      {
        notificationUid: 'test-uid',
        created: '2020-01-01',
        type: 'BECOMEAPARENT',
        isViewed: true,
        typeContent: {
          status: 'Rejected',
        },
      },
      {
        notificationUid: 'test-uid',
        created: '2023-01-01',
        type: 'OWNERCHANGE',
        isViewed: true,
        typeContent: {
          status: 'Approved',
        },
      },
    ];
  }

  set notifications(notifications: Notification[]) {
    return;
  }

  public getNotificationDetails(): Observable<any> {
    return of({
      created: '2020-01-01',
      type: 'BECOMEAPARENT',
      typeContent: {
        status: this.approved ? 'Approved' : 'Rejected',
      },
    });
  }

  public setNotificationViewed(): Observable<NotificationData> {
    return of({
      establishmentNotification: true,
      notification: this.singleNotification,
    });
  }

  public getAllNotifications(): Observable<any> {
    return of({
      notifications: [
      {
        created: '2020-01-01',
        type: 'BECOMEAPARENT',
        typeContent: {
          status: 'Rejected',
        },
      },
      {
        created: '2023-01-01',
        type: 'OWNERCHANGE',
        typeContent: {
          status: 'Approved',
        },
      },
    ],
    count: 2});
  }

  public deleteNotifications(notificationsForDeletion: Array<any>): Observable<any> {
    return of({});
  }
}
