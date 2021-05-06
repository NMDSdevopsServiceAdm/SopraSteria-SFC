import { Component, Input, OnInit } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

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

  constructor(private featureFlagsService: FeatureFlagsService) {}

  ngOnInit() {
    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.displayCorrectIcon(value);
    });
  }

  public displayCorrectIcon(newDesign): void {
    if (newDesign) {
      if (!this.eligible && this.overallEligibility) {
        this.icon = 'flag-orange';
        this.label = 'You need to add this information';
      } else if (!this.eligible && !this.overallEligibility) {
        this.icon = 'cross-icon';
        this.label = 'You need to add this information';
      }
    } else {
      this.icon = this.eligible ? 'tick-icon' : 'cross-icon';
      this.label = this.check
        ? 'Check and confirm'
        : this.eligible
        ? 'Meeting requirements'
        : 'Not meeting requirements';
    }
  }
}
