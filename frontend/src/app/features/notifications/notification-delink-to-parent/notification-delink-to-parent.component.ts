import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnInit } from '@angular/core';
import { DialogService } from '@core/services/dialog.service';

@Component({
  selector: 'app-notification-delink-to-parent',
  templateUrl: './notification-delink-to-parent.component.html',
  providers: [DialogService, Overlay],
})
export class NotificationDeLinkToParentComponent implements OnInit {
  @Input() public notification;
  public notificationUid: string;
  public notificationRequestedFrom: string;
  public notificationRequestedTo: string;
  public requestorName: string;

  ngOnInit() {
    this.notificationRequestedTo = this.notification.typeContent.parentEstablishmentName;
    this.notificationRequestedFrom = this.notification.typeContent.requestorName;
    this.requestorName = this.notification.typeContent.requestorName;
  }
}
