import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { DialogService } from '@core/services/dialog.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import {
  DeleteWorkplaceDialogComponent,
} from '@features/workplace/delete-workplace-dialog/delete-workplace-dialog.component';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('workplaceTitle') public workplaceTitle: ElementRef;

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
    private benchmarksService: BenchmarksService
  ) { }

  ngOnInit() {
    this.authService.isOnAdminScreen = false;
    this.workplace = this.establishmentService.primaryWorkplace;
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canViewBenchmarks = this.permissionsService.can(workplaceUid,'canViewBenchmarks');
    this.canViewListOfUsers = this.permissionsService.can(workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(workplaceUid, 'canViewEstablishment');
    this.canDeleteEstablishment = this.permissionsService.can(workplaceUid, 'canDeleteAllEstablishments');

    if (this.workplace) {
      this.subscriptions.add(this.permissionsService.getPermissions(workplaceUid).subscribe(
        permission => {
          this.canViewBenchmarks = permission.permissions.canViewBenchmarks
        }
      ));
      this.subscriptions.add(
        this.workerService.getTotalStaffRecords(this.workplace.uid).subscribe(
          total => {
            if (total) {
              this.totalStaffRecords = total;
            }
          },
          error => {
            console.error(error.error);
          }
        )
      );
      this.subscriptions.add(
        this.workerService.getAllWorkers(this.workplace.uid).subscribe(
          workers => {
            this.workerService.setWorkers(workers);
            if (workers.length > 0) {
              this.trainingAlert = workers[0].trainingAlert;
            }
          },
          error => {
            console.error(error.error);
          }
        )
      );

      this.subscriptions.add(
        this.userService.getEstablishments().subscribe(res => {
          this.subsidiaryCount = res.subsidaries ? res.subsidaries.count : 0;
        })
      )
    }
    const lastLoggedIn = this.userService.loggedInUser.lastLoggedIn;
    this.lastLoggedIn = lastLoggedIn ? lastLoggedIn : null;

    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });

    // get latest notification after every 30 seconds
    this.subscriptions.add(
      interval(30000).subscribe(
        () => {
          this.notificationsService.getAllNotifications().subscribe(
            notifications => {
              this.notificationsService.notifications$.next(notifications);
            },
            error => {
              console.error(error.error);
            }
          );
        }
      )
    );
  }

  ngAfterViewInit() {
    this.benchmarksService.workplaceTitle = this.workplaceTitle;
  }

  public onDeleteWorkplace(event: Event): void {
    event.preventDefault();

    if (!this.canDeleteEstablishment) {
      return;
    }

    this.dialogService
      .open(DeleteWorkplaceDialogComponent, { workplaceName: this.workplace.name })
      .afterClosed.subscribe(deleteConfirmed => {
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

          if(this.authService.getPreviousToken().EstablishmentUID) {
            this.establishmentService
              .getEstablishment(this.authService.getPreviousToken().EstablishmentUID)
              .pipe(take(1))
              .subscribe(
                workplace => {
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
        e => {
          console.error(e)
          this.alertService.addAlert({
            type: 'warning',
            message: 'There was an error deleting the workplace.',
          });
        }
      )
    );
  }


 get numberOfNewNotifications() {
    const newNotifications = this.notificationsService.notifications.filter(notification => !notification.isViewed);
    return newNotifications.length;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
