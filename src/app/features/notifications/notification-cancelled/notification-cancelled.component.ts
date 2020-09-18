import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-cancelled',
  templateUrl: './notification-cancelled.component.html',
})
export class NotificationCancelledComponent implements OnInit, OnDestroy {
  public cancelledMessage;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
    private router: Router,
  ) {}

  ngOnInit() {
    const notificationUid = this.route.snapshot.params.notificationuid;
    this.subscriptions.add(
      this.notificationsService.getNotificationDetails(notificationUid).subscribe((details) => {
        if (details.type === 'LINKTOPARENTREQUEST') {
          this.cancelledMessage = details.typeContent.requestorName + ' cancelled their request to link to you.';
        } else {
          this.cancelledMessage =
            details.typeContent.requestorName + ' cancelled the request to change ownership of the data.';
        }
      }),
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public returnToHome() {
    this.router.navigate(['/dashboard']);
    return true;
  }
}
