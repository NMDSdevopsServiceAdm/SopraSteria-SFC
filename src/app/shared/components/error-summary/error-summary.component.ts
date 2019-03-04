import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-summary',
  templateUrl: './error-summary.component.html',
  styleUrls: ['./error-summary.component.scss'],
})
export class ErrorSummaryComponent {
  @Input() errors;

  constructor() {}
}
