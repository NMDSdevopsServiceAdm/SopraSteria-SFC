import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-registration-submit-buttons',
  templateUrl: './registration-submit-buttons.component.html',
})
export class RegistrationSubmitButtonsComponent {
  @Input() insideFlow: boolean;
  @Input() returnRoute: string;
}
