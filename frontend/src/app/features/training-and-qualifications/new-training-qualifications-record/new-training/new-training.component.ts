import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingRecordCategory } from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent {
  @Input() public trainingCategories: TrainingRecordCategory[];
  @Input() public isMandatoryTraining = false;
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  @Input() public canEditWorker: boolean;
  @ViewChild('content') public content: ElementRef;
  public workplaceUid: string;

  constructor(protected trainingStatusService: TrainingStatusService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;

    for (let i = 0; i < this.trainingCategories.length; i++) {
      this.trainingCategories[i].trainingRecords = this.trainingCategories[i].trainingRecords.filter(x => x.trainingStatus !== this.trainingStatusService.MISSING);
      if (this.trainingCategories[i].trainingRecords.length === 0) {
        this.trainingCategories.splice(i, 1);
      }
    }
  }
}
