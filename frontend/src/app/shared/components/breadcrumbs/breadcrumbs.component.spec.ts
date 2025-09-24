import { provideHttpClient } from '@angular/common/http';
import { render } from '@testing-library/angular';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WindowRef } from '@core/services/window.ref';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { TabsService } from '@core/services/tabs.service';
import { MockTabsService } from '@core/test-utils/MockTabsService';
import { SharedModule } from '@shared/shared.module';
import { RouterModule } from '@angular/router';

import { BreadcrumbsComponent } from './breadcrumbs.component';

describe('BreadcrumbsComponent', () => {
  const setup = async (workplaceName = '') => {
    const { fixture, getByText } = await render(BreadcrumbsComponent, {
      imports: [SharedModule, RouterModule],
      providers: [
        WindowRef,
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: TabsService,
          useClass: MockTabsService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      componentProperties: {
        workplaceName: workplaceName,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the workplace name', async () => {
    const { component, getByText, fixture } = await setup('Test Workplace');

    component.breadcrumbs = [
      {
        fragment: 'home',
        path: '/dashboard',
        title: 'Home',
      },
    ];

    fixture.detectChanges();

    expect(getByText('Test Workplace:')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
  });

  it('should not show the workplace name', async () => {
    const { component, getByText, fixture } = await setup();
    component.breadcrumbs = [
      {
        fragment: 'home',
        path: '/dashboard',
        title: 'Home',
      },
    ];

    fixture.detectChanges();

    expect(getByText('Go back to:')).toBeTruthy();
    expect(getByText('Home')).toBeTruthy();
  });
});
