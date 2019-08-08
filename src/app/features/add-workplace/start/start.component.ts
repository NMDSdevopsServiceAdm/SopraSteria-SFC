import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  constructor(private backService: BackService, private workplaceService: WorkplaceService) {}

  ngOnInit() {
    this.workplaceService.addWorkplaceInProgress$.next(true);
    this.setBackLink();
  }

  private setBackLink(): void {
    this.backService.setBackLink({ url: ['/workplace/view-my-workplaces'] });
  }
}
