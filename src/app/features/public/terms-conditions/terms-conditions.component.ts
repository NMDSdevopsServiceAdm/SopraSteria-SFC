import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
})
export class TermsConditionsComponent implements OnInit {
  constructor(private breadcrumbSerivce: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbSerivce.show(JourneyType.PUBLIC);
  }
}
