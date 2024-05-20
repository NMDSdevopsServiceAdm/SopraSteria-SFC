import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
    const { fixture, component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.primaryWorkplace.uid } });

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'home' });
    });
  });

  it('should go to route of selected sub (first) when selecting sub workplace', async () => {
    const { fixture, component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.childWorkplaces[0].uid } });

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[0].uid, 'home']);
    });
  });

  it('should go to route of selected sub (second) when selecting sub workplace', async () => {
    const { fixture, component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.childWorkplaces[1].uid } });

    fixture.whenStable().then(() => {
      expect(routerSpy).toHaveBeenCalledWith(['/subsidiary', component.childWorkplaces[1].uid, 'home']);
    });
  });

  describe('Value of select (current workplace)', () => {
    it('should set the parent workplace as value of select on init', async () => {
      const { fixture, component } = await setup();

      const select = fixture.debugElement.query(By.css('select')).nativeElement;

      expect(select.value).toEqual(component.primaryWorkplace.uid);
    });

    it('should set the selected workplace as value of select after clicking option', async () => {
      const { fixture, component, getByText } = await setup();

      const selectObject = getByText(component.primaryWorkplace.name);
      fireEvent.change(selectObject, { target: { value: component.childWorkplaces[2].uid } });

      const select = fixture.debugElement.query(By.css('select')).nativeElement;

      expect(select.value).toEqual(component.childWorkplaces[2].uid);
    });
  });
});
