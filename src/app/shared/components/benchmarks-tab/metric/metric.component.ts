import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { Metric, Tile } from '@core/model/benchmarks.model';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { EstablishmentService } from '@core/services/establishment.service';

@Component({
  selector: 'app-benchmarks-metric',
  templateUrl: './metric.component.html',
})
export class BenchmarksMetricComponent implements OnInit, OnDestroy {
  public metric: Metric;
  private subscription: Subscription = new Subscription();

  loaded: boolean = false;
  benchmarks: Tile = null;

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
          map((data) => (this.metric = data['metric'] as Metric)),
          mergeMap(() => this.benchmarksService.getTileData(establishmentUid, [Metric[this.metric]])),
        )
        .subscribe((benchmarks) => {
          this.loaded = true;
          this.benchmarks = benchmarks.tiles.pay;
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
