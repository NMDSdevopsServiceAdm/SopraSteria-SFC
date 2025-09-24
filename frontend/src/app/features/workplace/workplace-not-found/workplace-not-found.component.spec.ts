import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { LocationService } from '@core/services/location.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { WorkplaceNotFoundComponent } from './workplace-not-found.component';

describe('WorkplaceNotFoundComponent', () => {
  const workplaceUid = 'abc131355543435';

  async function setup() {
    const { fixture, getByText } = await render(WorkplaceNotFoundComponent, {
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

  it('should render a WorkplaceNotFoundComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show a go back link with workplace uid in url', async () => {
    const { getByText } = await setup();

    const link = getByText('go back and try again');

    expect(link.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/regulated-by-cqc`);
  });
});