import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, provideRouter, Router, RouterEvent, RouterModule } from '@angular/router';
import { AlertService } from '@core/services/alert.service';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { IdleService } from '@core/services/idle.service';
import { NestedRoutesService } from '@core/services/nested-routes.service';
import { TabsService } from '@core/services/tabs.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockParentSubsidiaryViewService } from '@core/test-utils/MockParentSubsidiaryViewService';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { render } from '@testing-library/angular';
import { of, Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { provideHttpClient } from '@angular/common/http';

describe('AppComponent', () => {
  async function setup(overrides: any = {}) {
    const { fixture, getByText, queryByTestId } = await render(AppComponent, {
      imports: [RouterModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: EstablishmentService,
          useValue: {
            primaryWorkplace: { isParent: true, parentName: null },
            standAloneAccount: false,
            getChildWorkplaces() {
              of({ childWorkplaces: null });
            },
          },
        },
        {
          provide: AuthService,
          useFactory: MockAuthService.factory(overrides.loggedIn ?? true),
        },
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        {
          provide: ParentSubsidiaryViewService,
          useClass: MockParentSubsidiaryViewService,
        },
        IdleService,
        Title,
        NestedRoutesService,
        WindowRef,
        AlertService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const injector = getTestBed();
    const navigationUrl = overrides.navigationUrl ?? '/';
    const event = new NavigationEnd(42, navigationUrl, navigationUrl);
    (injector.inject(Router).events as unknown as Subject<RouterEvent>).next(event);
    const component = fixture.componentInstance;
    return {
      component,
      fixture,
      getByText,
      queryByTestId,
    };
  }

  it('should render an AppComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Help and tips button', () => {
    it('should render help and tips button', async () => {
      const { fixture, queryByTestId } = await setup();
      fixture.detectChanges();

      expect(queryByTestId('help-and-tips-button')).toBeTruthy();
    });

    it('should not render help and tips button when logged out', async () => {
      const { fixture, queryByTestId } = await setup({ loggedIn: false });
      fixture.detectChanges();

      expect(queryByTestId('help-and-tips-button')).toBeFalsy();
    });

    it("should not render help and tips button on route '/help'", async () => {
      const { fixture, queryByTestId } = await setup({ navigationUrl: '/help' });
      fixture.detectChanges();

      expect(queryByTestId('help-and-tips-button')).toBeFalsy();
    });

    it('should not render help and tips button when in help section in subsidiary view', async () => {
      const { fixture, queryByTestId } = await setup({ navigationUrl: '/subsidiary/help/get-started' });
      fixture.detectChanges();

      expect(queryByTestId('help-and-tips-button')).toBeFalsy();
    });

    it("should not render help and tips button on route '/sfcadmin'", async () => {
      const { fixture, queryByTestId } = await setup({ navigationUrl: '/sfcadmin' });
      fixture.detectChanges();

      expect(queryByTestId('help-and-tips-button')).toBeFalsy();
    });
  });
});
