import { I18nPluralPipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Establishment } from '@core/model/establishment.model';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkplaceUtil } from '@core/utils/workplace-util';
import { sortBy } from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-workplace-summary',
  templateUrl: './workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class NewWorkplaceSummaryComponent implements OnInit, OnDestroy {
  @Input() workplace: Establishment;
  @Input() return: URLStructure = null;
  @Input() workerCount: number;

  private subscriptions: Subscription = new Subscription();
  public canEditEstablishment: boolean;
  public canViewListOfWorkers: boolean;
  public cqcStatusRequested: boolean;
  public requestedServiceName: string;
  public requestedServiceOtherName: string;
  public pluralMap = [];
  private capacities: any;
  public hasCapacity: boolean;
  public capacityMessages = [];

  constructor(
    private i18nPluralPipe: I18nPluralPipe,
    private permissionsService: PermissionsService,
    private establishmentService: EstablishmentService,
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
    if (this.workplace.employerType) {
      this.workplace.employerType.value = WorkplaceUtil.formatTypeOfEmployer(this.workplace.employerType.value);
    }

    this.getCapacityMessages();
    this.getPermissions();
    this.getCqcStatus();
  }

  private getPermissions(): void {
    this.canEditEstablishment = this.permissionsService.can(this.workplace.uid, 'canEditEstablishment');
    this.canViewListOfWorkers = this.permissionsService.can(this.workplace.uid, 'canViewListOfWorkers');
  }

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
  }

  private getCqcStatus(): void {
    this.cqcStatusRequested = false;
    this.subscriptions.add(
      this.cqcStatusChangeService.getCqcRequestByEstablishmentId(this.workplace.id).subscribe((cqcStatus) => {
        if (cqcStatus !== null) {
          this.cqcStatusRequested = true;
          this.requestedServiceName = cqcStatus.data.requestedService.name;
          this.requestedServiceOtherName = cqcStatus.data.requestedService.other;
        }
      }),
    );
  }

  private getCapacityMessages(): void {
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
              service: ` ${capacity.service.split(':')[1]}`,
            };
          });
        });

        if (Object.keys(temp).length) {
          Object.keys(temp).forEach((key) => {
            if (this.pluralMap[temp[key].question]) {
              const message =
                (temp[key].value ? temp[key].service + ': ' : '') +
                this.i18nPluralPipe.transform(temp[key].value, this.pluralMap[temp[key].question]);

              this.capacityMessages.push({ message, service: temp[key].service });
            }
          });
          this.sortedCapacityService(this.capacityMessages);
        }
      }),
    );
  }

  public filterAndSortOtherServices(services: any): Service[] {
    let servicesArr: Service[] = [];
    for (const service of services) {
      servicesArr = servicesArr.concat(service.services);
    }
    return sortBy(
      servicesArr.filter((service) => service.name !== this.workplace.mainService.name),
      'name',
    );
  }

  private sortedCapacityService(capacityService: any) {
    capacityService.sort((serviceA: any, serviceB: any) => {
      return serviceA.service.localeCompare(serviceB.service);
    });
  }

  public isArray(variable: any): boolean {
    return Array.isArray(variable);
  }

  public formatMonetaryValue(unformattedMoneyString: string): string {
    return unformattedMoneyString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
