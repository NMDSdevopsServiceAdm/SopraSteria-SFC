import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { render } from '@testing-library/angular';
import { FundingRequirementsComponent } from './funding-requirements.component';

fdescribe('FundingRequirementsComponent', () => {
  const pages = MockPagesService.pagesFactory();

  async function setup() {
    const { fixture, getByText, queryByText } = await render(FundingRequirementsComponent, {
      imports: [],
      providers: [],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      queryByText,
      routerSpy,
    };
  }

  it('should render FundingRequirementsComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
});
