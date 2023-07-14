import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-data-area-about-the-data',
  templateUrl: './about-the-data.component.html',
})
export class DataAreaAboutTheDataComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @ViewChild('aboutData') public aboutData: ElementRef;

  protected subscriptions: Subscription = new Subscription();
  public meta: Meta;
  public returnTo: URLStructure;
  public url: any[];
  public fragment: string;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected benchmarksService: BenchmarksService,
    private permissionsService: PermissionsService,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.url = this.benchmarksService.returnTo?.url;
    this.fragment = this.benchmarksService.returnTo?.fragment;
    const workplaceUid = this.workplace ? this.workplace.uid : this.route.snapshot.params.establishmentuid;

    const canViewBenchmarks = this.permissionsService.can(workplaceUid, 'canViewBenchmarks');

    if (canViewBenchmarks) {
      this.subscriptions.add(
        this.benchmarksService.getTileData(workplaceUid, []).subscribe((data) => {
          if (data) {
            this.meta = data.meta;
          }
        }),
      );
    }

    this.breadcrumbService.show(JourneyType.BENCHMARKS_TAB);
  }

  public pluralizeWorkplaces(workplaces) {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
