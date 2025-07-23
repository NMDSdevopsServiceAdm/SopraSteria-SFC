import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  TrainingCertificateDownloadEvent,
  TrainingCertificateUploadEvent,
  TrainingRecord,
  TrainingRecordCategory,
} from '@core/model/training.model';
import { TrainingStatusService } from '@core/services/trainingStatus.service';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
})
export class NewTrainingComponent implements OnChanges, OnInit {
  @Input() public trainingCategories: TrainingRecordCategory[];
  @Input() public isMandatoryTraining = false;
  @Input() public trainingType: string;
  @Input() public setReturnRoute: () => void;
  @Input() public canEditWorker: boolean;
  @Input() public missingMandatoryTraining = false;
  @Input() public certificateErrors: Record<string, string> = {};
  @Input() public pdfRenderingMode = false;

  @Output() public downloadFile = new EventEmitter<TrainingCertificateDownloadEvent>();
  @Output() public uploadFile = new EventEmitter<TrainingCertificateUploadEvent>();

  @ViewChild('content') public content: ElementRef;

  public trainingCategoryToDisplay: (TrainingRecordCategory & { error?: string })[];
  public workplaceUid: string;

  constructor(protected trainingStatusService: TrainingStatusService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
    this.addErrorsToTrainingCategories();
  }

  ngOnChanges(): void {
    this.addErrorsToTrainingCategories();
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

  handleDownloadCertificate(event: Event, trainingRecord: TrainingRecord) {
    event.preventDefault();
    this.downloadFile.emit({
      recordType: 'training',
      recordUid: trainingRecord.uid,
      categoryName: trainingRecord.trainingCategory.category,
      filesToDownload: trainingRecord.trainingCertificates,
    });
  }

  handleUploadCertificate(files: File[], trainingRecord: TrainingRecord) {
    this.uploadFile.emit({
      recordType: 'training',
      recordUid: trainingRecord.uid,
      categoryName: trainingRecord.trainingCategory.category,
      files,
    });
  }
}
