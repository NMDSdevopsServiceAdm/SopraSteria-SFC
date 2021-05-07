import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { WdfModule } from '@features/wdf/wdf.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { establishmentBuilder, workerBuilderWithWdf } from '../../../../../server/test/factories/models';
import { StaffRecordSummaryComponent } from './staff-record-summary.component';

const sinon = require('sinon');

describe('StaffRecordSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByText } = await render(StaffRecordSummaryComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },

        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
      ],
      componentProperties: {
        wdfView: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilderWithWdf(),
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  };

  it('should render a StaffRecordSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
    const { queryByText } = await setup();

    expect(queryByText('Is this still correct?')).toBeFalsy();
    expect(queryByText('Yes, it is')).toBeFalsy();
    expect(queryByText('No, change it')).toBeFalsy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);

    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is');
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });
});
