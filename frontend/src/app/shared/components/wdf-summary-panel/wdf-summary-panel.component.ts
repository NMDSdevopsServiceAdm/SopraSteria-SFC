import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-wdf-summary-panel',
  templateUrl: './wdf-summary-panel.component.html',
  styleUrls: ['./wdf-summary-panel.component.scss'],
})
export class WdfSummaryPanel implements OnInit, OnChanges {
  @Input() workplaceWdfEligibilityStatus: boolean;
  @Input() staffWdfEligibilityStatus: boolean;
  @Input() wdfStartDate: string;
  @Input() wdfEndDate: string;
  @Input() isParent: boolean;
  @Input() parentOverallWdfEligibility: boolean;
  @Input() overallWdfEligibility: boolean;

  public sections: any = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.getSections();
  }

  ngOnChanges(): void {
    this.getSections();
  }

  public getSections(): void {
    this.sections = [
      {
        title: 'Workplace',
        eligibility:
          this.workplaceWdfEligibilityStatus || (!this.workplaceWdfEligibilityStatus && this.overallWdfEligibility),
        fragment: 'workplace',
      },
      {
        title: 'Staff records',
        eligibility: this.staffWdfEligibilityStatus || (!this.staffWdfEligibilityStatus && this.overallWdfEligibility),
        fragment: 'staff',
      },
    ];

    if (this.isParent) {
      this.sections.push({
        title: 'Your other workplaces',
        eligibility: this.parentOverallWdfEligibility,
        fragment: 'workplaces',
      });
    }
  }

  public onClick(event: Event, fragment: string): void {
    event.preventDefault();

    this.router.navigate(['/wdf/data'], { fragment: fragment });
  }
}
