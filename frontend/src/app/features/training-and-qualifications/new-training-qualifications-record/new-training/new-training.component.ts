import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CertificateUpload, TrainingRecord, TrainingRecordCategory } from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.scss'],
})
export class NewTrainingComponent implements OnChanges {
  @Input() public trainingCategories: TrainingRecordCategory[];
  @Input() public isMandatoryTraining = false;
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  @Input() public canEditWorker: boolean;
  @Input() public certificateErrors: Record<string, string> = {};
  @Output() public downloadFile = new EventEmitter<TrainingRecord>();
  @Output() public uploadFile = new EventEmitter<CertificateUpload>();

  public trainingCategoryToDisplay: (TrainingRecordCategory & { error?: string })[];

  @ViewChild('content') public content: ElementRef;
  public workplaceUid: string;

  constructor(protected trainingStatusService: TrainingStatusService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.addErrorsToTrainingCategories();
  }

  ngOnChanges(): void {
    this.addErrorsToTrainingCategories();
  }

  handleDownloadCertificate(event: Event, trainingRecord: TrainingRecord) {
    event.preventDefault();
    this.downloadFile.emit(trainingRecord);
  }

  handleUploadCertificate(files: File[], trainingRecord: TrainingRecord) {
    this.uploadFile.emit({ files, trainingRecord });
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
