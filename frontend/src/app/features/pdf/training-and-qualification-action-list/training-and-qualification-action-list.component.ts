import { Component, ElementRef, ViewChild } from '@angular/core';

import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
    selector: 'app-pdf-training-and-qualification-action-list',
    templateUrl: './training-and-qualification-action-list.component.html',
    standalone: false
})
export class PdfTraininAndQualificationActionList {
  @ViewChild('content') public content: ElementRef;
  public actionsListData;

  constructor(private trainingStatusService: TrainingStatusService) {}
}
