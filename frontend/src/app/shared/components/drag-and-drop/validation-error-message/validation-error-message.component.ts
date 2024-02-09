import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-validation-error-message',
  templateUrl: './validation-error-message.component.html',
  providers: [],
})
export class ValidationErrorMessageComponent {
  @Input() errorMessage: string;
}
