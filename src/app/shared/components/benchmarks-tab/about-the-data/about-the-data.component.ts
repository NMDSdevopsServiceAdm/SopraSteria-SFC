import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { Meta } from '@core/model/benchmarks.model';
import { BackService } from '@core/services/back.service';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-benchmarks-about-the-data',
  templateUrl: './about-the-data.component.html'
})
export class BenchmarksAboutTheDataComponent implements OnInit, OnDestroy {
  protected subscriptions: Subscription = new Subscription();
  public meta: Meta;
  public returnTo: URLStructure;
  public url: any[];
  public fragment: string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksService,
    protected backService: BackService
  ) {}

  ngOnInit() {
    this.url = this.benchmarksService.returnTo?.url;
    this.fragment = this.benchmarksService.returnTo?.fragment;
    this.subscriptions.add(
      this.benchmarksService.getMeta(this.route.snapshot.params.establishmentID).subscribe(
        (data) => {
          if (data) {
            this.meta = data.meta;
          }
        }
      ));
    this.backService.setBackLink(this.benchmarksService.returnTo);
  }

  public pluralizeWorkplaces(workplaces){
    return workplaces > 1 ? 'workplaces' : 'workplace'
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}
