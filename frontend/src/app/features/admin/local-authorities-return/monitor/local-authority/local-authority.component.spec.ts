import { of } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router, RouterModule } from '@angular/router';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { LocalAuthorityComponent } from './local-authority.component';

describe('LocalAuthorityComponent', () => {
  const mockLocalAuthorityUid = 'mock-local-authority-uid';
  const mockLocalAuthorityData = {
    name: 'Leeds',
    workers: 30,
    status: 'Not updated',
    notes: 'some notes',
  };
  async function setup(overrides: any = {}) {
    const localAuthorityData = overrides?.localAuthorityData ?? mockLocalAuthorityData;

    const setupTools = await render(LocalAuthorityComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                localAuthority: localAuthorityData,
              },
              paramMap: convertToParamMap({ uid: mockLocalAuthorityUid }),
            },
          },
        },
        { provide: LocalAuthoritiesReturnService, useClass: LocalAuthoritiesReturnService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.changeDetectorRef;

    const injector = getTestBed();

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const localAuthoritiesReturnService = injector.inject(LocalAuthoritiesReturnService);
    const updateLASpy = spyOn(localAuthoritiesReturnService, 'updateLA').and.returnValue(of(null));

    return {
      component,
      updateLASpy,
      routerSpy,
      ...setupTools,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should prefill the form', async () => {
    const { getByLabelText } = await setup();

    expect((getByLabelText('Number of workers') as HTMLInputElement).value).toEqual(
      String(mockLocalAuthorityData.workers),
    );

    expect((getByLabelText('Status') as HTMLInputElement).value).toEqual(mockLocalAuthorityData.status);
    expect((getByLabelText('Notes') as HTMLInputElement).value).toEqual(mockLocalAuthorityData.notes);
  });

  it('should show the input box for workers as empty when the value is 0', async () => {
    const mockData = { ...mockLocalAuthorityData, workers: 0 };
    const { getByLabelText } = await setup({ localAuthorityData: mockData });

    expect((getByLabelText('Number of workers') as HTMLInputElement).value).toEqual('');
  });

  it('should send the data to backend on submit ', async () => {
    const { getByLabelText, getByText, updateLASpy, routerSpy } = await setup();

    userEvent.clear(getByLabelText('Number of workers'));
    userEvent.type(getByLabelText('Number of workers'), '50');

    userEvent.selectOptions(getByLabelText('Status'), 'Confirmed, complete');

    userEvent.clear(getByLabelText('Notes'));
    userEvent.type(getByLabelText('Notes'), 'some special notes');

    userEvent.click(getByText('Save and return'));

    expect(updateLASpy).toHaveBeenCalledWith(mockLocalAuthorityUid, {
      workers: 50,
      notes: 'some special notes',
      status: 'Confirmed, complete',
    });
    expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin', 'local-authorities-return', 'monitor']);
  });

  it('should convert empty input for workers to 0 when submit form', async () => {
    const { getByLabelText, getByText, updateLASpy, routerSpy } = await setup();

    userEvent.clear(getByLabelText('Number of workers'));

    userEvent.click(getByText('Save and return'));

    expect(updateLASpy).toHaveBeenCalledWith(mockLocalAuthorityUid, {
      workers: 0,
      notes: mockLocalAuthorityData.notes,
      status: mockLocalAuthorityData.status,
    });
    expect(routerSpy).toHaveBeenCalledWith(['/sfcadmin', 'local-authorities-return', 'monitor']);
  });
});
