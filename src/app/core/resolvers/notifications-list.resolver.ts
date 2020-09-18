import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class NotificationsListResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private notificationsService: NotificationsService) {}

  resolve() {
    return this.notificationsService.getAllNotifications().pipe(
      tap((notifications) => (this.notificationsService.notifications = notifications)),
      catchError(() => {
        return of([]);
      }),
    );
  }
}
