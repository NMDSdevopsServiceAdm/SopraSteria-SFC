import { Component, Directive, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Directive({
  selector: 'your-workplace'
})
export class YourWorkplaceDirective {}
@Directive({
  selector: 'comparison-group'
})
export class ComparisonGroupDirective {}

@Component({
  selector: 'app-benchmark-tile',
  templateUrl: './benchmark-tile.component.html',
  styleUrls: ['./benchmark-tile.component.scss'],
})
export class BenchmarkTileComponent implements OnInit, OnDestroy {
  @Input() public title: string;
  @Input() public description: string;
  @Input() public showYourWorkplace: boolean;
  @Input() public showComparisonGroup: boolean;

  @ViewChild('yourWorkplaceTitle') public yourWorkplaceTitle: ElementRef;
  @ViewChild('comparisonGroupTitle') public comparisonGroupTitle: ElementRef;
  constructor(
  ) {
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}
