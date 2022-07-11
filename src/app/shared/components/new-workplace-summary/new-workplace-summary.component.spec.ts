import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
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
import { render } from '@testing-library/angular';

import { establishmentWithShareWith, establishmentWithWdfBuilder } from '../../../../../server/test/factories/models';
import { SummaryRecordValueComponent } from '../summary-record-value/summary-record-value.component';
import { NewWorkplaceSummaryComponent } from './new-workplace-summary.component';

fdescribe('NewWorkplaceSummaryComponent', () => {
  const setup = async (shareWith = null) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(NewWorkplaceSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WdfModule],
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
        // return: { url: ['/'] },
      },
      declarations: [SummaryRecordValueComponent],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByTestId };
  };

  it('should render a NewWorkplaceSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });
});
