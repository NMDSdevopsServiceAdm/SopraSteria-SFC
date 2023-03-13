import { Component, Input, OnInit } from '@angular/core';
import { JourneyType } from '@core/breadcrumb/breadcrumb.model';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCounts } from '@core/model/trainingAndQualifications.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';

@Component({
  selector: 'app-new-training-tab',
  templateUrl: './training-tab.component.html',
})
export class NewTrainingTabComponent implements OnInit {
  @Input() workplace: Establishment;
  // @Input() workers: Worker[];
  @Input() workerCount: number;
  @Input() trainingCounts: TrainingCounts;
  @Input() tAndQsLastUpdated: string;

  public canEditWorker: boolean;
  public workers = [];
  public totalRecords: number;

  constructor(private breadcrumbService: BreadcrumbService, private permissionsService: PermissionsService) {}

  ngOnInit(): void {
    this.canEditWorker = this.permissionsService.can(this.workplace.uid, 'canEditWorker');
    this.breadcrumbService.show(JourneyType.TRAINING_AND_QUALIFICATIONS_TAB);
  }
}
