import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class NotificationResolver implements Resolve<any> {
  constructor(
    private router: Router,
    private establishmentService: EstablishmentService,
    private notificationsService: NotificationsService
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    const workplaceUid = this.establishmentService.establishmentId;
    const notificationUid = route.paramMap.get('notificationuid');
    return this.notificationsService.getNotification(workplaceUid, notificationUid).pipe(
      tap(notification => (this.notificationsService.activeNotification = notification)),
      catchError(() => {
        this.router.navigate(['/dashboard']);
        return of(null);
      })
    );
  }
}
