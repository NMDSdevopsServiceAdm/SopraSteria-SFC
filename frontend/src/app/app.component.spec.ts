import { HttpClientTestingModule } from '@angular/common/http/testing';
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
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { of, Subject } from 'rxjs';

import { AppComponent } from './app.component';

fdescribe('AppComponent', () => {
  async function setup(navigationUrl = '/') {
    const { fixture, getByText, getByTestId } = await render(AppComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
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
      getByTestId,
    };
  }

  it('should render an AppComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should render subsidiary-account ', async () => {
    const { fixture, getByTestId } = await setup('/subsidiary/subUid/home');
    fixture.detectChanges();
    const subsidiaryAccountRendered = getByTestId('subsidiary-account');

    expect(subsidiaryAccountRendered).toBeTruthy();
  });

  it('should set standalone', async () => {
    const { fixture, getByTestId } = await setup('/');
    fixture.detectChanges();

    const standAloneAccountRendered = getByTestId('stand-alone-account');

    expect(standAloneAccountRendered).toBeTruthy();
  });
});
