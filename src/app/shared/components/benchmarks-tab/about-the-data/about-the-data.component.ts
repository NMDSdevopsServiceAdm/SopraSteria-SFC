import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Meta } from '@core/model/benchmarks.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-benchmarks-about-the-data',
  templateUrl: './about-the-data.component.html'
})
export class BenchmarksAboutTheDataComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() meta: Meta;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,) {}

  ngOnInit() {}

  public formatNumber(data) {
    return  data.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }
  public getRoutePath(name: string) {
    return ['/benchmarks'];
  }
  ngOnDestroy() {
  }
}
