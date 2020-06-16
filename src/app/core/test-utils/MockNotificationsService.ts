import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Notification } from '@core/model/notifications.model';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export class MockNotificationsService extends NotificationsService {
  private approved = false;

  public static factory(approved = false) {
    return (httpClient: HttpClient) => {
      const service = new MockNotificationsService(httpClient);
      service.approved = approved;
      return service;
    };
  }

  get notifications(): Notification[] {
    return [];
  }

  public getNotificationDetails(): Observable<any> {
    return of({
      created: '2020-01-01',
      type: 'BECOMEAPARENT',
      typeContent: {
        status: this.approved ? 'Approved' : 'Rejected'
      }
    });
  }
}
