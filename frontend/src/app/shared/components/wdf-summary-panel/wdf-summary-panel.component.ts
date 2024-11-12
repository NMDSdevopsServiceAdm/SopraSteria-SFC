import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-wdf-summary-panel',
  templateUrl: './wdf-summary-panel.component.html',
  styleUrls: ['../summary-section/summary-section.component.scss', './wdf-summary-panel.component.scss'],
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
        showLink: true,
      },
      {
        title: 'Staff records',
        eligibility: this.staffWdfEligibilityStatus || (!this.staffWdfEligibilityStatus && this.overallWdfEligibility),
        fragment: 'staff',
        showLink: true,
      },
    ];

    if (this.isParent) {
      this.sections.push({
        title: 'Your other workplaces',
        eligibility: this.parentOverallWdfEligibility,
        fragment: 'workplaces',
        showLink: true,
      });
    }
  }

  public onClick(event: Event, fragment: string): void {
    event.preventDefault();
    this.showLink(fragment);
    this.router.navigate(['/wdf/data'], { fragment: fragment });
  }

  public showLink(fragment: string): void {
    for (var i = 0; i < this.sections.length; i++) {
      if (fragment === this.sections[i].fragment) {
        this.sections[i].showLink = false;
      } else {
        this.sections[i].showLink = true;
      }
    }
  }
}
