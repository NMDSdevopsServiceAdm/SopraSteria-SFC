import { Component, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
})
export class StartComponent implements OnInit {
  constructor(public backLinkService: BackLinkService, private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.workplaceService.resetService();
    this.workplaceService.addWorkplaceInProgress$.next(true);
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
