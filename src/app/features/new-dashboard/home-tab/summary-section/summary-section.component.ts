import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-summary-section',
  templateUrl: './summary-section.component.html',
  styleUrls: ['./summary-section.component.scss'],
})
export class SummarySectionComponent {
  @Input() message: string;

  public sections = [
    { linkText: 'Workplace', fragment: 'workplace' },
    { linkText: 'Staff records', fragment: 'staff-records' },
    { linkText: 'Training and qualifications', fragment: 'training-and-qualifications' },
  ];
}
