import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
})
export class NotificationListComponent implements OnInit {
  workplace: Establishment;
  // notifications: Notification[];
  public notifications: any;
  public ownerChangeRequestUID;
  public form;
  public allBoxesChecked = false;

  constructor(
    protected formBuilder: FormBuilder,
    private establishmentService: EstablishmentService,
    private notificationService: NotificationsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  public ngOnInit(): void {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    // this.notifications = orderBy(this.notificationService.notifications, (notification) => notification.created, [
    //   'desc',
    // ]);
    const mockNotifcations = [
      {
        created: '2020-01-01',
        type: 'BECOMEAPARENT',
        notificationUid: 'b88a2b8f-7ad4-4f53-a7f8-ee3f53432671',
        isViewed: true,
        createdByUserUID: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
      },
      {
        created: '2021-11-01',
        type: 'OWNERCHANGE',
        notificationUid: 'b88a2b8f-7ad4-4f53-a7f8-ee3f53432671',
        isViewed: false,
        createdByUserUID: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
      },
      {
        created: '2023-01-02',
        type: 'DELINKTOPARENT',
        notificationUid: 'b88a2b8f-7ad4-4f53-a7f8-ee3f53432671',
        isViewed: true,
        createdByUserUID: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
      },
      {
        created: '2019-03-01',
        type: 'LINKTOPARENTREQUEST',
        notificationUid: 'b88a2b8f-7ad4-4f53-a7f8-ee3f53432671',
        isViewed: false,
        createdByUserUID: '4b1a6e5e-c45e-49d6-8580-616fdbe9ae80',
      },
    ];
    this.notifications = mockNotifcations;
  }
}
