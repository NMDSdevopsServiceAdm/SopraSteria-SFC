import { Component, Input, OnInit } from '@angular/core';
import { Meta } from '@core/model/benchmarks.model';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comparison-group-header',
  templateUrl: './comparison-group-header.component.html',
})
export class ComparisonGroupHeaderComponent {
  protected subscriptions: Subscription = new Subscription();

  @Input() meta: Meta;
  @Input() workplaceID: string;

  public pluralizeWorkplaces(workplaces) {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }
}
