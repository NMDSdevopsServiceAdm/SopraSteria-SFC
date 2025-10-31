import { Overlay } from '@angular/cdk/overlay';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-notification-become-a-parent',
    templateUrl: './notification-become-a-parent.component.html',
    providers: [Overlay],
    standalone: false
})
export class NotificationBecomeAParentComponent {
  @Input() public notification;
}
