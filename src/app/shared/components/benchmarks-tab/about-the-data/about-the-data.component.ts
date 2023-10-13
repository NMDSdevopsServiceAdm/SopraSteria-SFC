import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { IBenchmarksService } from '@core/services/Ibenchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-benchmarks-about-the-data',
  templateUrl: './about-the-data.component.html',
})
export class BenchmarksAboutTheDataComponent implements OnInit, OnDestroy {
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
    protected benchmarksService: IBenchmarksService,
    private permissionsService: PermissionsService,
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
  }

  public pluralizeWorkplaces(workplaces) {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
