import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { URLStructure } from '@core/model/url.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent implements OnInit {
  @Input() set worker(value: Worker) {
    this._worker = value;
  }

  get worker(): Worker {
    return this._worker;
  }

  @Input() workplace: Establishment;
  @Input() return: URLStructure;
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Output() allFieldsConfirmedAgain = new EventEmitter();

  private _worker: Worker;
  private workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public returnTo: URLStructure;
  public wdfNewDesign: boolean;

  constructor(
    private location: Location,
    private permissionsService: PermissionsService,
    private route: ActivatedRoute,
    public workerService: WorkerService,
    private featureFlagsService: FeatureFlagsService,
    private wdfConfirmFieldsService: WdfConfirmFieldsService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.workplace.uid;

    const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
    this.returnTo = this.wdfView
      ? { url: [...staffRecordPath, ...['wdf-summary']] }
      : { url: [...staffRecordPath, ...['check-answers']] };

    // this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.canEditWorker = true;

    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.wdfNewDesign = value;

      if (this.wdfView && this.wdfNewDesign) {
        this.updateFieldsWhichDontRequireConfirmation();
        this.setNewWdfReturn();
      }
    });
  }

  setReturn() {
    this.workerService.setReturnTo(this.return);
  }

  public helloWorld() {
    console.log('HELLO WORLD');
    this.allFieldsConfirmedAgain.emit();
  }

  private setNewWdfReturn(): void {
    if (this.route.snapshot.params.establishmentuid) {
      this.returnTo = {
        url: ['/wdf', 'workplaces', this.workplaceUid, 'staff-record', this.worker.uid],
        fragment: 'staff-records',
      };
    } else {
      this.returnTo = { url: ['/wdf', 'staff-record', this.worker.uid] };
    }
  }

  public getRoutePath(name: string) {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, name];
  }

  public confirmField(dataField: string): void {
    const props = { [dataField]: this.worker[dataField] };
    this.subscriptions.add(
      this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(() => {
        this.wdfConfirmFieldsService.addToConfirmedFields(dataField);
        if (this.allRequiredFieldsUpdatedAndEligible()) {
          this.updateFieldsWhichDontRequireConfirmation();
        }
      }),
    );
  }

  public allRequiredFieldsUpdatedAndEligible(): boolean {
    const requiredFields = [
      'annualHourlyPay',
      'contract',
      'daysSick',
      'highestQualification',
      'mainJob',
      'mainJobStartDate',
      'otherQualification',
      'socialCareQualification',
      'weeklyHoursAverage',
      'weeklyHoursContracted',
      'zeroHoursContract',
    ];

    return requiredFields.every((field) => {
      return (
        (this.worker.wdf[field].isEligible && this.worker.wdf[field].updatedSinceEffectiveDate) ||
        this.worker.wdf[field].isEligible === 'Not relevant' ||
        this.wdfConfirmFieldsService.getConfirmedFields().includes(field)
      );
    });
  }

  public updateFieldsWhichDontRequireConfirmation(): void {
    const fieldsWhichDontRequireConfirmation = [
      'dateOfBirth',
      'gender',
      'nationality',
      'recruitedFrom',
      'careCertificate',
      'qualificationInSocialCare',
    ];

    for (const fieldCheck of fieldsWhichDontRequireConfirmation) {
      if (!this.worker.wdf?.[fieldCheck]?.isEligible) {
        continue;
      }
      if (
        this.worker.wdf?.[fieldCheck].isEligible === 'Yes' &&
        !this.worker.wdf?.[fieldCheck].updatedSinceEffectiveDate
      ) {
        if (
          (fieldCheck === 'careCertificate' && this.worker.careCertificate !== 'Yes, completed') ||
          (fieldCheck === 'qualificationInSocialCare' && this.worker.qualificationInSocialCare !== 'Yes')
        ) {
          continue;
        }
        const props = { [fieldCheck]: this.worker[fieldCheck] };
        this.subscriptions.add(
          this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).subscribe(() => {
            console.log(fieldCheck);
          }),
        );
      }
    }
    this.allFieldsConfirmedAgain.emit();
  }
}
