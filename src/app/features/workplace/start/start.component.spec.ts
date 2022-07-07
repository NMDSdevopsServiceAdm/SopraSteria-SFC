import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { StartComponent } from './start.component';

describe('StartComponent (workplace)', () => {
  async function setup(navigatedFromFragment = '') {
    navigatedFromFragment ? history.pushState({ navigatedFromFragment }, '') : history.replaceState({}, '');

    const { fixture, getByText } = await render(StartComponent, {
      imports: [RouterModule, RouterTestingModule, WorkplaceModule, HttpClientTestingModule],
      providers: [
        BackService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });

    const component = fixture.componentInstance;

    return { component, getByText };
  }

  it('should render a StartComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should have link to type of employer page on continue button', async () => {
    const { component, getByText } = await setup();

    const workplaceUid = component.establishment.uid;
    const continueButton = getByText('Continue');

    expect(continueButton.getAttribute('href')).toBe('/workplace/' + workplaceUid + '/other-services');
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
