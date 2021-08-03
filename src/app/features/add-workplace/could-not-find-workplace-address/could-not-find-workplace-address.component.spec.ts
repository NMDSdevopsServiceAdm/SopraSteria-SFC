import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockWorkplaceService } from '@core/test-utils/MockWorkplaceService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { AddWorkplaceModule } from '../add-workplace.module';
import { CouldNotFindWorkplaceAddressComponent } from './could-not-find-workplace-address.component';

describe('CouldNotFindWorkplaceAddressComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(CouldNotFindWorkplaceAddressComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddWorkplaceModule],
      providers: [
        BackService,
        {
          provide: WorkplaceService,
          useClass: MockWorkplaceService,
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
    };
  }

  it('should render a CouldNotFindWorkplaceAddressComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display invalid postcode retrieved from workplace service', async () => {
    const { getByText } = await setup();
    const postcodeEnteredMessage = 'Postcode entered:';

    const invalidPostcode = 'ABC 123';
    expect(getByText(invalidPostcode)).toBeTruthy();
    expect(getByText(postcodeEnteredMessage, { exact: false })).toBeTruthy();
  });
});
