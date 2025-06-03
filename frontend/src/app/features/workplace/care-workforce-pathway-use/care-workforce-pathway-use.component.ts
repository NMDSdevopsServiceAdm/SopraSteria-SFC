import { Component, OnDestroy, OnInit } from '@angular/core';
import { Question } from '../question/question.component';
import { WorkplaceFlowSections } from '@core/utils/progress-bar-util';

@Component({
  selector: 'app-care-workforce-pathway-use',
  templateUrl: './care-workforce-pathway-use.component.html',
})
export class CareWorkforcePathwayUseComponent extends Question implements OnInit, OnDestroy {
  public section = WorkplaceFlowSections.RECRUITMENT_AND_BENEFITS;
}
