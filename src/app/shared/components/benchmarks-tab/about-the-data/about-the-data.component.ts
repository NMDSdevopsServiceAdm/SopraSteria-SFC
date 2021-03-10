import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta } from '@core/model/benchmarks.model';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { BackService } from '@core/services/back.service';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { Subscription } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

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
    protected benchmarksService: BenchmarksService,
    protected backService: BackService,
    private permissionsService: PermissionsService,
  ) {}

  ngOnInit() {
    this.url = this.benchmarksService.returnTo?.url;
    this.fragment = this.benchmarksService.returnTo?.fragment;
    this.subscriptions.add(
      this.permissionsService
        .getPermissions(this.workplace.uid)
        .pipe(
          map((permission) => permission.permissions.canViewBenchmarks),
          filter((canViewBenchmarks) => canViewBenchmarks),
          switchMap(() => {
            return this.benchmarksService.getTileData(
              this.workplace && this.workplace.id ? this.workplace.id : this.route.snapshot.params.establishmentuid,
              [],
            );
          }),
        )
        .subscribe((data) => {
          if (data) {
            this.meta = data.meta;
          }
        }),
    );
    this.backService.setBackLink(this.benchmarksService.returnTo);
  }

  public pluralizeWorkplaces(workplaces) {
    return workplaces > 1 ? 'workplaces' : 'workplace';
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
