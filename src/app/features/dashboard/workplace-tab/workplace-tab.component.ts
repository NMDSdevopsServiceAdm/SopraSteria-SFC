import { Component, Input, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';

@Component({
  selector: 'app-workplace-tab',
  templateUrl: './workplace-tab.component.html',
})
export class WorkplaceTabComponent implements OnInit {
  @Input() workplace: Establishment;

  public updateWorkplace: boolean;
  public summaryReturnUrl: URLStructure;

  constructor() {}

  ngOnInit() {
    this.summaryReturnUrl = { url: ['/dashboard'], fragment: 'workplace' };
    this.updateWorkplace = !this.workplace.employerType;
  }
}
