import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-area-about-the-data',
  templateUrl: './about-the-data.component.html',
})
export class DataAreaAboutTheDataComponent implements OnInit, OnDestroy {
  public workplace: Establishment;

  protected subscriptions: Subscription = new Subscription();
  public meta: Meta;
  public returnTo: URLStructure;
  public url: any[];
  public fragment: string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksServiceBase,
    private breadcrumbService: BreadcrumbService,
    private establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.workplace = this.establishmentService.establishment;
    this.url = this.benchmarksService.returnTo?.url;
    this.fragment = this.benchmarksService.returnTo?.fragment;

    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
  }

  public returnToHome(): void {
    this.router.navigate(['/dashboard'], { fragment: 'benchmarks' });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
