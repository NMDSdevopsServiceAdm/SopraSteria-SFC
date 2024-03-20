import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { fireEvent, render } from '@testing-library/angular';

import { NavigateToWorkplaceDropdownComponent } from './navigate-to-workplace-dropdown.component';

describe('NavigateToWorkplaceDropdownComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByLabelText } = await render(NavigateToWorkplaceDropdownComponent, {
      imports: [RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByText,
      routerSpy,
      getByLabelText,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display primary workplace name', async () => {
    const { component, getByText } = await setup();
    expect(getByText(component.primaryWorkplace.name));
  });

  it('should go to route of main dashboard when selecting primary workplace', async () => {
    const { component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.primaryWorkplace.uid } });

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should go to route of selected sub (first) when selecting sub workplace', async () => {
    const { component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.childWorkplaces[0].uid } });

    expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', 'home', component.childWorkplaces[0].uid]);
  });

  it('should go to route of selected sub (second) when selecting sub workplace', async () => {
    const { component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.childWorkplaces[1].uid } });

    expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', 'home', component.childWorkplaces[1].uid]);
  });
});
