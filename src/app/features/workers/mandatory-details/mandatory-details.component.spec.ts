import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { EligibilityIconComponent } from '@shared/components/eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '@shared/components/inset-text/inset-text.component';
import { BasicRecordComponent } from '@shared/components/staff-record-summary/basic-record/basic-record.component';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { MandatoryDetailsComponent } from './mandatory-details.component';

describe('MandatoryDetailsComponent', () => {
  const sinon = require('sinon');
  const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      name: fake((f) => f.lorem.sentence()),
    },
  });

  const establishment = establishmentBuilder() as Establishment;

  const mockPermissionsService = sinon.createStubInstance(PermissionsService, {
    can: sinon.stub().returns(true),
  });

  let setup;
  beforeEach(async () => {
    setup = await render(MandatoryDetailsComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [
        InsetTextComponent,
        BasicRecordComponent,
        SummaryRecordValueComponent,
        EligibilityIconComponent,
        SummaryRecordChangeComponent,
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
          useValue: mockPermissionsService,
        },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              params: {
                establishmentuid: establishment.uid,
              },
            },
            parent: {
              snapshot: {
                data: {
                  establishment,
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
  });

  it('should create', async () => {
    const component = await setup;

    expect(component).toBeTruthy();
  });

  it('should render the progress bar', async () => {
    const { queryByTestId } = await setup;

    expect(queryByTestId('progress-bar-1')).toBeTruthy();
  });

  it('should show Worker information in summary list', async () => {
    const { getByTestId, fixture } = await setup;

    fixture.detectChanges();

    const container = within(getByTestId('summary'));
    const expectedWorker = fixture.componentInstance.worker;

    expect(container.getAllByText(expectedWorker.nameOrId));
    expect(container.getAllByText(expectedWorker.mainJob.title));
    expect(container.getAllByText(expectedWorker.contract));
  });

  it('should take you to the staff-details page when change link is clicked', async () => {
    const { fixture, getByText } = await setup;

    const worker = fixture.componentInstance.worker;
    const changeLink = getByText('Change');

    expect(changeLink.getAttribute('href')).toBe(
      `/workplace/${establishment.uid}/staff-record/${worker.uid}/staff-details`,
    );
  });

  it('should submit and move to next page when add details button clicked', async () => {
    const { getByTestId, fixture } = await setup;

    fixture.detectChanges();

    const submission = spyOn(fixture.componentInstance, 'onSubmit');
    const detailsButton = getByTestId('add-details-button');
    detailsButton.click();
    expect(submission).toHaveBeenCalled();
  });

  it('should take you to to dashboard', async () => {
    const { getByTestId, fixture } = await setup;

    fixture.detectChanges();

    const navDash = spyOn(fixture.componentInstance, 'navigateToDashboard');
    const allWorkersButton = getByTestId('view-all-workers-button');
    userEvent.click(allWorkersButton);
    expect(navDash).toHaveBeenCalled();
  });
});
