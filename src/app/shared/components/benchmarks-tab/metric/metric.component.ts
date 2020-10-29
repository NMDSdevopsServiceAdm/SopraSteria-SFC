import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { mergeMap, map, tap } from 'rxjs/operators';

import { Metric, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benchmarks-metric',
  templateUrl: './metric.component.html',
})
export class BenchmarksMetricComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  public metric: Metric;
  public title: string;
  public description: string;
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
          }),
          map((data) => (this.metric = data.metric as Metric)),
          mergeMap(() => this.benchmarksService.getTileData(establishmentUid, [Metric[this.metric]])),
        )
        .subscribe((benchmarks) => {
          this.loaded = true;
          this.benchmarks = benchmarks.tiles[Metric[this.metric]];
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
