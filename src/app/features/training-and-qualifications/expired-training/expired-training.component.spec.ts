import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { ExpiredTrainingComponent } from './expired-training.component';

describe('ExiredTrainingComponent', () => {
  async function setup(addPermissions = true) {
    const permissions = addPermissions ? ['canEditWorker'] : [];
    const { fixture, getByText, getByTestId } = await render(ExpiredTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        BackLinkService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                expiredTraining: {
                  training: [
                    {
                      uid: 'mock-uid-one',
                      expires: new Date('2020-01-01'),
                      categoryFk: 1,
                      category: { id: 1, category: 'Category name' },
                      worker: { id: 1, uid: 'worker-one-uid', NameOrIdValue: 'Worker One' },
                    },
                    {
                      uid: 'mock-uid-two',
                      expires: new Date('2021-05-01'),
                      categoryFk: 1,
                      category: { id: 3, category: 'Another category name' },
                      worker: { id: 3, uid: 'worker-two-uid', NameOrIdValue: 'Worker Two' },
                    },
                  ],
                },
              },
              params: { establishmentuid: '1234-5678' },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      routerSpy,
    };
  }

  it('should render a ExpiredTrainingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the table with a list of the expired training', async () => {
    const { getByTestId } = await setup();

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    expect(getByTestId('table')).toBeTruthy();
    expect(within(tableRow1).getByText('Worker One')).toBeTruthy();
    expect(within(tableRow1).getByText('Category name')).toBeTruthy();
    expect(within(tableRow1).getByText('1 Jan 2020')).toBeTruthy();
    expect(within(tableRow1).getByText('Expired')).toBeTruthy();
    expect(within(tableRow2).getByText('Worker Two')).toBeTruthy();
    expect(within(tableRow2).getByText('Another category name')).toBeTruthy();
    expect(within(tableRow2).getByText('1 May 2021')).toBeTruthy();
    expect(within(tableRow2).getByText('Expired')).toBeTruthy();
  });

  it('should render the name as a link with href to the worker when the are canEditWorker Permissions', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Worker One').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training`,
    );
    expect(getByText('Worker Two').getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-two-uid/training`,
    );
  });

  it('should not render the name as a link if there are not the correct permissions', async () => {
    const { getByTestId } = await setup(false);

    expect(getByTestId('worker-0-noLink')).toBeTruthy();
    expect(getByTestId('worker-1-noLink')).toBeTruthy();
  });

  it('should render an update link with href to the training when there are can edit permissions', async () => {
    const { component, getByTestId } = await setup();

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    const table1UpdateLink = within(tableRow1).getByText('Update');
    const table2UpdateLink = within(tableRow2).getByText('Update');

    expect(table1UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-one-uid/training/mock-uid-one`,
    );
    expect(table2UpdateLink.getAttribute('href')).toEqual(
      `/workplace/${component.workplaceUid}/training-and-qualifications-record/worker-two-uid/training/mock-uid-two`,
    );
  });

  it('should not render the update links if there are not the correct permissions', async () => {
    const { getByTestId } = await setup(false);

    const tableRow1 = getByTestId('table-row-0');
    const tableRow2 = getByTestId('table-row-1');

    expect(within(tableRow1).queryByText('Update')).toBeFalsy();
    expect(within(tableRow2).queryByText('Update')).toBeFalsy();
  });

  it('should navigate back to the dashboard when clicking the return to home button in a parent or stand alone account', async () => {
    const { getByText, component, fixture, routerSpy } = await setup();

    component.primaryWorkplaceUid = '1234-5678';
    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'training-and-qualifications' });
  });

  it('should navigate back to the workplace page when clicking the return to home button when accessing a sub account from a parent', async () => {
    const { getByText, fixture, routerSpy } = await setup();

    const button = getByText('Return to home');
    fireEvent.click(button);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', '1234-5678'], { fragment: 'training-and-qualifications' });
  });
});
