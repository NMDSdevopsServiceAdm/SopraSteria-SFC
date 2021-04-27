import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { workers } from 'node:cluster';

import { establishmentBuilder, workerBuilder } from '../../../../../server/test/factories/models.js';
import { WdfStaffSummaryComponent } from './wdf-staff-summary.component';

describe('WdfStaffSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByText } = await render(WdfStaffSummaryComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule, BrowserModule, SharedModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canViewWorker']),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers: [workerBuilder(), workerBuilder(), workerBuilder()],
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getAllByText, getByTestId, queryByText };
  };

  it('should render a WdfStaffSummaryComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  // it('should display an orange flag on staff record when the user has qualified for WDF but 1 staff record is no longer eligible', async () => {
  //   const { component, fixture, getByText } = await setup();
  //   const orangeFlagVisuallyHiddenMessage = 'Orange warning flag';

  //   // component.workplaceWdfEligibility = true;
  //   // component.staffWdfEligibility = false;
  //   // fixture.detectChanges();

  //   expect(getByText(orangeFlagVisuallyHiddenMessage, { exact: false })).toBeTruthy();
  // });
});
