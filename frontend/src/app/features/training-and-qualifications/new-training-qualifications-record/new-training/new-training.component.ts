import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingRecord, TrainingRecordCategory } from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent implements OnChanges {
  @Input() public trainingCategories: TrainingRecordCategory[];
  @Input() public isMandatoryTraining = false;
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  @Input() public canEditWorker: boolean;
  @Input() public certificateErrors: Record<string, string> = {};
  @Output() public downloadFile = new EventEmitter<TrainingRecord>();

  public trainingCategoryToDisplay: (TrainingRecordCategory & { error?: string })[];

  @ViewChild('content') public content: ElementRef;
  public workplaceUid: string;

  constructor(protected trainingStatusService: TrainingStatusService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.addErrorsToTrainingCategories();
  }

  ngOnChanges() {
    this.addErrorsToTrainingCategories();
  }

  handleDownloadCertificate(event, trainingRecord: TrainingRecord) {
    event.preventDefault();
    this.downloadFile.emit(trainingRecord);
  }

  addErrorsToTrainingCategories() {
    this.trainingCategoryToDisplay = this.trainingCategories.map((trainingCategory) => {
      if (this.certificateErrors && trainingCategory.category in this.certificateErrors) {
        const errorMessage = this.certificateErrors[trainingCategory.category];
        return { ...trainingCategory, error: errorMessage };
      } else {
        return trainingCategory;
      }
    });
  }
}
