import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-reports-header',
  templateUrl: './reports-header.component.html',
})
export class ReportsHeaderComponent {
  @Input() title = 'Reports';
}
