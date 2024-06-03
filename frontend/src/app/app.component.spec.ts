import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterEvent, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { of, Subject } from 'rxjs';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  async function setup(navigationUrl = '/') {
    const { fixture, getByText, queryByTestId } = await render(AppComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
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
          useClass: MockAuthService,
        },
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        {
          provide: ParentSubsidiaryViewService,
          useClass: MockParentSubsidiaryViewService,
        },
        {
          provide: Angulartics2GoogleTagManager,
          useValue: {
            startTracking() {
              return null;
            },
          },
        },
        IdleService,
        Title,
        NestedRoutesService,
        WindowRef,
        AlertService,
      ],
    });

    const injector = getTestBed();
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

  it('should render subsidiary-account view when subsidiary page is navigated to', async () => {
    const { fixture, queryByTestId } = await setup('/subsidiary/subUid/home');
    fixture.detectChanges();

    const subsidiaryAccountRendered = queryByTestId('subsidiary-account');
    const standAloneAccountRendered = queryByTestId('stand-alone-account');

    expect(subsidiaryAccountRendered).toBeTruthy();
    expect(standAloneAccountRendered).toBeFalsy();
  });

  it('should render standalone view when subsidiary not in url', async () => {
    const { fixture, queryByTestId } = await setup('/');
    fixture.detectChanges();

    const standAloneAccountRendered = queryByTestId('stand-alone-account');
    const subsidiaryAccountRendered = queryByTestId('subsidiary-account');

    expect(standAloneAccountRendered).toBeTruthy();
    expect(subsidiaryAccountRendered).toBeFalsy();
  });
});
