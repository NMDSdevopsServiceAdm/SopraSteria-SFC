import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksServiceBase } from '@core/services/benchmarks-base.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-benchmarks-about-the-data',
  templateUrl: './about-the-data.component.html',
})
export class BenchmarksAboutTheDataComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() isParentViewingSubsidiary: boolean;
  @ViewChild('aboutData') public aboutData: ElementRef;

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
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit(): void {
    this.url = this.benchmarksService.returnTo?.url;
    this.fragment = this.benchmarksService.returnTo?.fragment;
    const workplaceUid = this.workplace ? this.workplace.uid : this.route.snapshot.params.establishmentuid;

    const canViewBenchmarks = this.permissionsService.can(workplaceUid, 'canViewBenchmarks');

    if (canViewBenchmarks) {
      this.meta = this.benchmarksService.benchmarksData.meta;
    }

    if (!this.isParentViewingSubsidiary) {
      this.breadcrumbService.show(JourneyType.OLD_BENCHMARKS_DATA_TAB);
    }
  }

  public pluralizeWorkplaces(workplaces) {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }

  public returnToBenchmarks(): void {
    this.router.navigate(['/dashboard'], { fragment: this.fragment });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
