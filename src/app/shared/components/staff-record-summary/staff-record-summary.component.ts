import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-staff-record-summary',
  templateUrl: './staff-record-summary.component.html',
})
export class StaffRecordSummaryComponent implements OnInit, OnDestroy {
  @Input() set worker(value: Worker) {
    this._worker = value;
  }

  get worker(): Worker {
    return this._worker;
  }

  @Input() workplace: Establishment;
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Output() allFieldsConfirmed = new EventEmitter();

  private _worker: Worker;
  private workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public canViewNinoDob: boolean;
  public showPoolBankTag: boolean;

  constructor(
    private permissionsService: PermissionsService,
    public workerService: WorkerService,
    private wdfConfirmFieldsService: WdfConfirmFieldsService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.workplace.uid;
    this.showPoolBankTag = this.worker.contract === 'Pool/Bank' ? true : false;

    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.canViewNinoDob = this.permissionsService.can(this.workplaceUid, 'canViewNinoDob');

    if (this.canEditWorker && this.wdfView) {
      if (this.allRequiredFieldsUpdatedAndEligible()) {
        this.updateFieldsWhichDontRequireConfirmation();
      }
    } else {
      console.log('**** staff record summary component ****');
      const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
      const returnTo = { url: staffRecordPath };
      this.workerService.setReturnTo(returnTo);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.wdfConfirmFieldsService.clearConfirmFields();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setReturn(): void {}

  public emitAllFieldsConfirmed(): void {
    this.allFieldsConfirmed.emit();
  }

  public getRoutePath(name: string): Array<string> {
    return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, 'staff-record-summary', name];
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

  public async updateFieldsWhichDontRequireConfirmation(): Promise<void> {
    const fieldsWhichDontRequireConfirmation = [
      'dateOfBirth',
      'gender',
      'nationality',
      'recruitedFrom',
      'careCertificate',
      'qualificationInSocialCare',
    ];

    const props = {};

    await Promise.all(
      fieldsWhichDontRequireConfirmation.map(async (fieldCheck) => {
        if (
          this.worker.wdf?.[fieldCheck]?.isEligible &&
          this.worker.wdf?.[fieldCheck].isEligible === 'Yes' &&
          !this.worker.wdf?.[fieldCheck].updatedSinceEffectiveDate &&
          !(fieldCheck === 'careCertificate' && this.worker.careCertificate !== 'Yes, completed') &&
          !(fieldCheck === 'qualificationInSocialCare' && this.worker.qualificationInSocialCare !== 'Yes')
        ) {
          return (props[fieldCheck] = this.worker[fieldCheck]);
        }
      }),
    );

    await this.workerService.updateWorker(this.workplace.uid, this.worker.uid, props).toPromise();
    this.allFieldsConfirmed.emit();
  }
}
