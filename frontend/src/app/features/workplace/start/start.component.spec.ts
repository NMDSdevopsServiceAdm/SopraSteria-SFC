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

describe('StartComponent (workplace)', () => {
  async function setup(navigatedFromFragment = '') {
    navigatedFromFragment ? history.pushState({ navigatedFromFragment }, '') : history.replaceState({}, '');

    const { fixture, getByText, getByTestId } = await render(StartComponent, {
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

    return { component, fixture, getByTestId, getByText, routerSpy, establishmentService };
  }

  it('should render a StartComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });

  it('should display the main heading', async () => {
    const { getByTestId } = await setup();
    const heading = getByTestId('heading')

    expect(heading.textContent).toEqual('Add more details about your workplace');
  })

  it('should display the details text', async () => {
    const { getByTestId } = await setup();
    const detailsText = getByTestId('details-text')

    const text =
      `We'll ask you a maximum of 25 questions. If necessary, you can skip questions and answer them later in the Workplace section of ASC-WDS.`

    expect(detailsText.textContent.trim()).toEqual(text);
  })

  describe('Services section', ()=> {
    it('should display the heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('services-heading')

      expect(heading.textContent).toEqual('Services');
    })

    it('should display the text', async () => {
      const { getByTestId } = await setup();
      const text = getByTestId('services-text')
      const textContent =
        'Questions about your services and who uses them, and whether your non-nursing staff carry out delegated healthcare activities?'

      expect(text.textContent.trim()).toEqual(textContent);
    })
  })

  describe('Vacancies and turnover section', ()=> {
    it('should display the heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('vacancies-heading')

      expect(heading.textContent).toEqual('Vacancies and turnover');
    })

    it('should display the text', async () => {
      const { getByTestId } = await setup();
      const text = getByTestId('vacancies-text')
      const textContent =
        'Questions like whether you have any staff vacancies, and whether you’ve had any starters or leavers in the last 12 months?'

      expect(text.textContent.trim()).toEqual(textContent);
    })
  })

  describe('Pay and benefits section', ()=> {
    it('should display the heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('pay-heading')

      expect(heading.textContent).toEqual('Pay and benefits');
    })

    it('should display the text', async () => {
      const { getByTestId } = await setup();
      const text = getByTestId('pay-text')
      const textContent = 'Questions about things like annual leave, workplace pensions and rates of pay.'

      expect(text.textContent.trim()).toEqual(textContent);
    })
  })

  describe('Staff development section', ()=> {
    it('should display the heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('staff-heading')

      expect(heading.textContent).toEqual('Staff development');
    })

    it('should display the text', async () => {
      const { getByTestId } = await setup();
      const text = getByTestId('staff-text')
      const textContent = 'Questions about the care workforce pathway, training and Care Certificates.'

      expect(text.textContent.trim()).toEqual(textContent);
    })
  })

  describe('Permissions section', ()=> {
    it('should display the heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('permissions-heading')

      expect(heading.textContent).toEqual('Permissions');
    })

    it('should display the text', async () => {
      const { getByTestId } = await setup();
      const text = getByTestId('permissions-text')
      const textContent = 'Whether we can share your data with the CQC and local authorities or not?'

      expect(text.textContent.trim()).toEqual(textContent);
    })
  })

  it('should navigate to type of employer page after clicking continue button', async () => {
    const { component, getByText, routerSpy } = await setup();

    const workplaceUid = component.establishment.uid;
    const continueButton = getByText('Continue');

    fireEvent.click(continueButton);

    expect(routerSpy).toHaveBeenCalledWith(['workplace', workplaceUid, 'other-services']);
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
