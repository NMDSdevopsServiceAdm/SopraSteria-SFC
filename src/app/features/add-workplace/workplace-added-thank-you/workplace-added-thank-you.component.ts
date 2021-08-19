import { Component } from '@angular/core';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-workplace-added-thank-you',
  templateUrl: './workplace-added-thank-you.component.html',
})
export class WorkplaceAddedThankYouComponent {
  constructor(public workplaceService: WorkplaceService) {
    this.workplaceService.addWorkplaceInProgress$.next(false);
    this.workplaceService.resetService();
  }
}
