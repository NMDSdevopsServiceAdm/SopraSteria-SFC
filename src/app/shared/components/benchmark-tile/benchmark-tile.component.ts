import { Component, Input } from '@angular/core';
import { Metric, MetricsContent, Tile } from '@core/model/benchmarks.model';
import { BenchmarksUtil } from '@core/utils/benchmarks-util';

@Component({
  selector: 'app-benchmark-tile',
  templateUrl: './benchmark-tile.component.html',
  styleUrls: ['./benchmark-tile.component.scss'],
})
export class BenchmarkTileComponent {
  @Input() public content: MetricsContent;
  @Input() public tile: Tile;

  public metrics = Metric;

  get title() {
    return this.content?.title;
  }

  get description() {
    return this.content?.description;
  }

  get workplaceHasValue(): boolean {
    return BenchmarksUtil.hasValue(this.tile, (tile) => tile.workplaceValue);
  }

  get workplaceValue(): number {
    return BenchmarksUtil.value(this.tile, (tile) => tile.workplaceValue);
  }

  get comparisonGroupHasValue(): boolean {
    return BenchmarksUtil.hasValue(this.tile, (tile) => tile.comparisonGroup);
  }

  get comparisonGroupValue(): number {
    return BenchmarksUtil.value(this.tile, (tile) => tile.comparisonGroup);
  }

  get noDataMessage() {
    return this.content.noData[this.tile?.workplaceValue?.stateMessage];
  }
}
