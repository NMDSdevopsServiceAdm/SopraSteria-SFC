import { HttpClient, HttpHandler } from '@angular/common/http';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { ParentSubsidiaryViewService } from '@shared/services/parent-subsidiary-view.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { BackToParentComponent } from './back-to-parent-link.component';

describe('BackToParentComponent', () => {
  const parentWorkplaceName = 'Big Parent Co';

  const setup = async () => {
    const { fixture, getByText } = await render(BackToParentComponent, {
      imports: [SharedModule],
      providers: [WindowRef, HttpClient, HttpHandler],
      componentProperties: {
        parentWorkplaceName,
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();

    const router = injector.inject(Router);
    const routerSpy = spyOn(router, 'navigate').and.callThrough();

    const parentSubService = injector.inject(ParentSubsidiaryViewService);
    const clearViewingSubSpy = spyOn(parentSubService, 'clearViewingSubAsParent').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      clearViewingSubSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

});
