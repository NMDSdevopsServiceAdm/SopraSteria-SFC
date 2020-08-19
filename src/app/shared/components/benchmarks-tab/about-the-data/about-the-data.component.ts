import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Meta } from '@core/model/benchmarks.model';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-benchmarks-about-the-data',
  templateUrl: './about-the-data.component.html'
})
export class BenchmarksAboutTheDataComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public meta: Meta;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksService,
    protected backService: BackService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.benchmarksService.getMeta(this.route.snapshot.params.establishmentID).subscribe(
        (data) => {
          if (data) {
            this.meta = data.meta;
          }
        }
      ));
    this.backService.setBackLink({
      url: ['dashboard'],
      fragment: 'benchmarks',
    });
  }

  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }

  ngOnDestroy() {
  }
}
