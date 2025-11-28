import { Component } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';

@Component({
    selector: 'app-thank-you',
    templateUrl: './thank-you.component.html',
    standalone: false
})
export class ThankYouComponent {
  constructor(private breadcrumbService: BreadcrumbService) {}

  ngOnInit() {
    this.breadcrumbService.show(JourneyType.PUBLIC);
  }
}
