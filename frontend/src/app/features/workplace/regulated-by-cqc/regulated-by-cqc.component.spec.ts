import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegulatedByCqcComponent } from './regulated-by-cqc.component';

describe('RegulatedByCqcComponent', () => {
  const workplaceUid = 'abc131355543435';

  async function setup() {
    const { fixture, getByText } = await render(RegulatedByCqcComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { uid: workplaceUid },
          },
        },
        LocationService,
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a RegulatedByCqcComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});