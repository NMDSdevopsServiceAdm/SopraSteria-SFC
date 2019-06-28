import { Component, OnInit, Input } from '@angular/core';
import { URLStructure } from '@core/model/url.model';
import { Establishment } from '@core/model/establishment.model';

@Component({
  selector: 'app-workplace-sub-tab',
  templateUrl: './workplace-sub-tab.component.html',
})
export class WorkplaceSubTabComponent implements OnInit {
  public summaryReturnUrl: URLStructure;
  @Input() workplace: Establishment;

  constructor() {}

  ngOnInit() {
    this.summaryReturnUrl = {
      url: ['/workplace', this.workplace.uid],
      fragment: 'workplace',
    };
  }
}
