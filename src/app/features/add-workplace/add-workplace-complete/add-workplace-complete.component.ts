import { Component, OnInit } from '@angular/core';
import { AddWorkplaceFlow } from '@core/model/workplace.model';
import { WorkplaceService } from '@core/services/workplace.service';

@Component({
  selector: 'app-add-workplace-complete',
  templateUrl: './add-workplace-complete.component.html',
})
export class AddWorkplaceCompleteComponent implements OnInit {
  public addWorkplaceFlow: string;
  public cqcWithUser: string = AddWorkplaceFlow.CQC_WITH_USER;
  public CQCNoUser: string = AddWorkplaceFlow.CQC_NO_USER;
  public nonCQC: string = AddWorkplaceFlow.NON_CQC;

  constructor(private workplaceService: WorkplaceService) {}

  ngOnInit(): void {
    this.addWorkplaceFlow = this.workplaceService.addWorkplaceFlow$.value;
    this.workplaceService.addWorkplaceInProgress$.next(false);
  }
}
