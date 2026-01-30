import { render } from '@testing-library/angular';
import { WorkplaceQuestion } from './question.component';
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

describe('WorkplaceQuestion', () => {
  const mockWorkplaceUid = 'mock-workplace-uid';

  @Component({})
  class MockChildComponent extends WorkplaceQuestion {
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
        { provide: Router, useValue: { url: currentUrl, navigate: jasmine.createSpy() } },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService);
    const router = injector.inject(Router);

    return { ...setupTools, component, establishmentService, router };
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

    it('should return the page URL under /workplace/:uid/workplace-data/workplace-summary/ if not in flow', async () => {
      const { component } = await setup({ currentUrl: '/dashboard#workplace' });

      expect(component.previousRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'workplace-summary',
        'previous-page',
      ]);

      expect(component.nextRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'workplace-summary',
        'next-page',
      ]);

      expect(component.skipRoute).toEqual([
        '/workplace',
        mockWorkplaceUid,
        'workplace-data',
        'workplace-summary',
        'next-page-after-skip',
      ]);
    });
  });

  describe('navigateToQuestionPage', () => {
    it('should navigate to question page under /workplace-data/add-workplace-details/ if in add workplace details flow', async () => {
      const { component, router } = await setup({
        currentUrl: `/workplace/${mockWorkplaceUid}/workplace-data/add-workplace-details/a-question-page`,
      });

      // @ts-ignore
      component.navigateToQuestionPage('another-question-page', { replaceUrl: true });

      expect(router.navigate).toHaveBeenCalledWith(
        ['/workplace', mockWorkplaceUid, 'workplace-data', 'add-workplace-details', 'another-question-page'],
        { replaceUrl: true },
      );
    });

    it('should navigate to question page under /workplace-data/summary-details/ if in add workplace details flow', async () => {
      const { component, router } = await setup({
        currentUrl: '/dashboard#workplace',
      });

      // @ts-ignore
      component.navigateToQuestionPage('another-question-page', { replaceUrl: true });

      expect(router.navigate).toHaveBeenCalledWith(
        ['/workplace', mockWorkplaceUid, 'workplace-data', 'workplace-summary', 'another-question-page'],
        { replaceUrl: true },
      );
    });
  });
});
