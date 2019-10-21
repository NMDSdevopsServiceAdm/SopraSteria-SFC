import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { Notification } from '@core/model/notifications.model';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { Subscription } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { Router } from '@angular/router';
import { AlertService } from '@core/services/alert.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  public workplace: Establishment;
  public notification;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
    private router: Router,
    private alertService: AlertService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.NOTIFICATIONS);
    this.workplace = this.establishmentService.primaryWorkplace;
    const notificationUid = this.route.snapshot.params.notificationuid;
    this.notificationsService.getNotificationDetails(notificationUid).subscribe(details => {
      this.notification = details;
    });
  }

  public approveRequest() {
    if (this.notification) {
      let requestParameter = {
        ownerRequestChangeUid: this.notification.typeContent.ownerChangeRequestUID,
        approvalStatus: 'APPROVED',
        approvalReason: '',
      };
      this.subscriptions.add(
        this.notificationsService
          .approveOwnership(this.notification.typeContent.ownerChangeRequestUID, requestParameter)
          .subscribe(
            request => {
              if (request) {
                this.router.navigate(['/dashboard']);
                this.alertService.addAlert({
                  type: 'success',
                  message: `Your decision to transfer ownership of data has been sent to
                  ${this.notification.typeContent.subEstablishmentName} `,
                });
              }
            },
            error => {
              console.error(error.error.message);
            }
          )
      );
    }
  }

  public rejectRequest() {}
}
