import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { WorkplaceModule } from '../workplace.module';
import { StartComponent } from './start.component';

fdescribe('StartComponent (workplace)', () => {
  async function setup(navigatedFromFragment = '') {
    navigatedFromFragment ? history.pushState({ navigatedFromFragment }, '') : history.replaceState({}, '');

    const { fixture, getByText } = await render(StartComponent, {
      imports: [RouterModule, WorkplaceModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const establishmentService = TestBed.inject(EstablishmentService) as EstablishmentService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return { component, fixture, getByText, routerSpy, establishmentService };
  }

  it('should render a StartComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should navigate to type of employer page after clicking continue button', async () => {
    const { component, getByText, routerSpy } = await setup();

    const workplaceUid = component.establishment.uid;
    const continueButton = getByText('Continue');

    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      workplaceUid,
      'workplace-data',
      'add-workplace-details',
      'other-services',
    ]);
  });

  it('should call the updateSingleEstablishmentField when clicking the Continue button', async () => {
    const { component, fixture, getByText, establishmentService } = await setup();

    const updateSingleEstablishmentFieldSpy = spyOn(
      establishmentService,
      'updateSingleEstablishmentField',
    ).and.callThrough();

    const workplaceUid = component.establishment.uid;
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    fixture.detectChanges();

    const data = { property: 'showAddWorkplaceDetailsBanner', value: false };
    expect(updateSingleEstablishmentFieldSpy).toHaveBeenCalledWith(workplaceUid, data);
  });

  it('should set establishment in service with showBanner field set to data returned from update (false) after clicking Continue button', async () => {
    const { component, getByText, establishmentService } = await setup();

    spyOn(establishmentService, 'updateSingleEstablishmentField').and.returnValue(
      of({ data: { showAddWorkplaceDetailsBanner: false } }),
    );

    const setStateSpy = spyOn(establishmentService, 'setState').and.callThrough();

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);
    expect(component.establishment.showAddWorkplaceDetailsBanner).toBe(false);
    expect(setStateSpy).toHaveBeenCalledWith(component.establishment);
  });

  it('should set the back link to the dashboard home fragment when no navigatedFromFragment state is passed', async () => {
    const { component } = await setup();
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({ url: ['/dashboard'], fragment: 'home' });
  });

  it('should set the back link to the correct fragment when navigatedFromFragment state is passed', async () => {
    const { component } = await setup('workplace');
    const backLinkSpy = spyOn(component.backService, 'setBackLink');

    component.setBackLink();

    expect(backLinkSpy).toHaveBeenCalledWith({ url: ['/dashboard'], fragment: 'workplace' });
  });
});
