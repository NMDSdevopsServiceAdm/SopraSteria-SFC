import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-training-info-panel',
  templateUrl: './training-info-panel.component.html',
})
export class TainingInfoPanelComponent implements OnInit {
  @Input() workplace: Establishment;
  @Input() totalExpiredTraining = 0;
  @Input() totalExpiringTraining = 0;

  constructor() {}

  ngOnInit() {}
}
