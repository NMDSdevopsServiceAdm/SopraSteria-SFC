import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CheckCQCDetailsComponent } from './check-cqc-details.component';

describe('CheckCQCDetailsComponent', () => {
  const setup = async () => {
    const locationId = '1-11111111';

    const { fixture, getByText } = await render(CheckCQCDetailsComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: {
            establishment: { locationId },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, locationId };
  };

  it('should render a CheckCQCDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the link with a href that navigates to the correct cqc page', async () => {
    const { getByText, locationId } = await setup();

    expect(getByText('Please check your CQC details').getAttribute('href')).toEqual(
      `https://www.cqc.org.uk/location/${locationId}`,
    );
  });
});
