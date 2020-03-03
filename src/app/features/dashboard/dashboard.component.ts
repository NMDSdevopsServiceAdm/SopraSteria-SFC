import { Component, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public canViewEstablishment: boolean;
  public canViewListOfUsers: boolean;
  public canViewListOfWorkers: boolean;
  public lastLoggedIn: string;
  public totalStaffRecords: number;
  public workplace: Establishment;
  public trainingAlert: number;


  constructor(
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService,
    private notificationsService: NotificationsService,
  ) { }

  ngOnInit() {
    this.workplace = this.establishmentService.primaryWorkplace;
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canViewListOfUsers = this.permissionsService.can(workplaceUid, 'canViewListOfUsers');
    this.canViewListOfWorkers = this.permissionsService.can(workplaceUid, 'canViewListOfWorkers');
    this.canViewEstablishment = this.permissionsService.can(workplaceUid, 'canViewEstablishment');

    if (this.workplace) {
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
    }

    const lastLoggedIn = this.userService.loggedInUser.lastLoggedIn;
    this.lastLoggedIn = lastLoggedIn ? lastLoggedIn : null;

    this.userService.updateReturnUrl({
      url: ['/dashboard'],
      fragment: 'user-accounts',
    });

    //get latest notification after every 30 seconds
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


 get numberOfNewNotifications() {
    const newNotifications = this.notificationsService.notifications.filter(notification => !notification.isViewed);
    return newNotifications.length;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
