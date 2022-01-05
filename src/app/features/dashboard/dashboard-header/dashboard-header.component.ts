import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import {
  DeleteWorkplaceDialogComponent,
} from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-header',
  templateUrl: './dashboard-header.component.html',
})
export class DashboardHeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canDeleteEstablishment: boolean;
  public lastLoggedIn: string;
  public workplace: Establishment;
  public workplaceUid: string;
  public subsidiaryCount: number;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private notificationsService: NotificationsService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.isOnAdminScreen = false;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;

    this.getPermissions();

    if (this.workplace) {
      this.setSubsidiaryCount();
    }

    this.getLastLoggedIn();
    this.setUserServiceReturnUrl();
    this.setUpNotificationSubscription();
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();

    if (!this.canDeleteEstablishment) {
      return;
    }

    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe((deleteConfirmed) => {
        if (deleteConfirmed) {
          this.deleteWorkplace();
        }
      });
  }

  private deleteWorkplace(): void {
    if (!this.canDeleteEstablishment) {
      return;
    }

    this.subscriptions.add(
      this.establishmentService.deleteWorkplace(this.workplace.uid).subscribe(
        () => {
          this.permissionsService.clearPermissions();
          this.authService.restorePreviousToken();

          if (this.authService.getPreviousToken().EstablishmentUID) {
            this.establishmentService
              .getEstablishment(this.authService.getPreviousToken().EstablishmentUID)
              .pipe(take(1))
              .subscribe((workplace) => {
                this.establishmentService.setState(workplace);
                this.establishmentService.setPrimaryWorkplace(workplace);
                this.establishmentService.establishmentId = workplace.uid;
                this.router.navigate(['/search-establishments']).then(() => {
                  this.alertService.addAlert({
                    type: 'success',
                    message: `${this.workplace.name} has been permanently deleted.`,
                  });
                });
              });
          } else {
            this.router.navigate(['/search-establishments']).then(() => {
              this.alertService.addAlert({
                type: 'success',
                message: `${this.workplace.name} has been permanently deleted.`,
              });
            });
          }
        },
        (e) => {
          console.error(e);
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        },
      ),
    );
  }

  private getPermissions(): void {
    this.canDeleteEstablishment = this.permissionsService.can(this.workplaceUid, 'canDeleteAllEstablishments');
  }

  private setSubsidiaryCount(): void {
    this.subscriptions.add(
      this.userService.getEstablishments().subscribe((res) => {
        this.subsidiaryCount = res.subsidaries ? res.subsidaries.count : 0;
      }),
    );
  }

  private setUpNotificationSubscription(): void {
    // get latest notification after every 30 seconds
    this.subscriptions.add(
      interval(30000).subscribe(() => {
        this.notificationsService.getAllNotifications().subscribe(
          (notifications) => {
            this.notificationsService.notifications$.next(notifications);
          },
          (error) => {
            console.error(error.error);
          },
        );
      }),
    );
  }

  private setUserServiceReturnUrl(): void {
    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'users',
    });
  }

  private getLastLoggedIn(): void {
    const lastLoggedIn = this.userService.loggedInUser.lastLoggedIn;
    this.lastLoggedIn = lastLoggedIn ? lastLoggedIn : null;
  }

  get numberOfNewNotifications(): number {
    const newNotifications = this.notificationsService.notifications.filter((notification) => !notification.isViewed);
    return newNotifications.length;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
