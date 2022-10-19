import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Establishment } from '@core/model/establishment.model';

@Injectable()
export class NotificationsListResolver implements Resolve<any> {
  constructor(private establishmentService: EstablishmentService, private notificationsService: NotificationsService) {}

  resolve(route: ActivatedRouteSnapshot) {
    return this.notificationsService.getAllNotifications(this.establishmentService.establishmentId).pipe(
      tap((notifications) => (this.notificationsService.notifications = notifications)),
      catchError(() => {
        return of([]);
      }),
    );
  }
}
