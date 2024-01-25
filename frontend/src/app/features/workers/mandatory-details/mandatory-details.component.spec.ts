import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { EligibilityIconComponent } from '@shared/components/eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '@shared/components/inset-text/inset-text.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { BasicRecordComponent } from '@shared/components/staff-record-summary/basic-record/basic-record.component';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { MandatoryDetailsComponent } from './mandatory-details.component';

describe('MandatoryDetailsComponent', () => {
  const setup = async (canEditWorker = true, primaryUid = 123) => {
    const permissions = canEditWorker ? ['canEditWorker'] : [];
    const { fixture, getByText, queryByText, getByTestId, queryByTestId } = await render(MandatoryDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [
        InsetTextComponent,
        BasicRecordComponent,
        SummaryRecordValueComponent,
        EligibilityIconComponent,
        SummaryRecordChangeComponent,
        ProgressBarComponent,
      ],
      providers: [
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  primaryWorkplace: { uid: primaryUid },
                  establishment: {
                    uid: 123,
                  },
                },
              },
            },
          },
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;
    const router = TestBed.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
      queryByTestId,
      routerSpy,
    };
  };

  it('should create', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the progress bar', async () => {
    const { queryByTestId } = await setup();

    expect(queryByTestId('progress-bar')).toBeTruthy();
  });

  it('should show Worker information in summary list', async () => {
    const { getByText, component } = await setup();

    const expectedWorker = component.worker;

    expect(getByText(expectedWorker.nameOrId));
    expect(getByText(expectedWorker.mainJob.title));
    expect(getByText(expectedWorker.contract));
  });

  it('should take you to the staff-details page when change link is clicked', async () => {
    const { component, getByText } = await setup();

    const worker = component.worker;
    const changeLink = getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${123}/staff-record/${worker.uid}/mandatory-details/staff-details`,
    );
  });

  it('should not show the change link if the user does not have edit permissions', async () => {
    const { queryByText } = await setup(false);

    expect(queryByText('Change')).toBeFalsy();
  });

  it('should submit and navigate to date of birth page when add details button clicked', async () => {
    const { getByTestId, component, routerSpy } = await setup();

    const submission = spyOn(component, 'onSubmit').and.callThrough();
    const detailsButton = getByTestId('add-details-button');
    detailsButton.click();
    expect(submission).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['', 'date-of-birth']);
  });

  it('should take you to to dashboard if adding a staff record to own establishment', async () => {
    const { getByTestId, component, routerSpy } = await setup();

    const navDash = spyOn(component, 'navigateToDashboard').and.callThrough();
    const allWorkersButton = getByTestId('view-all-workers-button');
    userEvent.click(allWorkersButton);
    expect(navDash).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
  });

  it('should take you to to the workplace home page if adding a staff record to subsidiary establishment', async () => {
    const { getByTestId, component, routerSpy } = await setup(true, 345);

    const navDash = spyOn(component, 'navigateToDashboard').and.callThrough();
    const allWorkersButton = getByTestId('view-all-workers-button');
    userEvent.click(allWorkersButton);
    expect(navDash).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/workplace', 123], { fragment: 'staff-records' });
  });
});
