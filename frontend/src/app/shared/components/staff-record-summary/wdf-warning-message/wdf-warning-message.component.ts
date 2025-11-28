import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-wdf-warning-message',
    templateUrl: './wdf-warning-message.component.html',
    styleUrls: ['./wdf-warning-message.component.scss'],
    standalone: false
})
export class WdfWarningMessageComponent {
  @Input() overallWdfEligibility: boolean;
  @Input() warningMessage: string;
}
