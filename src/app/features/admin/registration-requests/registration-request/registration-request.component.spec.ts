import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { RegistrationsService } from '@core/services/registrations.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockRegistrationsService } from '@core/test-utils/MockRegistrationsService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { RegistrationRequestComponent } from './registration-request.component';

describe('RegistrationRequestComponent', () => {
  async function setup() {
    const { fixture, getByText, queryAllByText } = await render(RegistrationRequestComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: RegistrationsService, useClass: MockRegistrationsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get() {
                  'uidForAddedWorkplace';
                },
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    return {
      component,
      getByText,
      queryAllByText,
    };
  }

  it('should render a RegistrationRequestComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name twice (heading and name section)', async () => {
    const { queryAllByText } = await setup();
    expect(queryAllByText('Test Workplace', { exact: false }).length).toBe(2);
  });

  it('should display the workplace address', async () => {
    const { getByText } = await setup();

    expect(getByText('Address line 1', { exact: false })).toBeTruthy();
    expect(getByText('Somewhere', { exact: false })).toBeTruthy();
    expect(getByText('Third Line Place', { exact: false })).toBeTruthy();
    expect(getByText('ABC123', { exact: false })).toBeTruthy();
    expect(getByText('Wessex', { exact: false })).toBeTruthy();
    expect(getByText('Nowhereville', { exact: false })).toBeTruthy();
  });

  it('should display the provider ID, location ID and parent ID', async () => {
    const { getByText } = await setup();

    const locationId = '1234';
    const provid = '15111';
    const parentId = '6311133333333';

    expect(getByText(locationId, { exact: false })).toBeTruthy();
    expect(getByText(provid, { exact: false })).toBeTruthy();
    expect(getByText(parentId, { exact: false })).toBeTruthy();
  });
});
