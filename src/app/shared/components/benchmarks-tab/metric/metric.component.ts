import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Metric, NoData, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
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
  public loaded: boolean = false;
  public benchmarks: Tile = null;

  constructor(
    private benchmarksService: BenchmarksService,
    private establishmentService: EstablishmentService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    const establishmentUid = this.establishmentService.establishment.uid;

    this.subscription.add(
      this.route.data
        .pipe(
          tap((data) => {
            this.title = data.title;
            this.description = data.description;
            this.noData = data.noData;
          }),
          map((data) => (this.type = data.type as Metric)),
          mergeMap(() => this.benchmarksService.getTileData(establishmentUid, [Metric[this.type]])),
        )
        .subscribe((benchmarks) => {
          this.loaded = true;
          this.benchmarks = benchmarks.tiles[Metric[this.type]];
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
