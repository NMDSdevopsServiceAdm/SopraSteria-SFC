import { render } from '@testing-library/angular';
import { Question } from './question.component';
import { Component } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentServiceWithOverrides } from '@core/test-utils/MockEstablishmentService';
import { BackService } from '@core/services/back.service';
import { getTestBed } from '@angular/core/testing';

describe('WorkplaceQuestion parent class', () => {
  const mockWorkplaceUid = 'mock-workplace-uid';

  @Component({})
  class MockChildComponent extends Question {
    _init() {
      this.previousRoute = ['/workpace', mockWorkplaceUid, 'previous-page'];
      this.nextRoute = ['/workpace', mockWorkplaceUid, 'next-page'];
      this.skipRoute = ['/workpace', mockWorkplaceUid, 'next-page-after-skip'];
    }
  }

  const setup = async (overrides: any = {}) => {
    const currentUrl = overrides?.currentUrl ?? '/dashboard';
    const setupTools = await render(MockChildComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentServiceWithOverrides.factory({ establishment: { uid: mockWorkplaceUid } }),
        },
        {
          provide: BackService,
          useValue: {},
        },
        { provide: Router, useValue: { url: currentUrl } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    return { ...setupTools, component, establishmentService };
  };

  describe('conditional routing for previousRoute / nextRoute / skipRoute', () => {
    it('should return the page URL under /workplace-data/add-workplace-details if in add workplace details flow', async () => {
      const { component } = await setup({
        currentUrl: `/workplace/${mockWorkplaceUid}/workplace-data/add-workplace-details/a-question-page`,
      });

      expect(component.previousRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'add-workplace-details',
        'previous-page',
      ]);

      expect(component.nextRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'add-workplace-details',
        'next-page',
      ]);

      expect(component.skipRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'add-workplace-details',
        'next-page-after-skip',
      ]);
    });

    it('should return the page URL under /workplace/:uid if not in flow', async () => {
      const { component } = await setup();

      expect(component.previousRoute).toEqual(['/workplace', mockWorkplaceUid, 'previous-page']);

      expect(component.nextRoute).toEqual(['/workplace', mockWorkplaceUid, 'next-page']);

      expect(component.skipRoute).toEqual(['/workplace', mockWorkplaceUid, 'next-page-after-skip']);
    });
  });
});
