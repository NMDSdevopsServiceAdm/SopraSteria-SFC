import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SelectMainServiceCqcComponent } from '@features/workplace/select-main-service/select-main-service-cqc.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

describe('SelectMainServiceCQCComponent', () => {
  async function setup() {
    const { fixture, getByText } = await render(SelectMainServiceCqcComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
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

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      routerSpy,
      getByText,
    };
  }

  it('should render', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  fit('should navigate to main service question when answer selected', async () => {
    const { component, getByText, routerSpy } = await setup();

    expect(component).toBeTruthy();
    const yesRadio = getByText('Yes');
    fireEvent.click(yesRadio);

    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith([
      '/workplace',
      component.establishment.uid,
      'workplace-data',
      'workplace-summary',
      'main-service',
    ]);
  });
});
