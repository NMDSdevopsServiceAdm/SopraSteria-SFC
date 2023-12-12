import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SwitchWorkplaceService {
  public notificationData: any;

  constructor(
    public router: Router,
    public http: HttpClient,
    public establishmentService: EstablishmentService,
    public permissionsService: PermissionsService,
    public authService: AuthService,
    public notificationsService: NotificationsService,
  ) {}

  public navigateToWorkplace(id, username, nmdsId): void {
    this.getNewEstablishmentId(id, username).subscribe(
      (data) => {
        this.authService.token = data.headers.get('authorization');
        this.permissionsService.hasWorkplacePermissions(data.body.establishment.uid).subscribe(() => {
          this.onSwapSuccess(data);
        });
      },
      (error) => this.onError(error),
    );
  }

  public getAllNotificationWorkplace(nmdsId, params) {
    return this.http.get<any>(`/api/user/swap/establishment/notification/${nmdsId}`, params);
  }

  public getNewEstablishmentId(id, username) {
    const data = {
      username: username,
    };
    return this.http.post<any>('/api/user/swap/establishment/' + id, data, { observe: 'response' });
  }

  private onSwapSuccess(data) {
    if (data.body && data.body.establishment && data.body.establishment.uid) {
      this.authService.isOnAdminScreen = false;
      this.authService.setPreviousToken();
      this.authService.token = data.headers.get('authorization');
      const workplaceUid = data.body.establishment.uid;
      this.establishmentService
        .getEstablishment(workplaceUid)
        .pipe(take(1))
        .subscribe(
          (workplace) => {
            this.notificationsService.getAllNotifications(workplaceUid).subscribe((notify) => {
              this.notificationsService.notifications$.next(
                this.notificationData ? this.notificationData : notify.notifications,
              );
              this.establishmentService.setState(workplace);
              this.establishmentService.setPrimaryWorkplace(workplace);
              this.establishmentService.establishmentId = workplace.uid;
              this.establishmentService.standAloneAccount = !(workplace.isParent || workplace.parentUid);
              this.router.navigate(['/dashboard']);
            });
          },
          (error) => this.onError(error),
        );
    }
  }

  private onError(error) {}
}
