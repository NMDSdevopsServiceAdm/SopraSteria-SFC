import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-cancelled',
  templateUrl: './notification-cancelled.component.html',
})
export class NotificationCancelledComponent implements OnInit {
  @Input() public notification;
  public cancelledMessage;
  constructor(private router: Router) {}

  ngOnInit() {
    if (this.notification.type === 'LINKTOPARENTREQUEST') {
      this.cancelledMessage = this.notification.typeContent.requestorName + ' cancelled their request to link to you.';
    } else {
      this.cancelledMessage =
        this.notification.typeContent.requestorName + ' cancelled the request to change ownership of the data.';
    }
  }

  public returnToHome() {
    this.router.navigate(['/dashboard']);
    return true;
  }
}
