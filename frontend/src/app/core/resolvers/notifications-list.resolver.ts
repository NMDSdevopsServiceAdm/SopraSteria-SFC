import { Injectable } from '@angular/core';

import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class NotificationsListResolver  {
  constructor(private establishmentService: EstablishmentService, private notificationsService: NotificationsService) {}

  resolve() {
    const id = this.establishmentService.establishmentId;
    if (id) {
      return this.notificationsService.getAllNotifications(id).pipe(
        tap((notifications) => (this.notificationsService.notifications = notifications.notifications)),
        catchError(() => {
          return of([]);
        }),
      );
    }
    return of(null);
  }
}
