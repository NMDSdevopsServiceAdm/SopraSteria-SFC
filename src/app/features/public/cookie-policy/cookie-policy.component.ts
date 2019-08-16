import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.component.html',
})
export class CookiePolicyComponent implements OnInit {
  constructor(private breadcrumbSerivce: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbSerivce.show(JourneyType.PUBLIC);
  }
}
