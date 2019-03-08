import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fp-confirmation',
  templateUrl: './confirmation.component.html',
})
export class ForgotYourPasswordConfirmationComponent {
  @Input() resetPasswordLink: string;
}
