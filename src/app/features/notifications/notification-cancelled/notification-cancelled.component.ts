import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';

@Component({
  selector: 'app-notification-cancelled',
  templateUrl: './notification-cancelled.component.html',
})
export class NotificationCancelledComponent implements OnInit {
  public requestFrom;
  constructor(
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    const notificationUid = this.route.snapshot.params.notificationuid;
    this.notificationsService.getNotificationDetails(notificationUid).subscribe(details => {
      this.requestFrom = details.typeContent.requestorName || '';
    });
  }

  public returnToHome() {
    this.router.navigate(['/dashboard']);
    return true;
  }
}
