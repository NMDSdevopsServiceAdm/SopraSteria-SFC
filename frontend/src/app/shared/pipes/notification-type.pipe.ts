import { Pipe, PipeTransform } from '@angular/core';
import { NotificationType } from '@core/model/notifications.model';

@Pipe({
  name: 'notificationType',
})
export class NotificationTypePipe implements PipeTransform {
  transform(value: NotificationType): string {
    return NotificationType[value] || value;
  }
}
