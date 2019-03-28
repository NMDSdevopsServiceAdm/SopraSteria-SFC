import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-workplace-summary',
  templateUrl: './workplace-summary.component.html',
})
export class WorkplaceSummaryComponent {
  @Input() workplace: any;
}
