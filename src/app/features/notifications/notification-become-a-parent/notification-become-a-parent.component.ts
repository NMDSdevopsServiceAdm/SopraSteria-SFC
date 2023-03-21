import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { NotificationsService } from '@core/services/notifications/notifications.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification-become-a-parent',
  templateUrl: './notification-become-a-parent.component.html',
  providers: [Overlay],
})
export class NotificationBecomeAParentComponent {
  @Input() public notification;
}
