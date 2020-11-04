import { Component, Input } from '@angular/core';
import { Metric, MetricsContent, Tile } from '@core/model/benchmarks.model';

@Component({
  selector: 'app-benchmark-tile',
  templateUrl: './benchmark-tile.component.html',
  styleUrls: ['./benchmark-tile.component.scss'],
})
export class BenchmarkTileComponent {
  @Input() public content: MetricsContent;
  @Input() public tile: Tile;

  public metrics = Metric;
  constructor() {}
}
