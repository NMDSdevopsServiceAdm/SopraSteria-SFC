import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-wdf-field-confirmation',
  templateUrl: './wdf-field-confirmation.component.html',
})
export class WdfFieldConfirmationComponent {
  @Input() changeLink: any[];
  @Input() data: string;
}
