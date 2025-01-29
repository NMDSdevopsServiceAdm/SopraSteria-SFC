import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { fireEvent, render } from '@testing-library/angular';

import { HelpAreaComponent } from './help-area.component';

describe('HelpAreaComponent', () => {
  async function setup() {
    const workplace = establishmentBuilder();

    const setupTools = await render(HelpAreaComponent, {
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishment: workplace,
          },
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      router,
      routerSpy,
      workplace,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the workplace name and heading', async () => {
    const { workplace, getByText } = await setup();

    const workplaceName = workplace.name as string;

    expect(getByText(workplaceName)).toBeTruthy();
    expect(getByText('Get help and tips')).toBeTruthy();
  });

  it('should render all tab links', async () => {
    const { getByText } = await setup();

    expect(getByText('Get started')).toBeTruthy();
    expect(getByText('Questions and answers')).toBeTruthy();
    expect(getByText("What's new")).toBeTruthy();
    expect(getByText('Helpful downloads')).toBeTruthy();
    expect(getByText('Contact us')).toBeTruthy();
  });

  it('should highlight the first tab as active by default', async () => {
    const { getByText } = await setup();
    const firstTab = getByText('Get started');

    expect(firstTab).toHaveClass('active');
  });

  it('should update active tab when clicked', async () => {
    const { getByText, fixture } = await setup();
    const secondTab = getByText('Questions and answers');

    fireEvent.click(secondTab);
    fixture.detectChanges();

    expect(secondTab).toHaveClass('active');
    expect(getByText('Get started')).not.toHaveClass('active');
  });

  it('should call router navigate when clicking a tab', async () => {
    const { getByText, routerSpy, fixture } = await setup();
    const tabToClick = getByText("What's new");

    fireEvent.click(tabToClick);
    fixture.detectChanges();

    expect(routerSpy).toHaveBeenCalledWith(['whats-new'], { relativeTo: jasmine.any(Object) });
  });
});
