import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { fireEvent, render } from '@testing-library/angular';

import { BackToParentComponent } from './back-to-parent-link.component';

describe('BackToParentComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getByLabelText } = await render(BackToParentComponent, {
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

  it('should have route to main dashboard when selecting primary workplace', async () => {
    const { component, getByText, routerSpy } = await setup();

    const selectObject = getByText(component.primaryWorkplace.name);
    fireEvent.change(selectObject, { target: { value: component.primaryWorkplace.name } });

    expect(routerSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
