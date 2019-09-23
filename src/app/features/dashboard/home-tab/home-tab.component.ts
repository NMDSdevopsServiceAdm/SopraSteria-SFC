import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Roles } from '@core/model/roles.enum';
import { UserDetails } from '@core/model/userDetails.model';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BulkUploadService } from '@core/services/bulk-upload.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-home-tab',
  templateUrl: './home-tab.component.html',
})
export class HomeTabComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;

  private subscriptions: Subscription = new Subscription();
  public adminRole: Roles = Roles.Admin;
  public canBulkUpload: boolean;
  public canEditEstablishment: boolean;
  public canViewWorkplaces: boolean;
  public canViewReports: boolean;
  public isParent: boolean;
  public updateStaffRecords: boolean;
  public user: UserDetails;

  constructor(
    private bulkUploadService: BulkUploadService,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private workerService: WorkerService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.user = this.userService.loggedInUser;
    const workplaceUid: string = this.workplace ? this.workplace.uid : null;
    this.canEditEstablishment = this.permissionsService.can(workplaceUid, 'canEditEstablishment');
    this.canBulkUpload = this.permissionsService.can(workplaceUid, 'canBulkUpload');
    this.canViewWorkplaces = this.workplace && this.workplace.isParent;
    this.canViewReports =
      this.permissionsService.can(workplaceUid, 'canViewWdfReport') ||
      this.permissionsService.can(workplaceUid, 'canRunLocalAuthorityReport');

    if (this.workplace && this.canEditEstablishment) {
      this.subscriptions.add(
        this.workerService.workers$.pipe(filter(workers => workers !== null)).subscribe(workers => {
          this.updateStaffRecords = !(workers.length > 0);
        })
      );
    }
  }

  public setReturn(): void {
    this.bulkUploadService.setReturnTo({ url: ['/dashboard'] });
  }

  get numberOfNewNotifications() {
    const newNotifications = this.notificationsService.notifications.filter(notification => !notification.isViewed);
    return newNotifications.length;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
