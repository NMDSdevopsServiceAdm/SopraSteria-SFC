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
    this.newWorkplaceUid = this.workplaceService.newWorkplaceUid$.value;
    this.addWorkplaceFlow = this.workplaceService.addWorkplaceFlow$.value;
    this.workplaceService.addWorkplaceInProgress$.next(false);
  }
}
