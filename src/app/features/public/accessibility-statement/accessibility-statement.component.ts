import { Component, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
  selector: 'app-accessibility-statement',
  templateUrl: './accessibility-statement.component.html',
})
export class AccessibilityStatementComponent implements OnInit {
  constructor(private breadcrumbSerivce: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbSerivce.show(JourneyType.PUBLIC);
  }
}
