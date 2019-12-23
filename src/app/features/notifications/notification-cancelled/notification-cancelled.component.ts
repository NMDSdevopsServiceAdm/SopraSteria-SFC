import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
  selector: 'app-notification-cancelled',
  templateUrl: './notification-cancelled.component.html',
})
export class NotificationCancelledComponent implements OnInit {
  public cancelledMessage;
  constructor(
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    const notificationUid = this.route.snapshot.params.notificationuid;
    this.notificationsService.getNotificationDetails(notificationUid).subscribe(details => {
      if (details.type === 'LINKTOPARENTREQUEST') {
        this.cancelledMessage = details.typeContent.requestorName + ' cancelled their request to link to you.';
      } else {
        this.cancelledMessage =
          details.typeContent.requestorName + ' cancelled the request to change ownership of the data.';
      }
    });
  }

  public returnToHome() {
    this.router.navigate(['/dashboard']);
    return true;
  }
}
