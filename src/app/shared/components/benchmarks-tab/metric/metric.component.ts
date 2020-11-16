import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Metric, NoData, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-benchmarks-metric',
  templateUrl: './metric.component.html',
})
export class BenchmarksMetricComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  public type: Metric;
  public title: string;
  public description: string;
  public noData: NoData;
  public tile: Tile = null;
  public metaDataAvailable: boolean;
  public numberOfStaff: number;
  public numberOfWorkplaces: number;
  public lastUpdated: Date;

  constructor(
    private benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit() {
    const establishmentUid = this.establishmentService.establishment.uid;

    this.subscription.add(
      this.route.data
        .pipe(
          tap((data) => {
            this.breadcrumbService.show(data.journey);
            this.title = data.title;
            this.description = data.description;
            this.noData = data.noData;
          }),
          map((data) => (this.type = data.type as Metric)),
          mergeMap(() => this.benchmarksService.getTileData(establishmentUid, [Metric[this.type]])),
        )
        .subscribe((benchmarks) => {
          this.tile = benchmarks.tiles[Metric[this.type]];
          this.metaDataAvailable = Boolean(benchmarks.meta && this.tile.workplaces && this.tile.staff);
          if (this.metaDataAvailable) {
            this.numberOfWorkplaces = this.tile.workplaces;
            this.numberOfStaff = this.tile.staff;
            this.lastUpdated = benchmarks.meta.lastUpdated;
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
