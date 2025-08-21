import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-eligibility-icon',
  templateUrl: './eligibility-icon.component.html',
})
export class EligibilityIconComponent implements OnInit {
  @Input() overallEligibility = false;
  @Input() eligible: boolean;
  @Input() check: boolean;
  @Input() num: number = null;

  public icon = '';
  public label = '';

  ngOnInit(): void {
    this.displayCorrectIcon();
  }

  public displayCorrectIcon(): void {
    // TODO: this code potentially create a faulty img tag that refer to non-exist "/assets/images/.svg"
    // we should properly handle the case when this.eligible being true

    if (!this.eligible && this.overallEligibility) {
      this.icon = 'flag-orange';
      this.label = 'You need to add this information';
    } else if (!this.eligible && !this.overallEligibility) {
      this.icon = 'cross-icon';
      this.label = 'You need to add this information';
    }
  }
}
