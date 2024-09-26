import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrainingRecord, TrainingRecordCategory } from '@core/model/training.model';
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
  @Output() public downloadFile = new EventEmitter<TrainingRecord>();

  @ViewChild('content') public content: ElementRef;
  public workplaceUid: string;

  constructor(protected trainingStatusService: TrainingStatusService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.workplaceUid = this.route.snapshot.params.establishmentuid;
  }

  handleDownloadCertificate(event, trainingRecord: TrainingRecord) {
    event.preventDefault();
    this.downloadFile.emit(trainingRecord);
  }
}
