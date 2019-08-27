import { I18nPluralPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Roles } from '@core/model/roles.enum';
import { Service } from '@core/model/services.model';
import { URLStructure } from '@core/model/url.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { sortBy } from 'lodash';
import { isArray } from 'util';

@Component({
  selector: 'app-workplace-summary',
  templateUrl: './workplace-summary.component.html',
  providers: [I18nPluralPipe],
})
export class WorkplaceSummaryComponent {
  public capacityMessages = [];
  public pluralMap = [];
  public canEdit: boolean;
  private _workplace: any;
  @Input() wdfView = false;
  @Input() workerCount?: number;

  @Input()
  set workplace(workplace: any) {
    if (!workplace.employerType) {
      return;
    }

    this._workplace = workplace;
    this.capacityMessages = [];

    if (this._workplace && this._workplace.capacities) {
      const temp = [];
      this._workplace.capacities.forEach(capacity => {
        temp[capacity.question] = temp[capacity.question] ? temp[capacity.question] + capacity.answer : capacity.answer;
      });

      if (Object.keys(temp).length) {
        Object.keys(temp).forEach(key => {
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

  get totalStaffWarning() {
    return (
      (this.workplace.numberOfStaff > 0 || this.workplace.totalWorkers > 0) &&
      this.workplace.numberOfStaff !== this.workplace.totalWorkers
    );
  }

  constructor(
    private i18nPluralPipe: I18nPluralPipe,
    private establishmentService: EstablishmentService,
    private userService: UserService,
    private workerService: WorkerService
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

    this.canEdit = [Roles.Edit, Roles.Admin].includes(this.userService.loggedInUser.role);
  }

  public filterAndSortOtherServices(services: Service[]) {
    return sortBy(services.filter(service => service.name !== this.workplace.mainService.name), 'id');
  }

  public isArray(variable): boolean {
    return isArray(variable);
  }

  public setReturn(): void {
    this.establishmentService.setReturnTo(this.return);
    this.workerService.setReturnTo(this.return);
  }
}
