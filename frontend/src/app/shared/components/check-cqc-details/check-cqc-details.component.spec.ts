import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CheckCQCDetailsComponent } from './check-cqc-details.component';

describe('CheckCQCDetailsComponent', () => {
  const setup = async () => {
    const { fixture, getByText } = await render(CheckCQCDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText };
  };

  it('should render a CheckCQCDetailsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render the link with a href that navigates to the correct cqc page', async () => {
    const { component, getByText } = await setup();

    expect(getByText('Please check your CQC details').getAttribute('href')).toEqual(
      `https://www.cqc.org.uk/location/${component.locationId}`,
    );
  });
});
