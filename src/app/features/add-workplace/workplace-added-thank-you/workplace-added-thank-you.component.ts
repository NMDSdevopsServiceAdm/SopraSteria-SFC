import { Component, OnInit } from '@angular/core';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-workplace-added-thank-you',
  templateUrl: './workplace-added-thank-you.component.html',
})
export class WorkplaceAddedThankYouComponent implements OnInit {
  constructor(private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.workplaceService.addWorkplaceInProgress$.next(false);
  }
}
