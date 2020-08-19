import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { take } from 'rxjs/operators';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Router } from '@angular/router';

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
    public notificationsService: NotificationsService
  ) {}

  public navigateToWorkplace(id, username, nmdsId): void {
    if (!username && nmdsId) {
      this.getAllNotificationWorkplace(nmdsId).subscribe(data => {
        if (data) {
          this.notificationData = data;
        }
      });
    }
    this.getNewEstablishmentId(id, username).subscribe(
      data => {
        this.permissionsService.clearPermissions();
        this.onSwapSuccess(data);
      },
      error => this.onError(error)
    );
  }

  public getAllNotificationWorkplace(nmdsId) {
    return this.http.get<any>(`/api/user/swap/establishment/notification/${nmdsId}`);
  }

  public getNewEstablishmentId(id, username) {
    let data = {
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
          workplace => {
            this.notificationsService.getAllNotifications().subscribe(notify => {
              this.notificationsService.notifications$.next(this.notificationData ? this.notificationData : notify);
              this.establishmentService.setState(workplace);
              this.establishmentService.setPrimaryWorkplace(workplace);
              this.establishmentService.establishmentId = workplace.uid;
              this.router.navigate(['/dashboard']);
            });
          },
          error => this.onError(error)
        );
    }
  }

  private onError(error) {}
}
