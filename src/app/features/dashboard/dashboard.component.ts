import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { DeleteWorkplaceDialogComponent } from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canDeleteEstablishment: boolean;
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public lastLoggedIn: string;
  public totalStaffRecords: number;
  public workplace: Establishment;
  public trainingAlert: number;
  public subsidiaryCount: number;
  public canViewBenchmarks: boolean;
  public workplaceUid: string | null;
  public showSecondUserBanner: boolean;
  public canAddUser: boolean;
  public showCQCDetailsBanner = false;
  public workers: Worker[];
  public workerCount: number;
  public showSharingPermissionsBanner = true;

  constructor(
    private alertService: AlertService,
    private authService: AuthService,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService,
    private notificationsService: NotificationsService,
    private dialogService: DialogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.isOnAdminScreen = false;
    this.showCQCDetailsBanner = this.establishmentService.checkCQCDetailsBanner;
    this.workplace = this.establishmentService.primaryWorkplace;
    this.workplaceUid = this.workplace ? this.workplace.uid : null;

    if (this.workplace) {
      this.getPermissions();
      this.getCanViewBenchmarks();
      this.getTotalStaffRecords();

      if (this.workplace.locationId) {
        this.setCheckCQCDetailsBannerInEstablishmentService();
      }

      this.getShowCQCDetailsBanner();

      if (this.canViewListOfWorkers) {
        this.setWorkersAndTrainingAlert();
      }

      this.setSubsidiaryCount();
      this.setShowSecondUserBanner();
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
    this.canViewBenchmarks = this.permissionsService.can(this.workplaceUid, 'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(this.workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(this.workplaceUid, 'canViewEstablishment');
    this.canDeleteEstablishment = this.permissionsService.can(this.workplaceUid, 'canDeleteAllEstablishments');
    this.canAddUser = this.permissionsService.can(this.workplaceUid, 'canAddUser');
  }

  private getCanViewBenchmarks(): void {
    this.subscriptions.add(
      this.permissionsService.getPermissions(this.workplaceUid).subscribe((permission) => {
        this.canViewBenchmarks = permission.permissions.canViewBenchmarks;
      }),
    );
  }

  private getTotalStaffRecords(): void {
    this.subscriptions.add(
      this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(
        (total) => {
          if (total) {
            this.totalStaffRecords = total;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setWorkersAndTrainingAlert(): void {
    this.subscriptions.add(
      this.workerService.getAllWorkers(this.workplace.uid).subscribe(
        (workers) => {
          this.workers = workers;
          this.workerCount = workers.length;
          this.workerService.setWorkers(workers);
          if (workers.length > 0) {
            this.trainingAlert = workers[0].trainingAlert;
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setShowSecondUserBanner(): void {
    this.subscriptions.add(
      this.userService.getAllUsersForEstablishment(this.workplaceUid).subscribe((users) => {
        this.showSecondUserBanner = this.canAddUser && users.length === 1;
      }),
    );
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

  private setCheckCQCDetailsBannerInEstablishmentService(): void {
    this.subscriptions.add(
      this.establishmentService
        .getCQCRegistrationStatus(this.workplace.locationId, {
          postcode: this.workplace.postcode,
          mainService: this.workplace.mainService.name,
        })
        .subscribe((response) => {
          this.establishmentService.setCheckCQCDetailsBanner(response.cqcStatusMatch === false);
        }),
    );
  }

  private getShowCQCDetailsBanner(): void {
    this.subscriptions.add(
      this.establishmentService.checkCQCDetailsBanner$.subscribe((showBanner) => {
        this.showCQCDetailsBanner = showBanner;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
