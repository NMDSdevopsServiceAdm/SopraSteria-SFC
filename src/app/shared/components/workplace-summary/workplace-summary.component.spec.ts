import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockCqcStatusChangeService } from '@core/test-utils/MockCqcStatusChangeService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { WdfModule } from '@features/wdf/wdf-data-change/wdf.module';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import dayjs from 'dayjs';

import { establishmentWithShareWith, establishmentWithWdfBuilder } from '../../../../../server/test/factories/models';
import { WorkplaceSummaryComponent } from './workplace-summary.component';

describe('WorkplaceSummaryComponent', () => {
  const setup = async (shareWith = null) => {
    const { fixture, getByText, getByTestId, queryByTestId, rerender } = await render(WorkplaceSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WdfModule],
      declarations: [],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: CqcStatusChangeService,
          useClass: MockCqcStatusChangeService,
        },
      ],
      componentProperties: {
        wdfView: true,
        workplace: shareWith ? establishmentWithShareWith(shareWith) : (establishmentWithWdfBuilder() as Establishment),
        removeServiceSectionMargin: false,
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByTestId, rerender };
  };

  it('should render a WorkplaceSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render all the sections', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.workplace.isRegulated = true;
    fixture.detectChanges();

    expect(getByTestId('workplace-section')).toBeTruthy();
    expect(getByTestId('cqcLocationId')).toBeTruthy();
    expect(getByTestId('numberOfStaff')).toBeTruthy();
    expect(getByTestId('employerType')).toBeTruthy();
    expect(getByTestId('services-section')).toBeTruthy();
    expect(getByTestId('vacancies-and-turnover-section')).toBeTruthy();
    expect(getByTestId('recruitment-section')).toBeTruthy();
    expect(getByTestId('permissions-section')).toBeTruthy();
    expect(getByTestId('staff-benefits-section')).toBeTruthy();
  });

  it('should render the certain sections when on the check-answers page', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.checkAnswersPage = true;
    fixture.detectChanges();

    expect(queryByTestId('workplace-section')).toBeFalsy();
    expect(queryByTestId('cqcLocationId')).toBeFalsy();
    expect(queryByTestId('numberOfStaff')).toBeFalsy();
    expect(queryByTestId('employerType')).toBeFalsy();
    expect(getByTestId('services-section')).toBeTruthy();
    expect(getByTestId('vacancies-and-turnover-section')).toBeTruthy();
    expect(getByTestId('recruitment-section')).toBeTruthy();
    expect(getByTestId('permissions-section')).toBeTruthy();
    expect(getByTestId('staff-benefits-section')).toBeTruthy();
  });

  it('should render the services section with top margin when removeServiceSectionMargin is false, and without margin when true', async () => {
    const { rerender, getByText } = await setup();

    const serviceHeading = getByText('Services');
    expect(serviceHeading.getAttribute('class')).toContain('govuk-!-margin-top-5');

    rerender({ removeServiceSectionMargin: true });
    expect(serviceHeading.getAttribute('class')).not.toContain('govuk-!-margin-top-5');
  });

  it('should render the workplace and services section when the workplace details flow has not been completed', async () => {
    const { component, fixture, getByTestId, queryByTestId } = await setup();

    component.workplace.isRegulated = true;
    component.workplace.showAddWorkplaceDetailsBanner = true;
    fixture.detectChanges();

    expect(getByTestId('workplace-section')).toBeTruthy();
    expect(getByTestId('cqcLocationId')).toBeTruthy();
    expect(getByTestId('numberOfStaff')).toBeTruthy();
    expect(getByTestId('employerType')).toBeTruthy();
    expect(getByTestId('services-section')).toBeTruthy();
    expect(queryByTestId('vacancies-and-turnover-section')).toBeFalsy();
    expect(queryByTestId('recruitment-section')).toBeFalsy();
    expect(queryByTestId('permissions-section')).toBeFalsy();
    expect(queryByTestId('staff-benefits-section')).toBeFalsy();
  });

  describe('workplace-section', () => {
    describe('Workplace name', () => {
      it('should render the workplace name and address', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.name = 'Care 1';
        component.workplace.address = 'Care Home, Leeds';
        component.workplace.address1 = 'Care Home';
        component.workplace.address2 = 'Care Street';
        component.workplace.address3 = 'Town';
        component.workplace.town = 'Leeds';
        component.workplace.county = 'Yorkshire';
        component.workplace.postcode = 'LS1 1AB';

        fixture.detectChanges();

        const workplace = component.workplace;

        expect(getByText('Workplace name')).toBeTruthy();
        expect(getByText('Workplace address')).toBeTruthy();
        expect(getByText(workplace.name)).toBeTruthy();
        expect(getByText(workplace.address1)).toBeTruthy();
        expect(getByText(workplace.address2)).toBeTruthy();
        expect(getByText(workplace.address3)).toBeTruthy();
        expect(getByText(workplace.town)).toBeTruthy();
        expect(getByText(workplace.county)).toBeTruthy();
        expect(getByText(workplace.postcode)).toBeTruthy();
      });

      it('should render a Change link', async () => {
        const { component, fixture } = await setup();

        component.workplace.name = 'Care Home';
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const workplaceRow = within(document.body).queryByTestId('workplace-section');
        const link = within(workplaceRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-workplace-details`);
      });
    });

    describe('CQC Location ID', () => {
      it('should render the locationID and a Change link if the workplace is regulated', async () => {
        const { component, fixture } = await setup();

        component.workplace.isRegulated = true;
        component.canEditEstablishment = true;
        component.workplace.locationId = '1-23452354';

        fixture.detectChanges();

        const cqcLocationIdRow = within(document.body).queryByTestId('cqcLocationId');
        const link = within(cqcLocationIdRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/regulated-by-cqc`);
        expect(within(cqcLocationIdRow).queryByText(component.workplace.locationId)).toBeTruthy();
      });

      it('should render not the locationID if the workplace is not regulated', async () => {
        const { component, fixture, queryByTestId } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        expect(queryByTestId('cqcLocationId')).toBeFalsy();
      });
    });

    describe('Number of staff', () => {
      it('should render the number of staff and a Change link with a bottom border', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        component.workplace.numberOfStaff = 4;

        fixture.detectChanges();

        const numberOfStaffRow = within(document.body).queryByTestId('numberOfStaff');
        const link = within(numberOfStaffRow).queryByText('Change');
        const property = within(numberOfStaffRow).queryByText('Number of staff');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/total-staff`);
        expect(property.getAttribute('class')).not.toContain('asc-no-border');
        expect(within(numberOfStaffRow).queryByText('4')).toBeTruthy();
      });

      it('should render the number of staff row without bottom border when there is a staff mismatch and it has been longer than 8 weeks since first login', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        component.canViewListOfWorkers = true;
        component.workerCount = 2;
        component.workplace.numberOfStaff = 4;
        component.wdfView = false;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();
        fixture.detectChanges();

        const numberOfStaffRow = within(document.body).queryByTestId('numberOfStaff');
        const property = within(numberOfStaffRow).queryByText('Number of staff');

        expect(property.getAttribute('class')).toContain('asc-no-border');
      });
    });

    describe('Number of staff warning', () => {
      it('should show banner if you have more staff records', async () => {
        const { component, fixture } = await setup();

        component.workerCount = 10;
        component.workplace.numberOfStaff = 9;
        component.wdfView = false;
        component.canViewListOfWorkers = true;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();

        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords.innerHTML).toContain(`You've more staff records than staff`);
        expect(moreRecords.innerHTML).toContain('View staff records');
      });

      it('should show banner if you have more total staff', async () => {
        const { component, fixture } = await setup();

        component.workerCount = 8;
        component.workplace.numberOfStaff = 9;
        component.wdfView = false;
        component.canViewListOfWorkers = true;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();
        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords.innerHTML).toContain(`You've more staff than staff records`);
      });

      it('should show banner if you have more staff records and 0 staff', async () => {
        const { component, fixture } = await setup();

        component.workerCount = 10;
        component.workplace.numberOfStaff = 0;
        component.wdfView = false;
        component.canViewListOfWorkers = true;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();
        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords.innerHTML).toContain(`You've more staff records than staff`);
      });

      it('should not show banner if first login date is within eight weeks of now', async () => {
        const { component, fixture } = await setup();

        component.workerCount = 10;
        component.workplace.numberOfStaff = 0;
        component.wdfView = false;
        component.canViewListOfWorkers = true;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).add(1, 'day').toString();
        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords).toBe(null);
      });

      it(`should not show banner if you don't have permission to list workers`, async () => {
        const { component, fixture } = await setup();

        component.workerCount = 10;
        component.workplace.numberOfStaff = 9;
        component.wdfView = false;
        component.canViewListOfWorkers = false;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();
        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords).toBe(null);
      });

      it('should not show banner if it is the WDF View', async () => {
        const { component, fixture } = await setup();

        component.workerCount = 10;
        component.workplace.numberOfStaff = 9;
        component.wdfView = true;
        component.canViewListOfWorkers = true;
        component.workplace.eightWeeksFromFirstLogin = dayjs(new Date()).subtract(1, 'day').toString();
        fixture.detectChanges();

        const moreRecords = within(document.body).queryByTestId('morerecords');
        expect(moreRecords).toBe(null);
      });
    });

    describe('Employer type', () => {
      it('should render the employer type and a Change link when employer type is the other field in object', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        component.workplace.employerType = { other: 'Adult care', value: 'Other' };

        fixture.detectChanges();

        const employerTypeRow = within(document.body).queryByTestId('employerType');
        const link = within(employerTypeRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/type-of-employer`);
        expect(within(employerTypeRow).queryByText('Adult care')).toBeTruthy();
      });

      it('should render the employer type and a Change link when employer type is the other field in object', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        component.workplace.employerType = { other: null, value: 'Voluntary / Charity' };

        fixture.detectChanges();

        const employerTypeRow = within(document.body).queryByTestId('employerType');
        const link = within(employerTypeRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/type-of-employer`);
        expect(within(employerTypeRow).queryByText('Voluntary / Charity')).toBeTruthy();
      });
    });
  });

  describe('services section', () => {
    it('should show the main services row but not the other rows if not on the check answers page and the update flow has not been completed', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.workplace.showAddWorkplaceDetailsBanner = true;
      fixture.detectChanges();

      expect(getByTestId('mainService')).toBeTruthy();
      expect(queryByTestId('otherServices')).toBeFalsy();
      expect(queryByTestId('serviceCapacity')).toBeFalsy();
      expect(queryByTestId('serviceUsers')).toBeFalsy();
    });

    it('should show all the rows if not on the check answers page and the update flow has been completed', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.workplace.showAddWorkplaceDetailsBanner = false;
      fixture.detectChanges();

      expect(getByTestId('mainService')).toBeTruthy();
      expect(getByTestId('otherServices')).toBeTruthy();
      expect(getByTestId('serviceCapacity')).toBeTruthy();
      expect(getByTestId('serviceUsers')).toBeTruthy();
    });

    it('should show not show the main service row if on the check answers page', async () => {
      const { component, fixture, getByTestId, queryByTestId } = await setup();

      component.checkAnswersPage = true;
      fixture.detectChanges();

      expect(queryByTestId('mainService')).toBeFalsy();
      expect(getByTestId('otherServices')).toBeTruthy();
      expect(getByTestId('serviceCapacity')).toBeTruthy();
      expect(getByTestId('serviceUsers')).toBeTruthy();
    });

    describe('Main service', () => {
      it('should show Pending on main service when non-CQC to CQC main service change has been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = true;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
        expect(mainServiceChangeOrPending.innerHTML).toContain('Pending');
      });

      it('should show Change on main service when non-CQC to CQC main service change has NOT been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = false;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
        expect(mainServiceChangeOrPending.innerHTML).toContain('Change');
      });

      it('should show requested service name when non-CQC to CQC main service change has been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = true;
        component.requestedServiceName = 'Requested service name';
        fixture.detectChanges();

        const mainServiceName = within(document.body).queryByTestId('main-service-name');
        expect(mainServiceName.innerHTML).toContain(component.requestedServiceName);
        expect(mainServiceName.innerHTML).not.toContain(component.workplace.mainService.name);
      });

      it('should show existing service name when non-CQC to CQC main service change has NOT been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = false;
        fixture.detectChanges();

        const mainServiceName = within(document.body).queryByTestId('main-service-name');
        expect(mainServiceName.innerHTML).toContain(component.workplace.mainService.name);
        expect(mainServiceName.innerHTML).not.toContain(component.requestedServiceName);
      });

      it('should show the Change link when there is a main service', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const link = within(mainServiceRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/main-service-cqc`);
      });

      it('should show the Provide information link when there is not a main service', async () => {
        const { component, fixture } = await setup();

        component.workplace.mainService = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const link = within(mainServiceRow).queryByText('Provide information');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/main-service-cqc`);
      });

      it('should show the Pending link when the cqcStatusRequested is true', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = true;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const text = within(mainServiceRow).queryByText('Pending');

        expect(text).toBeTruthy();
      });
    });

    describe('Other services', () => {
      it('should show dash and have Add information button on when otherServices is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.otherServices = { value: null };
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const otherServicesRow = within(document.body).queryByTestId('otherServices');
        const link = within(otherServicesRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/other-services`);
        expect(within(otherServicesRow).queryByText('-')).toBeTruthy();
      });

      it('should show None and have Change link when otherServices is No', async () => {
        const { component, fixture } = await setup();

        component.workplace.otherServices = { value: 'No' };
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const otherServicesRow = within(document.body).queryByTestId('otherServices');
        const link = within(otherServicesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/other-services`);
        expect(within(otherServicesRow).queryByText('None')).toBeTruthy();
      });

      it('should show list of one other service and have Change link when otherServices is Yes and there is one other service', async () => {
        const { component, fixture } = await setup();

        component.workplace.otherServices = {
          value: 'Yes',
          services: [{ category: 'category1', services: [{ id: 1, name: 'Carers' }] }],
        };

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const otherServicesRow = within(document.body).queryByTestId('otherServices');
        const link = within(otherServicesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/other-services`);
        expect(within(otherServicesRow).queryByText('Carers')).toBeTruthy();
      });

      it('should show list of multiple other services and have Change link when otherServices is Yes and there are multiple other services', async () => {
        const { component, fixture } = await setup();

        component.workplace.otherServices = {
          value: 'Yes',
          services: [
            { category: 'category1', services: [{ id: 1, name: 'Carers' }] },
            {
              category: 'category2',
              services: [
                { id: 2, name: 'Nursing' },
                { id: 3, name: 'Care' },
              ],
            },
          ],
        };

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const otherServicesRow = within(document.body).queryByTestId('otherServices');
        const link = within(otherServicesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/other-services`);
        expect(within(otherServicesRow).queryByText('Carers')).toBeTruthy();
        expect(within(otherServicesRow).queryByText('Nursing')).toBeTruthy();
        expect(within(otherServicesRow).queryByText('Care')).toBeTruthy();
      });
    });

    describe('Service capacity', () => {
      it('should show dash and have Add information button on when capacities is an empty array', async () => {
        const { component, fixture } = await setup();

        component.workplace.capacities = [];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const serviceCapacityRow = within(document.body).queryByTestId('serviceCapacity');
        const link = within(serviceCapacityRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/capacity-of-services`);
        expect(within(serviceCapacityRow).queryByText('-')).toBeTruthy();
      });

      it('should show service capacity and have Change link when capacity array is not emtpy', async () => {
        const { component, fixture } = await setup();

        component.workplace.capacities = [
          { answer: 4, question: 'Number of people receiving care on the completion date', questionId: 2, seq: 0 },
        ];
        component.capacityMessages = [{ message: '4 people receiving care', service: ' (some kind of service)' }];
        fixture.detectChanges();

        const serviceCapacityRow = within(document.body).queryByTestId('serviceCapacity');
        const link = within(serviceCapacityRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/capacity-of-services`);
        expect(within(serviceCapacityRow).queryByText('4 people receiving care')).toBeTruthy();
      });

      it('should show multiple service capacities and have Change link when capacity array has a length greater than 1', async () => {
        const { component, fixture } = await setup();

        component.workplace.capacities = [
          { answer: 4, question: 'How many people do you currently have', questionId: 1, seq: 0 },
          { answer: 1, question: 'Number of people receiving care on the completion date', questionId: 5, seq: 4 },
        ];
        component.capacityMessages = [
          { message: '1 bed available', service: ' (some kind of service)' },
          { message: '4 people receiving care', service: ' (some kind of service)' },
        ];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const serviceCapacityRow = within(document.body).queryByTestId('serviceCapacity');
        const link = within(serviceCapacityRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/capacity-of-services`);
        expect(within(serviceCapacityRow).queryByText('1 bed available')).toBeTruthy();
        expect(within(serviceCapacityRow).queryByText('4 people receiving care')).toBeTruthy();
      });
    });

    describe('Service users', () => {
      it('should show dash and have Add information button on when serviceUsers is an empty array', async () => {
        const { component, fixture } = await setup();

        component.workplace.serviceUsers = [];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const serviceUsersRow = within(document.body).queryByTestId('serviceUsers');
        const link = within(serviceUsersRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/service-users`);
        expect(within(serviceUsersRow).queryByText('-')).toBeTruthy();
      });

      it('should show the service users and have Change link when serviceUsers is not an empty array', async () => {
        const { component, fixture } = await setup();

        component.workplace.serviceUsers = [
          {
            group: 'group 1',
            id: 1,
            service: 'Service for group 1',
          },
        ];

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const serviceUsersRow = within(document.body).queryByTestId('serviceUsers');
        const link = within(serviceUsersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/service-users`);
        expect(within(serviceUsersRow).queryByText('Service for group 1')).toBeTruthy();
      });

      it('should show multiple service users and have Change link when serviceUsers is an array of length greater than 1', async () => {
        const { component, fixture } = await setup();

        component.workplace.serviceUsers = [
          {
            group: 'group 1',
            id: 1,
            service: 'Service for group 1',
          },
          {
            group: 'group 2',
            id: 2,
            service: 'Service for group 2',
          },
        ];

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const serviceUsersRow = within(document.body).queryByTestId('serviceUsers');
        const link = within(serviceUsersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/service-users`);
        expect(within(serviceUsersRow).queryByText('Service for group 1')).toBeTruthy();
        expect(within(serviceUsersRow).queryByText('Service for group 2')).toBeTruthy();
      });
    });
  });

  describe('Vacancies and turnover section', () => {
    describe('Current staff vacancies', () => {
      it('should show dash and have Add information button on when starters is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/vacancies`);
        expect(within(vacanciesRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Don't know and a Change link when vacancies is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = `Don't know`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/vacancies`);
        expect(within(vacanciesRow).queryByText(`Don't know`)).toBeTruthy();
      });

      it(`should show None and a Change link when vacancies is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = `None`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/vacancies`);
        expect(within(vacanciesRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job vacancy with number of vacancies and a Change link when one job has vacancies`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = [{ jobId: 1, title: 'Administrative', total: 3 }];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/vacancies`);
        expect(within(vacanciesRow).queryByText(`3 Administrative`)).toBeTruthy();
      });

      it(`should show multiple job vacancies with the number of vacancies for each job and a Change link when multiple jobs have vacancies`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
        ];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');

        expect(within(vacanciesRow).queryByText('Change')).toBeTruthy();
        expect(within(vacanciesRow).queryByText(`3 Administrative`)).toBeTruthy();
        expect(within(vacanciesRow).queryByText('2 Nursing')).toBeTruthy();
      });

      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Current Staff Vacancies', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.vacancies.isEligible = Eligibility.YES;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Current Staff Vacancies', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.vacancies.isEligible = Eligibility.YES;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('New starters', () => {
      it('should show dash and have Add information button on when starters is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/starters`);
        expect(within(startersRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Don't know and a Change link when starters is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = `Don't know`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/starters`);
        expect(within(startersRow).queryByText(`Don't know`)).toBeTruthy();
      });

      it(`should show None and a Change link when starters is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = `None`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/starters`);
        expect(within(startersRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job with number of starters and a Change link when there is one job with starters`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = [{ jobId: 1, title: 'Administrative', total: 3 }];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/starters`);
        expect(within(startersRow).queryByText(`3 Administrative`)).toBeTruthy();
      });

      it(`should show multiple jobs with the number of starters for each job and a Change link when multiple jobs have starters`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
        ];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');

        expect(within(startersRow).queryByText('Change')).toBeTruthy();
        expect(within(startersRow).queryByText(`3 Administrative`)).toBeTruthy();
        expect(within(startersRow).queryByText('2 Nursing')).toBeTruthy();
      });

      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for New Starters', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.starters.isEligible = Eligibility.YES;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = false;
        component.workplace.starters = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for New Starters', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.starters.isEligible = Eligibility.YES;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = false;
        component.workplace.starters = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Staff leavers', () => {
      it('should show dash and have Add information button on when leavers is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/leavers`);
        expect(within(leaversRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Don't know and a Change link when leavers is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = `Don't know`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/leavers`);
        expect(within(leaversRow).queryByText(`Don't know`)).toBeTruthy();
      });

      it(`should show None and a Change link when leavers is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = `None`;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/leavers`);
        expect(within(leaversRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job with number of leavers and a Change link when there is one job with leavers`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = [{ jobId: 1, title: 'Administrative', total: 3 }];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/leavers`);
        expect(within(leaversRow).queryByText(`3 Administrative`)).toBeTruthy();
      });

      it(`should show multiple jobs with the number of leavers for each job and a Change link when multiple jobs have leavers`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
        ];
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');

        expect(within(leaversRow).queryByText('Change')).toBeTruthy();
        expect(within(leaversRow).queryByText(`3 Administrative`)).toBeTruthy();
        expect(within(leaversRow).queryByText('2 Nursing')).toBeTruthy();
      });

      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Staff Leavers', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.leavers.isEligible = Eligibility.YES;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Staff Leavers', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.leavers.isEligible = Eligibility.YES;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });
  });

  describe('Recruitment section', () => {
    describe('Advertising spend', () => {
      it('should show dash and have Add information button on Advertising spend row when moneySpentOnAdvertisingInTheLastFourWeeksType is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.moneySpentOnAdvertisingInTheLastFourWeeks = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const advertisingSpendRow = within(document.body).queryByTestId('advertising-spend');
        const link = within(advertisingSpendRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/recruitment-advertising-cost`);
        expect(within(advertisingSpendRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on Advertising spend row when moneySpentOnAdvertisingInTheLastFourWeeksType has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const advertisingSpendRow = within(document.body).queryByTestId('advertising-spend');
        const link = within(advertisingSpendRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/recruitment-advertising-cost`);
        expect(
          within(advertisingSpendRow).getByText(
            `£${component.formatMonetaryValue(component.workplace.moneySpentOnAdvertisingInTheLastFourWeeks)}`,
          ),
        ).toBeTruthy();
      });
    });

    describe('People interviewed', () => {
      it('should show dash and have Add information button on People Interviewed row when peopleInterviewedInTheLastFourWeeks is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.peopleInterviewedInTheLastFourWeeks = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const peopleInterviewedRow = within(document.body).queryByTestId('people-interviewed');
        const link = within(peopleInterviewedRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/number-of-interviews`);
        expect(within(peopleInterviewedRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on People Interviewed row when peopleInterviewedInTheLastFourWeeks has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const peopleInterviewedRow = within(document.body).queryByTestId('people-interviewed');
        const link = within(peopleInterviewedRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/number-of-interviews`);
        expect(
          within(peopleInterviewedRow).queryByText(component.workplace.peopleInterviewedInTheLastFourWeeks),
        ).toBeTruthy();
      });
    });

    describe('Repeat training', () => {
      it('should show dash and have Add information button on  Repeat Training row when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const repeatTrainingRow = within(document.body).queryByTestId('repeat-training');
        const link = within(repeatTrainingRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/staff-recruitment-capture-training-requirement`,
        );
        expect(within(repeatTrainingRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on  Repeat Training row when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const repeatTrainingRow = within(document.body).queryByTestId('repeat-training');

        const link = within(repeatTrainingRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/staff-recruitment-capture-training-requirement`,
        );
        expect(
          within(repeatTrainingRow).queryByText(
            component.workplace.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment,
          ),
        ).toBeTruthy();
      });
    });

    describe('Accept care certificate', () => {
      it('should show dash and have Add information button on accept care certificate row when wouldYouAcceptCareCertificatesFromPreviousEmployment is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.wouldYouAcceptCareCertificatesFromPreviousEmployment = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const acceptCareCertificateRow = within(document.body).queryByTestId('accept-care-certificate');
        const link = within(acceptCareCertificateRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/accept-previous-care-certificate`,
        );
        expect(within(acceptCareCertificateRow).queryByText('Add')).toBeTruthy();
        expect(within(acceptCareCertificateRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on accept care certificate row when wouldYouAcceptCareCertificatesFromPreviousEmployment has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const acceptCareCertificateRow = within(document.body).queryByTestId('accept-care-certificate');
        const link = within(acceptCareCertificateRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/accept-previous-care-certificate`,
        );
        expect(
          within(acceptCareCertificateRow).queryByText(
            component.workplace.wouldYouAcceptCareCertificatesFromPreviousEmployment,
          ),
        ).toBeTruthy();
      });
    });
  });

  describe('Staff benefits section', () => {
    describe('Cash loyalty bonus', () => {
      it('should show dash and have Add information button on Cash loyalty bonus row when careWorkersCashLoyaltyForFirstTwoYears is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.careWorkersCashLoyaltyForFirstTwoYears = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const careWorkersCashLoyaltyRow = within(document.body).queryByTestId('cash-loyalty-bonus-spend');
        const link = within(careWorkersCashLoyaltyRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/cash-loyalty`);
        expect(within(careWorkersCashLoyaltyRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on Cash loyalty bonus row when careWorkersCashLoyaltyForFirstTwoYears has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const careWorkersCashLoyaltyRow = within(document.body).queryByTestId('cash-loyalty-bonus-spend');
        const link = within(careWorkersCashLoyaltyRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/cash-loyalty`);
        expect(
          within(careWorkersCashLoyaltyRow).getByText(
            `£${component.formatMonetaryValue(component.workplace.careWorkersCashLoyaltyForFirstTwoYears)}`,
          ),
        ).toBeTruthy();
      });
    });

    describe('statutory sick pay', () => {
      it('should show dash and have Add information button on statutory sick pay row when sickPay is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.sickPay = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const statutorySickPayRow = within(document.body).queryByTestId('offer-more-than-statutory-sick-pay');
        const link = within(statutorySickPayRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/benefits-statutory-sick-pay`);
        expect(within(statutorySickPayRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on statutory sick pay row when sickPay has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const statutorySickPayRow = within(document.body).queryByTestId('offer-more-than-statutory-sick-pay');
        const link = within(statutorySickPayRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/benefits-statutory-sick-pay`);
        expect(within(statutorySickPayRow).getByText(component.workplace.sickPay)).toBeTruthy();
      });
    });

    describe('higher pension contributions', () => {
      it('should show dash and have Add information button on higher pension contributions row when pensionContribution is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.pensionContribution = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const pensionContributionRow = within(document.body).queryByTestId('higher-pension-contributions');
        const link = within(pensionContributionRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/pensions`);
        expect(within(pensionContributionRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on higher pension contributions row when pensionContribution has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.pensionContribution = 'Yes';
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const pensionContributionRow = within(document.body).queryByTestId('higher-pension-contributions');
        const link = within(pensionContributionRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/pensions`);
        expect(within(pensionContributionRow).getByText(component.workplace.pensionContribution)).toBeTruthy();
      });
    });

    describe('number of days leave', () => {
      it('should show dash and have Add information button on number of days leave row when careWorkersLeaveDaysPerYear is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.careWorkersLeaveDaysPerYear = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const careWorkersLeaveDaysPerYearRow = within(document.body).queryByTestId('number-of-days-leave');
        const link = within(careWorkersLeaveDaysPerYearRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/staff-benefit-holiday-leave`);
        expect(within(careWorkersLeaveDaysPerYearRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on number of days leave row when careWorkersLeaveDaysPerYear has a value (answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const careWorkersLeaveDaysPerYearRow = within(document.body).queryByTestId('number-of-days-leave');
        const link = within(careWorkersLeaveDaysPerYearRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/staff-benefit-holiday-leave`);
        expect(
          within(careWorkersLeaveDaysPerYearRow).getByText(component.workplace.careWorkersLeaveDaysPerYear),
        ).toBeTruthy();
      });
    });
  });

  describe('Permissions section', () => {
    describe('Data sharing', () => {
      it('should show dash and have Add information button on Data sharing when cqc and localAuthorities set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        const link = within(dataSharing).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/sharing-data`);
        expect(within(dataSharing).queryByText('-')).toBeTruthy();
      });

      it('should show Local authorities and have Change button on Data sharing when localAuthorities set to true', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: true });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        const link = within(dataSharing).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/sharing-data`);
        expect(within(dataSharing).queryByText('Local authorities')).toBeTruthy();
      });

      it('should show CQC and have Change button on Data sharing when cqc set to true', async () => {
        const { component, fixture } = await setup({ cqc: true, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Care Quality Commission (CQC)')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when cqc and localAuthorities are set to false', async () => {
        const { component, fixture } = await setup({ cqc: false, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when cqc is set to false and localAuthorities is null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: false, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when localAuthorities is set to false and cqc is null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should not show Not sharing when one of cqc and localAuthorities is false and one is true', async () => {
        const { component, fixture } = await setup({ cqc: true, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeFalsy();
      });
    });
  });
});
