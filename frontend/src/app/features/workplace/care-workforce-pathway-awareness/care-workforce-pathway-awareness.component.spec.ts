import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { CareWorkforcePathwayAwarenessComponent } from './care-workforce-pathway-awareness.component';

fdescribe('CareWorkforcePathwayAwarenessComponent', () => {
  async function setup() {
    const setupTools = await render(CareWorkforcePathwayAwarenessComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
    };
  }

  it('should render CareWorkforcePathwayAwarenessComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
