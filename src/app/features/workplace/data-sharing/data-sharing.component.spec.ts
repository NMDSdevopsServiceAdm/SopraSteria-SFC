import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { DataSharingComponent } from './data-sharing.component';

describe('DataSharingComponent', () => {
  async function setup() {
    const { fixture, getByText, getAllByText } = await render(DataSharingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
      getByText,
      getAllByText,
    };
  }

  it('should render DataSharingComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
