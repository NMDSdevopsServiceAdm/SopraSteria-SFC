import { I18nPluralPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-workplace-summary',
  templateUrl: './new-workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class NewWorkplaceSummaryComponent implements OnInit, OnDestroy, OnChanges {
  private _workplace: any;
  protected subscriptions: Subscription = new Subscription();
  public hasCapacity: boolean;
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

  @Input() wdfView = false;
  @Input() overallWdfEligibility: boolean;
  @Input() workerCount: number;
  @Input()
  set workplace(workplace: any) {
    this._workplace = workplace;
    this.capacityMessages = [];

    if (this._workplace && this._workplace.capacities) {
      const temp = [];
      this._workplace.capacities.forEach((capacity) => {
        temp[capacity.question] = temp[capacity.question] ? temp[capacity.question] + capacity.answer : capacity.answer;
      });

      if (Object.keys(temp).length) {
        Object.keys(temp).forEach((key) => {
          if (this.pluralMap[key]) {
            const message = this.i18nPluralPipe.transform(temp[key], this.pluralMap[key]);
            this.capacityMessages.push(message);
          }
        });
      }
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
    this.pluralMap['How many beds do you currently have?'] = {
      '=1': '# bed available',
      other: '# beds available',
    };
    this.pluralMap['How many of those beds are currently used?'] = {
      '=1': '# bed used',
      other: '# beds used',
    };
    this.pluralMap['How many places do you currently have?'] = {
      '=1': '# place',
      other: '# places',
    };
    this.pluralMap['Number of people receiving care on the completion date'] = {
      '=1': '# person receiving care',
      other: '# people receiving care',
    };
    this.pluralMap['Number of people using the service on the completion date'] = {
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
