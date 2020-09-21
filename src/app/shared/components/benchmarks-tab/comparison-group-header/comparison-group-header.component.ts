import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comparison-group-header',
  templateUrl: './comparison-group-header.component.html'
})
export class ComparisonGroupHeaderComponent implements OnInit {
  protected subscriptions: Subscription = new Subscription();

  @Input() meta: Meta;
  @Input() workplaceID : string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksService,
  ) {
  }

  ngOnInit() {}
  public setReturn(){
    this.benchmarksService.setReturnTo({
      url: [this.router.url.split('#')[0]],
      fragment: 'benchmarks',
    });
  }
  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }
}
