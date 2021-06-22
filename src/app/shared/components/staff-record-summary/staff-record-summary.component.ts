import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html'
})
export class StaffRecordSummaryComponent implements OnInit {
  @Input() set worker(value: Worker) {
    this._worker = value;
  }

  get worker(): Worker {
    return this._worker;
  }

  @Input() workplace: Establishment;
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;

  private _worker: Worker;
  private workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public wdfNewDesign: boolean;

  constructor(
    private location: Location,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    public workerService: WorkerService,
    private featureFlagsService: FeatureFlagsService
  ) {
  }

  ngOnInit() {
    this.workplaceUid = this.workplace.uid;

    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');

    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.wdfNewDesign = value;
      if (this.wdfView ) {
        if (this.wdfNewDesign) {
          this.updateFieldsWhichDontRequireConfirmation();
        }else{
          const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
          const returnTo = this.wdfView
            ? { url: [...staffRecordPath, ...['wdf-summary']] }
            : { url: [...staffRecordPath, ...['check-answers']] };
          this.workerService.setReturnTo(returnTo);
        }
      }

    });
  }

  setReturn() {}


  public getRoutePath(name: string) {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, name];
  }

  public confirmField(dataField) {
    const props = { [dataField]: this.worker[dataField] };

    this.subscriptions.add(
      this.workerService
        .updateWorker(this.workplace.uid, this.worker.uid, props)
        .subscribe(() =>
          this.workerService.getWorker(this.workplaceUid, this.worker.uid, true).subscribe((worker => {
            this._worker = worker;
            this.updateFieldsWhichDontRequireConfirmation();
          }))
        )
    );
  }

  public updateFieldsWhichDontRequireConfirmation(): void {
    const fieldsWhichDontRequireConfirmation = [
      'dateOfBirth',
      'gender',
      'nationality',
      'recruitedFrom',
      'careCertificate',
      'qualificationInSocialCare'
    ];
    const otherFields = [
      'currentEligibility',
      'effectiveFrom',
      'isEligible',
      'lastEligibility'
    ];
    const allFields = Object.keys(this.worker.wdf);

    let allEligible = true;
    allFields.forEach(field => {
      if (!fieldsWhichDontRequireConfirmation.includes(field) &&
        !otherFields.includes(field) &&
        (this.worker.wdf[field]?.isEligible === 'No' ||
          (this.worker.wdf[field]?.isEligible === 'Yes' && this.worker.wdf[field]?.updatedSinceEffectiveDate === false)
        )
      ) {
        allEligible = false;
      }
    });

    if (!allEligible) {
      return;
    }
    for (const fieldCheck of fieldsWhichDontRequireConfirmation) {
      if (!this.worker.wdf?.[fieldCheck]?.isEligible) {
        continue;
      }
      if (this.worker.wdf?.[fieldCheck].isEligible === 'Yes' && !this.worker.wdf?.[fieldCheck].updatedSinceEffectiveDate) {
        if ((fieldCheck === 'careCertificate' && this.worker.careCertificate !== 'Yes, completed') ||
        (fieldCheck === 'qualificationInSocialCare' && this.worker.qualificationInSocialCare !== 'Yes') ){
          continue;
        }
        this.confirmField(fieldCheck);
      }
    }
  }
}
