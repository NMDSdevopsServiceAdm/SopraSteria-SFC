import lodash from 'lodash';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UpdateBannerComponent } from './update-banner.component';

describe('UpdateBannerComponent', () => {
  const setup = async (overrides = {}) => {
    const bannerContent = 'New question about pay and pension';
    const linkText = lodash.get(overrides, 'linkText', 'Answer questions');
    const linkClickedSpy = jasmine.createSpy();
    const linkTo = ['workplace', 'mock-uid', 'pensions'];

    const template = `<app-update-banner [linkText]="linkText" [linkTo]="linkTo" (linkClicked)="linkClickedSpy()">${bannerContent}</app-update-banner>`;

    const setupTools = await render(template, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
      componentProperties: {
        linkText,
        linkClickedSpy,
        linkTo,
      },
    });

    const component = setupTools.fixture.componentInstance as UpdateBannerComponent;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const navigateByUrlSpy = spyOn(router, 'navigateByUrl');

    return { ...setupTools, component, linkClickedSpy, navigateByUrlSpy };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the given banner content and a link', async () => {
    const { getByText, getByRole } = await setup();

    expect(getByText('New question about pay and pension')).toBeTruthy();
    expect(getByRole('link', { name: 'Answer questions' })).toBeTruthy();
  });

  it('should emit an event to linkClicked output on link click', async () => {
    const { getByText, linkClickedSpy } = await setup();

    userEvent.click(getByText('Answer questions'));
    expect(linkClickedSpy).toHaveBeenCalled();
  });

  it('should navigate to the given router link on link click', async () => {
    const { getByText, navigateByUrlSpy } = await setup();

    userEvent.click(getByText('Answer questions'));

    expect(navigateByUrlSpy).toHaveBeenCalled();

    const destination = navigateByUrlSpy.calls.mostRecent().args[0];
    expect(destination.toString()).toEqual('/workplace/mock-uid/pensions');
  });

  it('should not show the link if link text is missing', async () => {
    const { getByText, queryByRole } = await setup({ linkText: null });

    expect(getByText('New question about pay and pension')).toBeTruthy();
    expect(queryByRole('link')).toBeFalsy();
  });
});
