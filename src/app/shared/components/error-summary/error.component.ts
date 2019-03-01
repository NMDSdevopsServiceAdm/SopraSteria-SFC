import { Component } from '@angular/core';

@Component({
  selector: 'app-error-summary-error',
  template: `
    <ng-container>
      <ng-content></ng-content>
    </ng-container>
  `,
})
export class ErrorComponent {}
