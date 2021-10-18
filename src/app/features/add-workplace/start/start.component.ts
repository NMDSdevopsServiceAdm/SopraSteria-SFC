import { Component, OnInit } from '@angular/core';
import { BackService } from '@core/services/back.service';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  constructor(public backService: BackService, private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.workplaceService.resetService();
    this.workplaceService.addWorkplaceInProgress$.next(true);
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['/workplace', 'view-all-workplaces'] });
  }
}
