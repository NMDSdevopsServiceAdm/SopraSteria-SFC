import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Meta } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comparison-group-header',
  templateUrl: './comparison-group-header.component.html'
})
export class ComparisonGroupHeaderComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();

  @Input() meta: Meta;
  @Input() workplaceID : string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksService,
  ) {}

  ngOnInit() {}
  public setReturn(){
    this.benchmarksService.setReturnTo({url:[this.router.url.split('#')[0]],fragment:'benchmarks'});
  }
  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }
  ngOnDestroy() {}
}
