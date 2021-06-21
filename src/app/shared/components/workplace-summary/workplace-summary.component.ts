import { I18nPluralPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-workplace-summary',
  templateUrl: './workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class WorkplaceSummaryComponent implements OnInit, OnDestroy {
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
  public wdfNewDesign: boolean;

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

  get totalStaffWarning(): boolean {
    if (this.wdfNewDesign) {
      return (
        this.workplace.numberOfStaff &&
        (this.workplace.numberOfStaff > 0 || this.workerCount > 0) &&
        this.workplace.numberOfStaff !== this.workerCount
      );
    }
    return (
      (this.workplace.numberOfStaff > 0 || this.workplace.totalWorkers > 0) &&
      this.workplace.numberOfStaff !== this.workplace.totalWorkers
    );
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
    private featureFlagsService: FeatureFlagsService,
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
    this.setFeatureFlags();

    this.subscriptions.add(
      this.permissionsService.getPermissions(this.workplace.uid).subscribe((permission) => {
        this.canViewListOfWorkers = permission.permissions.canViewListOfWorkers;
        this.canEditEstablishment = permission.permissions.canEditEstablishment;
      }),
    );

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

    if (this.wdfView && this.wdfNewDesign) {
      this.updateEmployerTypeIfNotUpdatedSinceEffectiveDate();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    this.workerService.setReturnTo(this.return);
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

  private setFeatureFlags(): void {
    this.featureFlagsService.configCatClient.getValueAsync('wdfNewDesign', false).then((value) => {
      this.wdfNewDesign = value;
    });
  }

  public getRoutePath(name: string): Array<string> {
    return ['/workplace', this.workplace.uid, name];
  }

  public confirmField(dataField: string): void {
    const props = { [dataField]: this.workplace[dataField] };

    this.subscriptions.add(
      this.establishmentService.updateWorkplace(this.workplace.uid, props).subscribe((data) => console.log(data)),
    );
  }

  private updateEmployerTypeIfNotUpdatedSinceEffectiveDate(): void {
    if (this.workplace.wdf?.employerType.isEligible && !this.workplace.wdf?.employerType.updatedSinceEffectiveDate) {
      this.confirmField('employerType');
    }
  }
}
