import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkplaceService } from '@core/services/workplace.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { MockWorkplaceServiceWithOverrides } from '@core/test-utils/MockWorkplaceService';
import { SelectMainServiceComponent } from '@features/workplace/select-main-service/select-main-service.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of } from 'rxjs';

fdescribe('SelectMainServiceComponent', () => {
  const mockMainServicesByCategory = [
    {
      category: 'Adult community care',
      services: [
        {
          id: 19,
          reportingID: 17,
          name: 'Shared lives',
          canDoDelegatedHealthcareActivities: true,
          isCQC: true,
        },
      ],
    },
    {
      category: 'Adult domiciliary',
      services: [
        {
          id: 20,
          reportingID: 8,
          name: 'Domiciliary care services',
          canDoDelegatedHealthcareActivities: true,
          isCQC: true,
        },
        {
          id: 21,
          reportingID: 54,
          name: 'Extra care housing services',
          canDoDelegatedHealthcareActivities: true,
          isCQC: true,
        },
      ],
    },
  ];

  async function setup(overrides: any = {}) {
    const mainServiceCQC = overrides?.mainServiceCQC ?? false;
    const returnTo = 'returnTo' in overrides ? overrides.returnTo : { url: ['/dashboard'], fragment: 'workplace' };

    const setupTools = await render(SelectMainServiceComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentServiceWithOverrides,
        },
        {
          provide: WorkplaceService,
          useFactory: MockWorkplaceServiceWithOverrides.factory({
            getServicesByCategory: () => of(mockMainServicesByCategory),
          }),
        },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const establishmentService = injector.inject(EstablishmentService);
    spyOn(establishmentService, 'updateMainService').and.returnValue(of({} as any));
    spyOnProperty(establishmentService, 'returnTo', 'get').and.returnValue(returnTo);
    establishmentService.mainServiceCQC = mainServiceCQC;

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.resolveTo(true);

    const route = injector.inject(ActivatedRoute);

    return {
      ...setupTools,
      component,
      routerSpy,
      route,
      establishmentService,
    };
  }

  it('should render', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render a subheading of Services', async () => {
    const { getByText } = await setup();
    expect(getByText('Services')).toBeTruthy();
  });

  it('should have cancel link with href back to dashboard', async () => {
    const { getByText } = await setup();

    const cancelLink = getByText('Cancel');
    expect(cancelLink.getAttribute('href')).toEqual('/dashboard');
  });

  it('should navigate to main-service-cqc-confirm page when the workplace changed main service to a cqc-regulated one', async () => {
    const { fixture, getByLabelText, getByRole, routerSpy, route } = await setup({ mainServiceCQC: true });

    userEvent.click(getByLabelText('Domiciliary care services'));
    userEvent.click(getByRole('button', { name: 'Save and return' }));

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['..', 'main-service-cqc-confirm'], { relativeTo: route });
  });

  it('should navigate to the returnTo url in other case', async () => {
    const { fixture, getByLabelText, getByRole, routerSpy } = await setup({
      mainServiceCQC: false,
      returnTo: { url: ['/funding', 'data'], fragment: 'workplace' },
    });

    userEvent.click(getByLabelText('Domiciliary care services'));
    userEvent.click(getByRole('button', { name: 'Save and return' }));

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['/funding', 'data'], { fragment: 'workplace' });
  });

  it('should navigate to /dashboard#workplace if returnTo is missing', async () => {
    const { fixture, getByLabelText, getByRole, routerSpy } = await setup({
      mainServiceCQC: false,
      returnTo: undefined,
    });

    userEvent.click(getByLabelText('Domiciliary care services'));
    userEvent.click(getByRole('button', { name: 'Save and return' }));

    await fixture.whenStable();

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
  });
});
