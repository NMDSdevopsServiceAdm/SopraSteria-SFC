import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Ethnicity } from '@core/model/ethnicity.model';
import { Worker } from '@core/model/worker.model';
import { EthnicityService } from '@core/services/ethnicity.service';
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
  public workplaceUid: string;
  private subscriptions: Subscription = new Subscription();
  public canEditWorker: boolean;
  public canViewNinoDob: boolean;
  public showPoolBankTag: boolean;
  public showDisability: string;
  public ethnicGroupData: string;
  public ethnicityData: string;
  private ethnicityObject: Ethnicity;

  constructor(
    private permissionsService: PermissionsService,
    public workerService: WorkerService,
    private wdfConfirmFieldsService: WdfConfirmFieldsService,
    protected route: ActivatedRoute,
    public ethnicityService: EthnicityService,
  ) {}

  ngOnInit(): void {
    this.workplaceUid = this.workplace.uid;
    this.showPoolBankTag = this.worker.contract === 'Pool/Bank' ? true : false;
    this.showDisability =
      this.worker.disability === 'Undisclosed' ? 'They preferred not to say' : this.worker.disability;

    this.canEditWorker = this.permissionsService.can(this.workplaceUid, 'canEditWorker');
    this.canViewNinoDob = this.permissionsService.can(this.workplaceUid, 'canViewNinoDob');
    if (this.worker.ethnicity) {
      this.getAndSetEthnicityData();
    }
    if (this.canEditWorker && this.wdfView) {
      if (this.allRequiredFieldsUpdatedAndEligible()) {
        this.updateFieldsWhichDontRequireConfirmation();
      }
    } else {
      const staffRecordPath = ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid];
      const returnTo = { url: staffRecordPath };
      this.workerService.setReturnTo(returnTo);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.wdfConfirmFieldsService.clearConfirmFields();
  }

  getAndSetEthnicityData() {
    const incorrectEthnicityGroupArray = [
      'English / Welsh / Scottish / Northern Irish / British',
      'Any other Mixed/ multiple ethnic background',
      'Any other Black / African / Caribbean background',
    ];

    this.subscriptions.add(
      this.ethnicityService.getEthnicities().subscribe((ethnicityData) => {
        this.ethnicityObject = ethnicityData.list.find(
          (ethnicityObject) => ethnicityObject.id === this.worker.ethnicity?.ethnicityId,
        );
        this.ethnicGroupData = this.formatEthnicityGroup(this.ethnicityObject.group);
        this.ethnicityData = this.ethnicityObject.ethnicity;

        if (incorrectEthnicityGroupArray.includes(this.ethnicityObject.ethnicity)) {
          this.ethnicityData = this.formatEthnicities(this.ethnicityObject.ethnicity, incorrectEthnicityGroupArray);
        }
      }),
    );
  }

  //text ethnicity pulled from DB can't currently be changed due to LA but needs changing on frontend hence temporary transform function AP 17/10/22
  public formatEthnicityGroup(workerEthnicityGroup: string): string {
    const ethnicityGroupOptions = [
      { value: 'White', tag: 'White' },
      { value: 'Mixed / multiple ethnic groups', tag: 'Mixed or Multiple ethnic groups' },
      { value: 'Asian / Asian British', tag: 'Asian or Asian British' },
      { value: 'Black / African / Caribbean / Black British', tag: 'Black, African, Caribbean or Black British' },
      { value: 'Other ethnic group', tag: 'Other ethnic group' },
      { value: `Don't know`, tag: `Don't know` },
    ];
    const workerEthnicityObj = ethnicityGroupOptions.find(
      (typeOfEthnicityGroup) => typeOfEthnicityGroup.value === workerEthnicityGroup,
    );
    return workerEthnicityObj.tag;
  }

  //text ethnicity pulled from DB can't currently be changed due to LA but needs changing on frontend hence temporary transform function AP 17/10/22
  public formatEthnicities(workerEthnicity: string, incorrectEthnicityGroupArray: string[]): string {
    const ethnicityOptions = [
      {
        value: incorrectEthnicityGroupArray[0],
        tag: 'English, Welsh, Scottish, Northen Irish or British',
      },
      { value: incorrectEthnicityGroupArray[1], tag: 'Any other Mixed or Multiple ethnic background' },
      {
        value: incorrectEthnicityGroupArray[2],
        tag: 'Any other Black, African or Caribbean background',
      },
    ];
    const workerEthnicityObj = ethnicityOptions.find((typeOfEthnicity) => typeOfEthnicity.value === workerEthnicity);
    return workerEthnicityObj.tag;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setReturn(): void {}

  public emitAllFieldsConfirmed(): void {
    this.allFieldsConfirmed.emit();
  }

  public getRoutePath(name: string, isWdf: boolean = false): Array<string> {
    if (isWdf) {
      return this.route.snapshot.params.establishmentuid
        ? ['/wdf', 'workplaces', this.workplaceUid, 'staff-record', this.worker.uid, name]
        : ['/wdf', 'staff-record', this.worker.uid, name];
    } else {
      return ['/workplace', this.workplaceUid, 'staff-record', this.worker.uid, 'staff-record-summary', name];
    }
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
