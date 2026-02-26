import { inject, provideAppInitializer } from '@angular/core';
import { Router } from '@angular/router';

export const patchRouterUrlForWorkplaceQuestions = (isInAddDetailsFlow: boolean = false) => {
  return provideAppInitializer(() => {
    const router = inject(Router);
    if (isInAddDetailsFlow) {
      spyOnProperty(router, 'url', 'get').and.returnValue(
        '/workplace/mocked-uid/workplace-data/add-workplace-details/mock-page-name',
      );
    } else {
      spyOnProperty(router, 'url', 'get').and.returnValue(
        '/workplace/mocked-uid/workplace-data/workplace-summary/mock-page-name',
      );
    }
  });
};
