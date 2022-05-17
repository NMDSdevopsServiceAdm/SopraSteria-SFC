import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { StartComponent } from './start.component';
import { render } from '@testing-library/angular';
import { WorkplaceModule } from '../workplace.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('StartComponent (workplace)', () => {
  async function setup() {
    return await render(StartComponent, {
      imports: [RouterModule, RouterTestingModule, WorkplaceModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
  }

  it('should render a StartComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should have link to type of employer page on continue button', async () => {
    const { fixture, getByText } = await setup();

    const workplaceUid = fixture.componentInstance.establishment.uid;
    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toBe('/workplace/' + workplaceUid + '/type-of-employer');
  });
});
