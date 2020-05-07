import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Notification } from '@core/model/notifications.model';

export class MockNotificationsService extends NotificationsService {
  get notifications(): Notification[] {
    return [];
  }
}
