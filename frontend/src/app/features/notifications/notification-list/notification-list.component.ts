import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
    selector: 'app-notification-list',
    templateUrl: './notification-list.component.html',
    standalone: false
})
export class NotificationListComponent implements OnInit {
  public workplace: Establishment;
  public notificationsForDeletion: Array<any> = [];
  public notifications = [];
  public ownerChangeRequestUID;
  public form;
  public allBoxesChecked = false;
  public sortOptions = ['Latest', 'Unread', 'Read'];
  public selectedPageIndex = 0;
  public totalCount;
  public itemsPerPage = 20;

  private selectedSort;
  constructor(
    protected formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private notificationService: NotificationsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  public ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    this.getNotifications();
  }

  public getNotifications(): void {
    this.notificationService
      .getAllNotifications(
        this.establishmentService.establishmentId,
        this.itemsPerPage,
        this.selectedSort,
        this.selectedPageIndex,
      )
      .subscribe((notification) => {
        this.notifications = notification.notifications;
        this.totalCount = notification.count;
      });
  }

  public onSortChange($event): void {
    this.selectedSort = $event.target.value;
    this.getNotifications();
  }

  public handlePageUpdate(pageIndex: number): void {
    this.selectedPageIndex = pageIndex;

    this.getNotifications();
  }

  public pushNotificationToDeleteArray(notification): void {
    const index = this.notificationsForDeletion.indexOf(notification.notificationUid);
    if (index > -1) {
      this.notificationsForDeletion.splice(index, 1);
    } else {
      this.notificationsForDeletion.push(notification.notificationUid);
    }
  }

  public pushAllNotificationsToDeleteArray(): void {
    if (!this.allBoxesChecked) {
      this.notificationsForDeletion = [];
      this.notifications.forEach((notification) => {
        this.notificationsForDeletion.push(notification.notificationUid);
      });
    } else {
      this.notificationsForDeletion = [];
    }
  }

  public deleteSelectedNotifications(): void {
    this.notificationService.deleteNotifications(this.notificationsForDeletion).subscribe(() => {
      this.getNotifications();
      this.notificationsForDeletion = [];
    });
  }
}
