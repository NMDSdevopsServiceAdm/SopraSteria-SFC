import { Overlay } from '@angular/cdk/overlay';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification-become-a-parent',
  templateUrl: './notification-become-a-parent.component.html',
  providers: [Overlay],
})
export class NotificationBecomeAParentComponent {
  @Input() public notification;
}
