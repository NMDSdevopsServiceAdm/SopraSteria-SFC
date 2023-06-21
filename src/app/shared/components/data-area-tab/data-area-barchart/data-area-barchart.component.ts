import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-data-area-barchart',
  templateUrl: './data-area-barchart.component.html',
  styleUrls: ['./data-area-barchart.component.scss'],
})
export class DataAreaBarchartComponent{
  @Input() positionedTitle: string;
  @Input() payMoreThanWorkplacesNumber: number;
  @Input() workplacesNumber: number;

  public noPositionData: boolean;
  public noComparisonData: boolean;
}
