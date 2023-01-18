import { I18nPluralPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { WorkplaceUtil } from '@core/utils/workplace-util';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-summary',
  templateUrl: './workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class WorkplaceSummaryComponent implements OnInit, OnDestroy, OnChanges {
  private _workplace: any;
  public resp: any;
  protected subscriptions: Subscription = new Subscription();
  public hasCapacity: boolean;
  private capacities: any;
  public capacityMessages = [];
  public pluralMap = [];
  public canEditEstablishment: boolean;
  public cqcStatusRequested: boolean;
  public requestedServiceName: string;
  public requestedServiceOtherName: string;
  public canViewListOfWorkers = false;
  public confirmedFields: Array<string> = [];
  public showTotalStaffWarning: boolean;
  public checkAnswersPage: boolean;
  public now: Date = new Date();
  @Output() allFieldsConfirmed: EventEmitter<Event> = new EventEmitter();

  @Input() removeServiceSectionMargin = false;
  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() workerCount: number;
  @Input()
  set workplace(workplace: any) {
    this._workplace = workplace;
    this.capacityMessages = [];

    if (this._workplace.employerType) {
      this._workplace.employerType.value = WorkplaceUtil.formatTypeOfEmployer(this._workplace.employerType.value);
    }
  }

  get workplace(): any {
    return this._workplace;
  }

  @Input() return: URLStructure = null;
  ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        if (propName === 'workerCount' || '_workplace') {
          {
            this.setTotalStaffWarning();
          }
        }
      }
    }
  }

  get totalStaffWarningNonWDF(): boolean {
    return (
      (this.workplace.numberOfStaff != null || this.workplace.totalWorkers !== null) &&
      this.workplace.numberOfStaff !== this.workerCount
    );
  }

  constructor(
    private i18nPluralPipe: I18nPluralPipe,
    private establishmentService: EstablishmentService,
    private permissionsService: PermissionsService,
    private workerService: WorkerService,
    private cqcStatusChangeService: CqcStatusChangeService,
  ) {
    this.pluralMap['How many beds do you have?'] = {
      '=1': '# bed available',
      other: '# beds available',
    };
    this.pluralMap['How many of those beds are being used?'] = {
      '=1': '# bed used',
      other: '# beds used',
    };
    this.pluralMap['How many places do you have at the moment?'] = {
      '=1': '# place',
      other: '# places',
    };
    this.pluralMap['Number of people receiving care at the moment'] = {
      '=1': '# person receiving care',
      other: '# people receiving care',
    };
    this.pluralMap['Number of people using the service at the moment'] = {
      '=1': '# person using the service',
      other: '# people using the service',
    };
    this.pluralMap['Number of those places that are being used'] = {
      '=1': '# person using the service',
      other: '# people using the service',
    };
  }

  ngOnInit(): void {
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
    this.checkAnswersPage = this.return?.url.includes('check-answers');

    this.setTotalStaffWarning();
    if (this.canEditEstablishment && this.wdfView) {
      this.updateEmployerTypeIfNotUpdatedSinceEffectiveDate();
    }

    this.subscriptions.add(
      this.establishmentService.getCapacity(this.workplace.uid, true).subscribe((response) => {
        this.hasCapacity = response.allServiceCapacities && response.allServiceCapacities.length ? true : false;
        this.capacities = response.allServiceCapacities;

        const temp = [{}];
        this.capacities.forEach((capacity) => {
          capacity.questions.forEach((question) => {
            temp[question.questionId] = {
              question: question.question,
              value: temp[question.questionId] ? question.question + question.answer : question.answer,
              service: ` (${capacity.service.split(':')[1].trim().toLowerCase()})`,
            };
          });
        });

        if (Object.keys(temp).length) {
          Object.keys(temp).forEach((key) => {
            if (this.pluralMap[temp[key].question]) {
              const message =
                this.i18nPluralPipe.transform(temp[key].value, this.pluralMap[temp[key].question]) +
                (temp[key].value ? temp[key].service : '');
              this.capacityMessages.push({ message, service: temp[key].service });
            }
          });
          this.sortedCapacityService(this.capacityMessages);
        }
      }),
    );

    this.cqcStatusRequested = false;
    this.subscriptions.add(
      this.cqcStatusChangeService.getCqcRequestByEstablishmentId(this.workplace.id).subscribe((cqcStatus) => {
        if (cqcStatus != null) {
          this.cqcStatusRequested = true;
          this.requestedServiceName = cqcStatus.data.requestedService.name;
          this.requestedServiceOtherName = cqcStatus.data.requestedService.other;
        }
      }),
    );
  }

  public sortedCapacityService(capacityService: any) {
    capacityService.sort((serviceA: any, serviceB: any) => {
      return serviceA.service.localeCompare(serviceB.service);
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  public setTotalStaffWarning(): void {
    if (this.workplace.workerCount === null && this.workerCount === null) {
      this.showTotalStaffWarning = false;
    } else {
      this.showTotalStaffWarning =
        this.workplace.numberOfStaff !== undefined &&
        (this.workplace.numberOfStaff > 0 || this.workerCount > 0) &&
        this.workplace.numberOfStaff !== this.workerCount;
    }
  }

  public formatMonetaryValue(unformattedMoneyString): string {
    return unformattedMoneyString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  public filterAndSortOtherServices(services: Service[]): Service[] {
    return sortBy(
      services.filter((service) => service.name !== this.workplace.mainService.name),
      'id',
    );
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
  }

  public selectStaffTab(event: Event): void {
    event.preventDefault();
    this.workerService.tabChanged.next(true);
  }

  public isNumber(value: unknown): boolean {
    return typeof value === 'number';
  }

  public staffMismatchWarning(): boolean {
    return (
      this.canViewListOfWorkers && this.isNumber(this.workerCount) && !this.wdfView && this.totalStaffWarningNonWDF
    );
  }

  public getRoutePath(name: string): Array<string> {
    return ['/workplace', this.workplace.uid, name];
  }

  public confirmField(dataField: string): void {
    const props = { [dataField]: this.workplace[dataField] };

    this.subscriptions.add(
      this.establishmentService.updateWorkplace(this.workplace.uid, props).subscribe((data) => {
        this.confirmedFields.push(dataField);
        if (this.allRequiredFieldsUpdated()) {
          this.allFieldsConfirmed.emit();
        }
      }),
    );
  }

  public convertToDate(dateString: string): Date {
    return new Date(dateString);
  }

  public updateEmployerTypeIfNotUpdatedSinceEffectiveDate(): void {
    if (this.workplace.wdf?.employerType.isEligible && !this.workplace.wdf?.employerType.updatedSinceEffectiveDate) {
      this.confirmField('employerType');
    }
  }

  public allRequiredFieldsUpdated(): boolean {
    const requiredFields = [
      'employerType',
      'leavers',
      'mainService',
      'numberOfStaff',
      'serviceUsers',
      'starters',
      'vacancies',
    ];

    return requiredFields.every(
      (field) => this.workplace.wdf[field].updatedSinceEffectiveDate || this.confirmedFields.includes(field),
    );
  }
}
