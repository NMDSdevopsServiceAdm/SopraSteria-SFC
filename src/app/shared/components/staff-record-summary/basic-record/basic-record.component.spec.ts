import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { SummaryRecordChangeComponent } from '@shared/components/summary-record-change/summary-record-change.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder, workerBuilderWithWdf } from '../../../../../../server/test/factories/models';
import { BasicRecordComponent } from './basic-record.component';

describe('BasicRecordComponent', () => {
  async function setup(mandatoryDetailsPage = false) {
    const { fixture, getByText } = await render(BasicRecordComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [SummaryRecordChangeComponent],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        canEditWorker: true,
        mandatoryDetailsPage,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilderWithWdf(),
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a BasicRecordComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the change link with the staff-record-summary/staff-details url when not on the mandatory details page', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Change').getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/staff-record-summary/staff-details`,
    );
  });

  it('should render the change link with the mandatory-details/staff-details url when on the mandatory details page', async () => {
    const { component, getByText } = await setup(true);

    expect(getByText('Change').getAttribute('href')).toBe(
      `/workplace/${component.workplace.uid}/staff-record/${component.worker.uid}/mandatory-details/staff-details`,
    );
  });
});
