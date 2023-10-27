import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';
import { WorkplaceInfoPanelComponent } from './workplace-info-panel.component';
import { Establishment } from '../../../../mockdata/establishment';
import { MockEstablishmentServiceWithNoEmployerType } from '@core/test-utils/MockEstablishmentService';

describe('WorkplaceInfoPanel', () => {
  async function setup(employerTypeHasValue = true, owner: string = 'Workplace', establishment = Establishment) {
    const { fixture, getByTestId, getByText, queryByTestId, queryByText } = await render(WorkplaceInfoPanelComponent, {
      imports: [SharedModule, RouterModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithNoEmployerType.factory(employerTypeHasValue, owner),
        },
        {
          provide: AuthService,
          useClass: MockAuthService,
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                workers: { workers: [], workerCount: 0, trainingCounts: {} },
              },
            },
            queryParams: of({ view: null }),
          },
        },
      ],
      componentProperties: {
        workplace: establishment,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const establishmentServiceSpy = spyOn(establishmentService, 'getEstablishment').and.callThrough();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      getByTestId,
      queryByTestId,
      queryByText,
      getByText,
      component,
      fixture,
      establishmentServiceSpy,
      routerSpy,
    };
  }

  it('should render Workplace Info Component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should navigate to the selected workplace', async () => {
    const { component, establishmentServiceSpy, fixture, getByText, routerSpy } = await setup();

    component.newHomeDesignParentFlag = true;
    component.canViewEstablishment = true;

    fixture.detectChanges();

    const workplaceNameLink = getByText(component.workplace.name);

    fireEvent.click(workplaceNameLink);
    fixture.detectChanges();

    expect(establishmentServiceSpy).toHaveBeenCalled();
    expect(workplaceNameLink.getAttribute('href')).toBeTruthy();
    expect(routerSpy).toHaveBeenCalled();
  });
});
