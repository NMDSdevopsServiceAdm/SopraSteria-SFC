import { Component, OnInit } from '@angular/core';
import { AddWorkplaceFlow } from '@core/model/workplace.model';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-add-workplace-complete',
  templateUrl: './add-workplace-complete.component.html',
})
export class AddWorkplaceCompleteComponent implements OnInit {
  public addWorkplaceFlow: string;
  public CQCNoUser: string = AddWorkplaceFlow.CQC_NO_USER;
  public cqcWithUser: string = AddWorkplaceFlow.CQC_WITH_USER;
  public newWorkplaceUid: string;
  public nonCQC: string = AddWorkplaceFlow.NON_CQC;

  constructor(private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.newWorkplaceUid = this.workplaceService.newWorkplaceUid;
    this.addWorkplaceFlow = this.workplaceService.addWorkplaceFlow$.value;
    this.resetAddWorkplace();
  }

  private resetAddWorkplace(): void {
    this.workplaceService.addWorkplaceFlow$.next(null);
    this.workplaceService.addWorkplaceInProgress$.next(false);
    this.workplaceService.locationAddresses$.next(null);
    this.workplaceService.newWorkplaceUid = null;
    this.workplaceService.selectedLocationAddress$.next(null);
    this.workplaceService.selectedWorkplaceService$.next(null);
  }
}
