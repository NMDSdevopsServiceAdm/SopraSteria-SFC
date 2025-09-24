import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { AboutTheDataLinkComponent } from './about-the-data-link.component';

describe('AboutTheDataLinkComponent', () => {
  const setup = async () => {
    const workplaceUid = 'mockUid';

    const { fixture, getByText, getByTestId, queryByTestId, queryByText } = await render(AboutTheDataLinkComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useValue: { establishment: { uid: workplaceUid } },
        },
      provideHttpClient(), provideHttpClientTesting(),],
      schemas: [],
      componentProperties: {},
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
      queryByText,
      workplaceUid,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show about the data text', async () => {
    const { getByTestId } = await setup();

    const link = getByTestId('about-the-data-link');

    expect(link).toBeTruthy();
    expect(within(link).getByText('About the data')).toBeTruthy();
  });

  it('should link to the about the data page', async () => {
    const { getByTestId, workplaceUid } = await setup();

    const link = getByTestId('about-the-data-link');

    expect(link.getAttribute('href')).toEqual(`/workplace/${workplaceUid}/data-area/about-the-data`);
  });
});