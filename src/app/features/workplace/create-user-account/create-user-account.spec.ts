import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CreateUserAccountComponent } from './create-user-account.component';

describe('CreateUserAccountComponent', () => {
  async function setup() {
    const { fixture } = await render(CreateUserAccountComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        ErrorSummaryService,
        BackService,
        FormBuilder,
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: { parent: { snapshot: { data: { establishment: {} } } } },
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
    });

    const component = fixture.componentInstance;

    return {
      fixture,
      component,
    };
  }

  it('should render CreateUserAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
