import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { EMPTY, forkJoin } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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

  public navigateToParentWorkplace(id: string, username: string, nmdsId: string): void {
    this.getNewEstablishmentId(id, username)
      .pipe(
        tap((data) => {
          this.authService.token = data.headers.get('authorization');
        }),
        switchMap((data) => {
          const workplaceUid = data.body.establishment.uid;

          // Combine permissions + workplace loading
          return forkJoin({
            permissions: this.permissionsService.hasWorkplacePermissions(workplaceUid).pipe(take(1)),
            workplace: this.establishmentService.getEstablishment(workplaceUid).pipe(take(1)),
          }).pipe(map(() => data)); // pass along the original data
        }),
        catchError((error) => {
          this.onError(error);
          return EMPTY;
        }),
      )
      .subscribe((data) => this.onSwapToParentSuccess(data));
  }

  public getAllNotificationWorkplace(nmdsId, params) {
    return this.http.get<any>(
      `${environment.appRunnerEndpoint}/api/user/swap/establishment/notification/${nmdsId}`,
      params,
    );
  }

  public getNewEstablishmentId(id, username) {
    const data = {
      username: username,
    };
    return this.http.post<any>(`${environment.appRunnerEndpoint}/api/user/swap/establishment/` + id, data, {
      observe: 'response',
    });
  }

  private onSwapSuccess(data: any): void {
    this.handleSwapSuccess(data, (url) => this.router.navigate([url]));
  }

  private onSwapToParentSuccess(data: any): void {
    this.handleSwapSuccess(data, (url) => this.forceReloadAndNavigate(url));
  }

  private handleSwapSuccess(data: any, navigateFn: (url: string) => void): void {
    if (!data?.body?.establishment?.uid) return;

    const workplaceUid = data.body.establishment.uid;

    this.authService.isOnAdminScreen = false;
    this.authService.setPreviousToken();
    this.authService.token = data.headers.get('authorization');

    this.establishmentService
      .getEstablishment(workplaceUid)
      .pipe(take(1))
      .subscribe(
        (workplace) => {
          this.notificationsService.getAllNotifications(workplaceUid).subscribe((notify) => {
            this.notificationsService.notifications = this.notificationData
              ? this.notificationData
              : notify.notifications;

            this.establishmentService.setState(workplace);
            this.establishmentService.setPrimaryWorkplace(workplace);
            this.establishmentService.establishmentId = workplace.uid;
            this.establishmentService.standAloneAccount = !(workplace.isParent || workplace.parentUid);

            //call the passed-in navigation function
            navigateFn('/dashboard');
          });
        },
        (error) => this.onError(error),
      );
  }

  private forceReloadAndNavigate(url: string): void {
    const reuse = this.router.routeReuseStrategy.shouldReuseRoute;

    // Disable reuse ONCE
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([url]).finally(() => {
        // Restore reuse immediately
        this.router.routeReuseStrategy.shouldReuseRoute = reuse;
      });
    });
  }

  private onError(error) {}
}
