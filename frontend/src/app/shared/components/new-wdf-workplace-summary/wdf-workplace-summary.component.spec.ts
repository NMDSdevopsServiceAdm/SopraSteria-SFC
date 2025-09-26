import { provideHttpClient } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { MockCareWorkforcePathwayService, MockCWPUseReasons } from '@core/test-utils/MockCareWorkforcePathwayService';
import { MockCqcStatusChangeService } from '@core/test-utils/MockCqcStatusChangeService';
import {
  establishmentWithShareWith,
  establishmentWithWdfBuilder,
  MockEstablishmentService,
} from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { FundingModule } from '@features/funding/funding.module';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { WdfStaffMismatchMessageComponent } from '../wdf-staff-mismatch-message/wdf-staff-mismatch-message.component';
import { WDFWorkplaceSummaryComponent } from './wdf-workplace-summary.component';
import { mockDHAs } from '@core/test-utils/MockDelegatedHealthcareActivitiesService';

describe('WDFWorkplaceSummaryComponent', () => {
  const setup = async (overrides: any = {}) => {
    const careWorkforcePathwayWorkplaceAwareness = overrides?.careWorkforcePathwayWorkplaceAwareness ?? null;
    const careWorkforcePathwayUse = overrides?.careWorkforcePathwayUse ?? null;

    const workplace = establishmentWithWdfBuilder({
      careWorkforcePathwayWorkplaceAwareness,
      careWorkforcePathwayUse,
      ...overrides.establishment,
    }) as Establishment;

    const setupTools = await render(WDFWorkplaceSummaryComponent, {
      imports: [SharedModule, RouterModule, FundingModule],
      declarations: [WdfStaffMismatchMessageComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides?.permissions ?? ['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: CqcStatusChangeService,
          useClass: MockCqcStatusChangeService,
        },
        {
          provide: VacanciesAndTurnoverService,
          useClass: MockVacanciesAndTurnoverService,
        },
        {
          provide: CareWorkforcePathwayService,
          useFactory: MockCareWorkforcePathwayService.factory({
            isAwareOfCareWorkforcePathway: () => overrides?.workplaceIsAwareOfCareWorkforcePathway ?? true,
          }),
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { params: { establishmentuid: 'mock-uid' }, data: {} } },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      componentProperties: {
        wdfView: true,
        workplace,
        removeServiceSectionMargin: false,
        workerCount: workplace.numberOfStaff,
        ...overrides,
      },
    });

    const component = setupTools.fixture.componentInstance;

    const vacanciesAndTurnoverService = TestBed.inject(VacanciesAndTurnoverService);
    const clearAllSelectedJobRolesSpy = spyOn(vacanciesAndTurnoverService, 'clearAllSelectedJobRoles');

    return { ...setupTools, component, clearAllSelectedJobRolesSpy };
  };

  it('should render a WorkplaceSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render a heading', async () => {
    const { getByText } = await setup();

    expect(getByText('Your workplace details')).toBeTruthy();
  });

  it('should render all the sections', async () => {
    const { component, fixture, getByTestId } = await setup();

    component.workplace.isRegulated = true;
    fixture.detectChanges();

    expect(getByTestId('workplace-section')).toBeTruthy();
    expect(getByTestId('address-section')).toBeTruthy();
    expect(getByTestId('cqcLocationId')).toBeTruthy();
    expect(getByTestId('numberOfStaff')).toBeTruthy();
    expect(getByTestId('employerType')).toBeTruthy();
    expect(getByTestId('services-section')).toBeTruthy();
    expect(getByTestId('vacancies-and-turnover-section')).toBeTruthy();
    expect(getByTestId('recruitment-and-benefits-section')).toBeTruthy();
    expect(getByTestId('permissions-section')).toBeTruthy();
  });

  it('should render the services section with top margin when removeServiceSectionMargin is false, and without margin when true', async () => {
    const { rerender, getByText } = await setup();

    const serviceHeading = getByText('Services');
    expect(serviceHeading.getAttribute('class')).toContain('govuk-!-margin-top-5');

    rerender({ componentProperties: { removeServiceSectionMargin: true } });
    expect(serviceHeading.getAttribute('class')).not.toContain('govuk-!-margin-top-5');
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

        expect(getByText('Name')).toBeTruthy();
        expect(getByText('Address')).toBeTruthy();
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

        component.workplace.locationId = '1-23452354';

        fixture.detectChanges();

        const cqcLocationIdRow = within(document.body).queryByTestId('cqcLocationId');
        const link = within(cqcLocationIdRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/regulated-by-cqc`);
        expect(within(cqcLocationIdRow).queryByText(component.workplace.locationId)).toBeTruthy();
      });

      it('should render not the locationID if the workplace is not regulated', async () => {
        const { queryByTestId } = await setup();

        expect(queryByTestId('cqcLocationId')).toBeFalsy();
      });
    });

    describe('Number of staff', () => {
      it('should render the number of staff and a Change link with a bottom border', async () => {
        const { component, fixture } = await setup();

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

      it('should render the number of staff row without bottom border when staff mismatch message is shown', async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace.numberOfStaff = 9;

        const { queryByTestId } = await setup({ workplace, workerCount: 10 });

        const numberOfStaffRow = queryByTestId('numberOfStaff');

        expect(numberOfStaffRow.getAttribute('class')).toContain('govuk-summary-list__row--no-bottom-border');
      });
    });

    describe('Number of staff warning', () => {
      it('should show banner if you have more staff records', async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace.numberOfStaff = 9;

        const { queryByTestId } = await setup({ workplace, workerCount: 10 });

        const staffMismatchMessage = queryByTestId('staffMismatchMessage');
        expect(staffMismatchMessage).toBeTruthy();
      });

      it('should show banner if you have more total staff', async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace.numberOfStaff = 9;

        const { queryByTestId } = await setup({ workplace, workerCount: 8 });

        const staffMismatchMessage = queryByTestId('staffMismatchMessage');
        expect(staffMismatchMessage).toBeTruthy();
      });

      it('should show banner if you have more staff records and 0 staff', async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace.numberOfStaff = 0;

        const { queryByTestId } = await setup({ workplace, workerCount: 10 });

        const staffMismatchMessage = queryByTestId('staffMismatchMessage');
        expect(staffMismatchMessage).toBeTruthy();
      });
    });

    describe('Employer type', () => {
      it('should render the employer type and a Change link when employer type is the other field in object', async () => {
        const { component, fixture } = await setup();

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
    describe('Main service', () => {
      it('should show Pending on main service when non-CQC to CQC main service change has been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = true;

        fixture.detectChanges();

        const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
        expect(mainServiceChangeOrPending.innerHTML).toContain('Pending');
      });

      it('should show Change on main service when non-CQC to CQC main service change has NOT been requested', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = false;

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
        const { component } = await setup();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const link = within(mainServiceRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/main-service-cqc`);
      });

      it('should show the Provide information link when there is not a main service', async () => {
        const { component, fixture } = await setup();

        component.workplace.mainService = null;

        fixture.detectChanges();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const link = within(mainServiceRow).queryByText('Provide information');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/main-service-cqc`);
      });

      it('should show the Pending link when the cqcStatusRequested is true', async () => {
        const { component, fixture } = await setup();

        component.cqcStatusRequested = true;

        fixture.detectChanges();

        const mainServiceRow = within(document.body).queryByTestId('mainService');
        const text = within(mainServiceRow).queryByText('Pending');

        expect(text).toBeTruthy();
      });
    });

    describe('Other services', () => {
      it('should show dash and have Add information button on when otherServices value is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.otherServices = { value: null };

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

        fixture.detectChanges();

        const serviceUsersRow = within(document.body).queryByTestId('serviceUsers');
        const link = within(serviceUsersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/service-users`);
        expect(within(serviceUsersRow).queryByText('Service for group 1')).toBeTruthy();
        expect(within(serviceUsersRow).queryByText('Service for group 2')).toBeTruthy();
      });
    });

    describe('Carry out delegated healthcare activities', () => {
      const workplaceWhichCanDoDHA = {
        mainService: {
          canDoDelegatedHealthcareActivities: true,
          id: 9,
          name: 'Day care and day services',
          reportingID: 6,
        },
      };

      it('should show dash and have Add information button when is set to null (not answered)', async () => {
        const { component, queryByTestId } = await setup({
          establishment: { ...workplaceWhichCanDoDHA, staffDoDelegatedHealthcareActivities: null },
          canEditEstablishment: true,
        });

        const staffDoDelegatedHealthcareActivitiesRow = queryByTestId('carryOutDelegatedHealthcareActivities');
        const link = within(staffDoDelegatedHealthcareActivitiesRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/staff-do-delegated-healthcare-activities`,
        );
        expect(within(staffDoDelegatedHealthcareActivitiesRow).queryByText('-')).toBeTruthy();
      });

      const summaryAnswers = ['Yes', 'No', 'Not known'];
      const databaseValues = ['Yes', 'No', "Don't know"];

      for (let i = 0; i < summaryAnswers.length; i++) {
        it(`should show Change button and '${summaryAnswers[i]}' when there is '${databaseValues[i]}' value in database`, async () => {
          const { component, queryByTestId } = await setup({
            establishment: { ...workplaceWhichCanDoDHA, staffDoDelegatedHealthcareActivities: databaseValues[i] },
            canEditEstablishment: true,
          });

          const staffDoDelegatedHealthcareActivitiesRow = queryByTestId('carryOutDelegatedHealthcareActivities');
          const link = within(staffDoDelegatedHealthcareActivitiesRow).queryByText('Change');

          expect(link).toBeTruthy();
          expect(link.getAttribute('href')).toEqual(
            `/workplace/${component.workplace.uid}/staff-do-delegated-healthcare-activities`,
          );
          expect(within(staffDoDelegatedHealthcareActivitiesRow).queryByText(summaryAnswers[i])).toBeTruthy();
        });
      }

      it('should not display row when main service cannot do DHA', async () => {
        const { queryByTestId } = await setup({
          establishment: {
            mainService: {
              canDoDelegatedHealthcareActivities: null,
              id: 11,
              name: 'Domestic services and home help',
              reportingID: 10,
            },
          },
          canEditEstablishment: true,
        });

        const staffDoDelegatedHealthcareActivitiesRow = queryByTestId('carryOutDelegatedHealthcareActivities');

        expect(staffDoDelegatedHealthcareActivitiesRow).toBeFalsy();
      });
    });

    describe('Know what delegated healthcare activities', () => {
      it('should show the row and table cell name', async () => {
        const { getByTestId } = await setup({
          establishment: {
            mainService: { canDoDelegatedHealthcareActivities: true },
            staffDoDelegatedHealthcareActivities: 'Yes',
          },
          permissions: ['canEditEstablishment'],
        });

        const knowWhatDelegatedHealthcareActivitiesRow = getByTestId('know-what-delegated-healthcare-activities');
        const cellName = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText(
          'Which delegated healthcare activities',
        );

        expect(knowWhatDelegatedHealthcareActivitiesRow).toBeTruthy();
        expect(cellName).toBeTruthy();
      });

      describe('mainService canDoDelegatedHealthcareActivities is not true', () => {
        [false, null].forEach((value) => {
          it(`should not show if canDoDelegatedHealthcareActivities is ${value} and staffDoDelegatedHealthcareActivities is "Yes"`, async () => {
            const { queryByTestId } = await setup({
              establishment: {
                mainService: { canDoDelegatedHealthcareActivities: value },
                staffDoDelegatedHealthcareActivities: 'Yes',
              },
              permissions: ['canEditEstablishment'],
            });

            const knowWhatDelegatedHealthcareActivitiesRow = queryByTestId('know-what-delegated-healthcare-activities');

            expect(knowWhatDelegatedHealthcareActivitiesRow).toBeFalsy();
          });
        });
      });

      describe('mainService canDoDelegatedHealthcareActivities is true', () => {
        describe('staffDoDelegatedHealthcareActivities is not "Yes"', () => {
          ['No', "Don't know"].forEach((answer) => {
            it(`should not show row when staffDoDelegatedHealthcareActivities is ${answer}`, async () => {
              const { queryByTestId } = await setup({
                establishment: {
                  mainService: { canDoDelegatedHealthcareActivities: true },
                  staffDoDelegatedHealthcareActivities: answer,
                },
                permissions: ['canEditEstablishment'],
              });

              const knowWhatDelegatedHealthcareActivitiesRow = queryByTestId(
                'know-what-delegated-healthcare-activities',
              );

              expect(knowWhatDelegatedHealthcareActivitiesRow).toBeFalsy();
            });
          });
        });

        describe('staffDoDelegatedHealthcareActivities is "Yes"', () => {
          it('should show "Not known" and a change link when Don`t know is answered', async () => {
            const { component, getByTestId } = await setup({
              establishment: {
                mainService: { canDoDelegatedHealthcareActivities: true },
                staffDoDelegatedHealthcareActivities: 'Yes',
                staffWhatKindDelegatedHealthcareActivities: {
                  knowWhatActivities: "Don't know",
                  activities: null,
                },
              },
              permissions: ['canEditEstablishment'],
            });

            const knowWhatDelegatedHealthcareActivitiesRow = getByTestId('know-what-delegated-healthcare-activities');
            const link = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('Change');
            const answer = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('Not known');

            expect(answer).toBeTruthy();
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toEqual(
              `/workplace/${component.workplace.uid}/what-kind-of-delegated-healthcare-activities`,
            );
            expect(knowWhatDelegatedHealthcareActivitiesRow).toBeTruthy();
          });

          it('should show a list of activities and a change link"', async () => {
            const { component, getByTestId } = await setup({
              establishment: {
                mainService: { canDoDelegatedHealthcareActivities: true },
                staffDoDelegatedHealthcareActivities: 'Yes',
                staffWhatKindDelegatedHealthcareActivities: {
                  knowWhatActivities: 'Yes',
                  activities: mockDHAs,
                },
              },
              permissions: ['canEditEstablishment'],
            });

            const knowWhatDelegatedHealthcareActivitiesRow = getByTestId('know-what-delegated-healthcare-activities');

            const link = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('Change');

            mockDHAs.forEach((answer) => {
              expect(within(knowWhatDelegatedHealthcareActivitiesRow).queryByText(answer.title)).toBeTruthy();
            });
            expect(link).toBeTruthy();
            expect(link.getAttribute('href')).toEqual(
              `/workplace/${component.workplace.uid}/what-kind-of-delegated-healthcare-activities`,
            );
            expect(knowWhatDelegatedHealthcareActivitiesRow).toBeTruthy();
          });

          describe('no answer', () => {
            it('should show "-" and an add link when staffWhatKindDelegatedHealthcareActivities is null', async () => {
              const { component, getByTestId } = await setup({
                establishment: {
                  mainService: { canDoDelegatedHealthcareActivities: true },
                  staffDoDelegatedHealthcareActivities: 'Yes',
                  staffWhatKindDelegatedHealthcareActivities: null,
                },
                permissions: ['canEditEstablishment'],
              });

              const knowWhatDelegatedHealthcareActivitiesRow = getByTestId('know-what-delegated-healthcare-activities');
              const link = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('Add');
              const answer = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('-');

              expect(answer).toBeTruthy();
              expect(link).toBeTruthy();
              expect(link.getAttribute('href')).toEqual(
                `/workplace/${component.workplace.uid}/what-kind-of-delegated-healthcare-activities`,
              );

              expect(knowWhatDelegatedHealthcareActivitiesRow).toBeTruthy();
            });
          });

          it('should not show a link when canEditEstablishment is false', async () => {
            const { getByTestId } = await setup({
              establishment: {
                mainService: { canDoDelegatedHealthcareActivities: true },
                staffDoDelegatedHealthcareActivities: 'Yes',
                staffWhatKindDelegatedHealthcareActivities: {
                  knowWhatActivities: 'Yes',
                  activities: mockDHAs,
                },
              },
              permissions: [],
            });

            const knowWhatDelegatedHealthcareActivitiesRow = getByTestId('know-what-delegated-healthcare-activities');
            const link = within(knowWhatDelegatedHealthcareActivitiesRow).queryByText('Change');

            expect(link).toBeFalsy();
            expect(knowWhatDelegatedHealthcareActivitiesRow).toBeTruthy();
          });
        });
      });
    });
  });

  describe('Vacancies and turnover section', () => {
    describe('Current staff vacancies', () => {
      it('should show dash and have Add information button on when starters is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = null;

        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-vacancies`);
        expect(within(vacanciesRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Not known and a Change link when vacancies is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = 'Not known';

        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-vacancies`);
        expect(within(vacanciesRow).queryByText('Not known')).toBeTruthy();
      });

      it(`should show None and a Change link when vacancies is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = `None`;

        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-vacancies`);
        expect(within(vacanciesRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job vacancy with number of vacancies and a Change link when one job has vacancies`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = [{ jobId: 1, title: 'Administrative', total: 3 }];

        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-vacancies`);
        expect(within(vacanciesRow).queryByText(`3 x administrative`)).toBeTruthy();
      });

      it(`should show multiple job vacancies with the number of vacancies for each job and a Change link when multiple jobs have vacancies`, async () => {
        const { component, fixture } = await setup();

        component.workplace.vacancies = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
          { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
        ];

        fixture.detectChanges();

        const vacanciesRow = within(document.body).queryByTestId('vacancies');

        expect(within(vacanciesRow).queryByText('Change')).toBeTruthy();
        expect(within(vacanciesRow).queryByText(`3 x administrative`)).toBeTruthy();
        expect(within(vacanciesRow).queryByText('2 x nursing')).toBeTruthy();
        expect(within(vacanciesRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
      });

      it('should clear selected job roles on navigation to update vacancies page', async () => {
        const { getByTestId, clearAllSelectedJobRolesSpy } = await setup();

        const vacanciesRow = getByTestId('vacancies');
        const link = within(vacanciesRow).queryByText('Add');

        fireEvent.click(link);
        expect(clearAllSelectedJobRolesSpy).toHaveBeenCalled();
      });
    });

    describe('New starters', () => {
      it('should show the correct wording', async () => {
        const { getByTestId } = await setup();

        const startersRow = getByTestId('starters');

        expect(within(startersRow).getByText('Starters in the last 12 months')).toBeTruthy();
      });

      it('should show dash and have Add information button on when starters is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = null;

        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-starters`);
        expect(within(startersRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Not known and a Change link when starters is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = 'Not known';

        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-starters`);
        expect(within(startersRow).queryByText('Not known')).toBeTruthy();
      });

      it(`should show None and a Change link when starters is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = `None`;

        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-starters`);
        expect(within(startersRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job with number of starters and a Change link when there is one job with starters`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = [{ jobId: 1, title: 'Administrative', total: 3 }];

        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');
        const link = within(startersRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-starters`);
        expect(within(startersRow).queryByText(`3 x administrative`)).toBeTruthy();
      });

      it(`should show multiple jobs with the number of starters for each job and a Change link when multiple jobs have starters`, async () => {
        const { component, fixture } = await setup();

        component.workplace.starters = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
          { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
        ];

        fixture.detectChanges();

        const startersRow = within(document.body).queryByTestId('starters');

        expect(within(startersRow).queryByText('Change')).toBeTruthy();
        expect(within(startersRow).queryByText(`3 x administrative`)).toBeTruthy();
        expect(within(startersRow).queryByText('2 x nursing')).toBeTruthy();
        expect(within(startersRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
      });

      it('should clear selected job roles on navigation to update starters page', async () => {
        const { getByTestId, clearAllSelectedJobRolesSpy } = await setup();

        const startersRow = getByTestId('starters');
        const link = within(startersRow).queryByText('Add');

        fireEvent.click(link);
        expect(clearAllSelectedJobRolesSpy).toHaveBeenCalled();
      });
    });

    describe('Staff leavers', () => {
      it('should show the correct wording', async () => {
        const { getByTestId } = await setup();

        const leaversRow = getByTestId('leavers');

        expect(within(leaversRow).getByText('Leavers in the last 12 months')).toBeTruthy();
      });

      it('should show dash and have Add information button on when leavers is null', async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = null;

        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-leavers`);
        expect(within(leaversRow).queryByText('-')).toBeTruthy();
      });

      it(`should show Not known and a Change link when leavers is set to Don't know`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = 'Not known';

        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-leavers`);
        expect(within(leaversRow).queryByText('Not known')).toBeTruthy();
      });

      it(`should show None and a Change link when leavers is set to None`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = `None`;

        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-leavers`);
        expect(within(leaversRow).queryByText(`None`)).toBeTruthy();
      });

      it(`should show one job with number of leavers and a Change link when there is one job with leavers`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = [{ jobId: 1, title: 'Administrative', total: 3 }];
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');
        const link = within(leaversRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/update-leavers`);
        expect(within(leaversRow).queryByText(`3 x administrative`)).toBeTruthy();
      });

      it(`should show multiple jobs with the number of leavers for each job and a Change link when multiple jobs have leavers`, async () => {
        const { component, fixture } = await setup();

        component.workplace.leavers = [
          { jobId: 1, title: 'Administrative', total: 3 },
          { jobId: 2, title: 'Nursing', total: 2 },
          { jobId: 3, title: 'Other care providing role', total: 4, other: 'Special care worker' },
        ];
        fixture.detectChanges();

        const leaversRow = within(document.body).queryByTestId('leavers');

        expect(within(leaversRow).queryByText('Change')).toBeTruthy();
        expect(within(leaversRow).queryByText(`3 x administrative`)).toBeTruthy();
        expect(within(leaversRow).queryByText('2 x nursing')).toBeTruthy();
        expect(within(leaversRow).queryByText('4 x other care providing role: special care worker')).toBeTruthy();
      });
    });

    it('should clear selected job roles on navigation to update leavers page', async () => {
      const { getByTestId, clearAllSelectedJobRolesSpy } = await setup();

      const leaversRow = getByTestId('leavers');
      const link = within(leaversRow).queryByText('Add');

      fireEvent.click(link);
      expect(clearAllSelectedJobRolesSpy).toHaveBeenCalled();
    });
  });

  describe('Recruitment and benefits section', () => {
    describe('Repeat training', () => {
      it('should show dash and have Add information button on  Repeat Training row when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = null;
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
        const { component } = await setup();

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
        const { component } = await setup();

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

    describe('Care workforce pathway aware', () => {
      it('should show dash and have Add information button when is set to null (not answered)', async () => {
        const overrides = { careWorkforcePathwayWorkplaceAwareness: null, canEditEstablishment: true };

        const { component } = await setup(overrides);

        const careWorkforcePathwayAwarenessRow = within(document.body).queryByTestId(
          'care-workforce-pathway-awareness',
        );
        const link = within(careWorkforcePathwayAwarenessRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/care-workforce-pathway-awareness`,
        );
        expect(within(careWorkforcePathwayAwarenessRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button when there is a value (answered)', async () => {
        const overrides = {
          careWorkforcePathwayWorkplaceAwareness: {
            id: 4,
            title: 'Not aware of the care workforce pathway',
          },
          canEditEstablishment: true,
        };
        const { component } = await setup(overrides);

        const careWorkforcePathwayAwarenessRow = within(document.body).queryByTestId(
          'care-workforce-pathway-awareness',
        );
        const link = within(careWorkforcePathwayAwarenessRow).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${component.workplace.uid}/care-workforce-pathway-awareness`,
        );
        expect(within(careWorkforcePathwayAwarenessRow).getByText('Not aware')).toBeTruthy();
      });
    });

    describe('Using the care workforce pathway', () => {
      it('should show a row of "Using the care workforce pathway" if workplace is aware of CWP', async () => {
        const { queryByTestId } = await setup({ workplaceIsAwareOfCareWorkforcePathway: true });
        const cwpUseRow = queryByTestId('care-workforce-pathway-use');
        expect(within(cwpUseRow).queryByText('Using the care workforce pathway')).toBeTruthy();
      });

      it('should not show a row of "Using the care workforce pathway" if workplace is not aware of CWP', async () => {
        const { queryByTestId } = await setup({ workplaceIsAwareOfCareWorkforcePathway: false });
        const cwpUseRow = queryByTestId('care-workforce-pathway-use');
        expect(cwpUseRow).toBeFalsy();
      });

      it('should show a dash "-" and "Add" button if not yet answered the CWP use question', async () => {
        const careWorkforcePathwayUse = null;
        const { component, getByTestId } = await setup({ careWorkforcePathwayUse });

        const cwpUseRow = getByTestId('care-workforce-pathway-use');
        const link = within(cwpUseRow).getByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/care-workforce-pathway-use`);
        expect(within(cwpUseRow).getByText('-')).toBeTruthy();
      });

      it('should show the answer and "Change" button if already answered the CWP use question', async () => {
        const careWorkforcePathwayUse = { use: "Don't know", reasons: null };
        const { component, getByTestId } = await setup({ careWorkforcePathwayUse });

        const cwpUseRow = getByTestId('care-workforce-pathway-use');
        const link = within(cwpUseRow).getByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/care-workforce-pathway-use`);
        expect(within(cwpUseRow).getByText('Not known')).toBeTruthy();
      });

      it('should show a list of the reasons if user answered "Yes" and chose some reasons', async () => {
        const mockReasons = [
          MockCWPUseReasons[0],
          MockCWPUseReasons[1],
          { ...MockCWPUseReasons[2], other: 'some free text' },
        ];
        const careWorkforcePathwayUse = { use: 'Yes', reasons: mockReasons };

        const { component, getByTestId } = await setup({ careWorkforcePathwayUse });

        const cwpUseRow = getByTestId('care-workforce-pathway-use');
        const link = within(cwpUseRow).getByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/care-workforce-pathway-use`);
        expect(within(cwpUseRow).getByText(MockCWPUseReasons[0].text)).toBeTruthy();
        expect(within(cwpUseRow).getByText(MockCWPUseReasons[1].text)).toBeTruthy();
        expect(within(cwpUseRow).getByText('some free text')).toBeTruthy();
      });
    });

    describe('Cash loyalty bonus', () => {
      it('should show dash and have Add information button on Cash loyalty bonus row when careWorkersCashLoyaltyForFirstTwoYears is set to null (not answered)', async () => {
        const { component, fixture } = await setup();

        component.workplace.careWorkersCashLoyaltyForFirstTwoYears = null;
        fixture.detectChanges();

        const careWorkersCashLoyaltyRow = within(document.body).queryByTestId('cash-loyalty-bonus-spend');
        const link = within(careWorkersCashLoyaltyRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/cash-loyalty`);
        expect(within(careWorkersCashLoyaltyRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on Cash loyalty bonus row when careWorkersCashLoyaltyForFirstTwoYears has a value (answered)', async () => {
        const { component } = await setup();

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
        fixture.detectChanges();

        const statutorySickPayRow = within(document.body).queryByTestId('offer-more-than-statutory-sick-pay');
        const link = within(statutorySickPayRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/benefits-statutory-sick-pay`);
        expect(within(statutorySickPayRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on statutory sick pay row when sickPay has a value (answered)', async () => {
        const { component } = await setup();

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
        fixture.detectChanges();

        const careWorkersLeaveDaysPerYearRow = within(document.body).queryByTestId('number-of-days-leave');
        const link = within(careWorkersLeaveDaysPerYearRow).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/staff-benefit-holiday-leave`);
        expect(within(careWorkersLeaveDaysPerYearRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on number of days leave row when careWorkersLeaveDaysPerYear has a value (answered)', async () => {
        const { component, fixture } = await setup();

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
        const { component } = await setup();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        const link = within(dataSharing).queryByText('Add');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/sharing-data`);
        expect(within(dataSharing).queryByText('-')).toBeTruthy();
      });

      it('should show Local authorities and have Change button on Data sharing when localAuthorities set to true', async () => {
        const workplace = establishmentWithShareWith({ cqc: null, localAuthorities: true });
        const { component } = await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        const link = within(dataSharing).queryByText('Change');

        expect(link).toBeTruthy();
        expect(link.getAttribute('href')).toEqual(`/workplace/${component.workplace.uid}/sharing-data`);
        expect(within(dataSharing).queryByText('Local authorities')).toBeTruthy();
      });

      it('should show CQC and have Change button on Data sharing when cqc set to true', async () => {
        const workplace = establishmentWithShareWith({ cqc: true, localAuthorities: false });
        await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Care Quality Commission (CQC)')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when cqc and localAuthorities are set to false', async () => {
        const workplace = establishmentWithShareWith({ cqc: false, localAuthorities: false });
        await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when cqc is set to false and localAuthorities is null (not answered)', async () => {
        const workplace = establishmentWithShareWith({ cqc: false, localAuthorities: null });
        await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should show Not sharing and have Change button on Data sharing when localAuthorities is set to false and cqc is null (not answered)', async () => {
        const workplace = establishmentWithShareWith({ cqc: null, localAuthorities: false });
        await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeTruthy();
      });

      it('should not show Not sharing when one of cqc and localAuthorities is false and one is true', async () => {
        const workplace = establishmentWithShareWith({ cqc: true, localAuthorities: false });
        await setup({ workplace });

        const dataSharing = within(document.body).queryByTestId('data-sharing');

        expect(within(dataSharing).queryByText('Change')).toBeTruthy();
        expect(within(dataSharing).queryByText('Not sharing')).toBeFalsy();
      });
    });
  });

  describe('WdfFieldConfirmation', () => {
    [
      {
        fieldName: 'vacancies',
        shouldClearJobRoles: true,
        expectedPath: 'update-vacancies',
        value: [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ],
      },
      {
        fieldName: 'starters',
        shouldClearJobRoles: true,
        expectedPath: 'update-starters',
        value: [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ],
      },
      {
        fieldName: 'leavers',
        shouldClearJobRoles: true,
        expectedPath: 'update-leavers',
        value: [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ],
      },
      {
        fieldName: 'mainService',
        expectedPath: 'main-service-cqc',
        value: { name: 'Care Giving' },
      },
      {
        fieldName: 'capacities',
        expectedPath: 'capacity-of-services',
        value: [{ message: '4 beds' }],
      },
      {
        fieldName: 'serviceUsers',
        expectedPath: 'service-users',
        value: [{ service: 'Care Giving' }],
      },
      {
        fieldName: 'numberOfStaff',
        expectedPath: 'total-staff',
        value: 3,
      },
    ].forEach((field) => {
      const establishmentWithWdfFieldEligibleButNotUpdatedSinceEffective = (field) => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace.wdf[field.fieldName].isEligible = Eligibility.YES;
        workplace.wdf[field.fieldName].updatedSinceEffectiveDate = false;
        workplace[field.fieldName] = field.value;

        return workplace;
      };

      it(`should show WdfFieldConfirmation when is eligible but needs to be confirmed for ${field.fieldName}`, async () => {
        const workplace = establishmentWithWdfFieldEligibleButNotUpdatedSinceEffective(field);

        const { getByText } = await setup({ workplace });

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
      });

      it(`should have No, change it link when is eligible but needs to be confirmed for ${field.fieldName}`, async () => {
        const workplace = establishmentWithWdfFieldEligibleButNotUpdatedSinceEffective(field);

        const { getByText } = await setup({ workplace });

        const noChangeItLink = getByText('No, change it');
        expect(noChangeItLink.getAttribute('href')).toEqual(`/workplace/${workplace.uid}/${field.expectedPath}`);
      });

      it(`should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for ${field.fieldName}`, async () => {
        const workplace = establishmentWithWdfFieldEligibleButNotUpdatedSinceEffective(field);

        const { fixture, getByText } = await setup({ workplace });

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });

      if (field.shouldClearJobRoles) {
        it('should clear selected job roles on click of No, change it', async () => {
          const workplace = establishmentWithWdfFieldEligibleButNotUpdatedSinceEffective(field);

          const { getByText, clearAllSelectedJobRolesSpy } = await setup({ workplace });

          const changeLink = getByText('No, change it');
          fireEvent.click(changeLink);

          expect(clearAllSelectedJobRolesSpy).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Add information messages', () => {
    [
      {
        name: 'employerType',
        validResponse: { value: 'Care Home' },
      },
      {
        name: 'capacities',
        validResponse: [{ message: '10 beds used (care home)' }],
        specificMessage: 'Add the capacity of your main service',
      },
      {
        name: 'serviceUsers',
        validResponse: [{ group: 'Adults', id: 10, service: 'Adults with dementia' }],
      },
      {
        name: 'vacancies',
        validResponse: [{ jobId: 13, title: 'First-line manager', total: 1 }],
      },
      {
        name: 'starters',
        validResponse: [{ jobId: 13, title: 'First-line manager', total: 1 }],
      },
      {
        name: 'leavers',
        validResponse: [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ],
      },
      {
        name: 'numberOfStaff',
        validResponse: 3,
      },
      {
        name: 'mainService',
        validResponse: { name: 'Care Giving' },
      },
    ].forEach((field) => {
      const expectedWarningMessage = field.specificMessage ?? 'Add this information';

      it(`should show '${expectedWarningMessage}' message and red flag when workplace is not eligible and needs to add ${field.name}`, async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace[field.name] = null;
        workplace.wdf[field.name].isEligible = Eligibility.NO;

        const { getByTestId } = await setup({ workplace });

        const wdfWarningSection = getByTestId(field.name + 'WdfWarning');

        expect(within(wdfWarningSection).getByText(expectedWarningMessage)).toBeTruthy();
        expect(within(wdfWarningSection).getByAltText('Red flag icon')).toBeTruthy();
      });

      it(`should not show '${expectedWarningMessage}' message when workplace is not eligible but has added ${field.name}`, async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace[field.name] = field.validResponse;
        workplace.wdf[field.name].isEligible = Eligibility.YES;

        const { queryByTestId } = await setup({ workplace });

        const wdfWarningSection = queryByTestId(field.name + 'WdfWarning');

        expect(wdfWarningSection).toBeFalsy();
      });

      it(`should show '${expectedWarningMessage}' and orange flag when workplace does not have ${field.name} added but workplace has met WDF eligibility`, async () => {
        const workplace = establishmentWithWdfBuilder() as Establishment;
        workplace[field.name] = null;
        workplace.wdf[field.name].isEligible = Eligibility.NO;

        const { getByTestId } = await setup({ workplace, overallWdfEligibility: true });

        const wdfWarningSection = getByTestId(field.name + 'WdfWarning');

        expect(within(wdfWarningSection).queryByText(expectedWarningMessage)).toBeTruthy();
        expect(within(wdfWarningSection).getByAltText('Orange flag icon')).toBeTruthy();
      });
    });
  });
});
