import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Meta } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-comparison-group-header',
  templateUrl: './comparison-group-header.component.html'
})
export class ComparisonGroupHeaderComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() meta: Meta;
  @Input() workplaceID : string;

  constructor() {}

  ngOnInit() {}

  public formatNumber(data) {
    return  data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }
  ngOnDestroy() {
  }
}
