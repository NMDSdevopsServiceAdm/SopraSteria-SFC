import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Notification } from '@core/model/notifications.model';
import { Observable, of } from 'rxjs';

export class MockNotificationsService extends NotificationsService {
  get notifications(): Notification[] {
    return [];
  }

  public getNotificationDetails(): Observable<any> {
    return of({
      created: '2020-01-01',
      type: 'BECOMEAPARENT'
    });
  }
}
