import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { fireEvent, render } from '@testing-library/angular';

import { HelpAreaComponent } from './help-area.component';

describe('HelpAreaComponent', () => {
  async function setup(overrides: any = {}) {
    const workplace = establishmentBuilder();
    const routerSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));

    const setupTools = await render(HelpAreaComponent, {
      imports: [RouterModule],
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
        {
          provide: BreadcrumbService,
          useValue: { show: () => {} },
        },
        { provide: Router, useValue: { navigate: routerSpy, url: overrides.url ?? 'help/get-started' } },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

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

  [
    { route: 'get-started', linkText: 'Get started' },
    { route: 'questions-and-answers', linkText: 'Questions and answers' },
    { route: 'whats-new', linkText: "What's new" },
    { route: 'helpful-downloads', linkText: 'Helpful downloads' },
    { route: 'contact-us', linkText: 'Contact us' },
  ].forEach((tab) => {
    it(`should set ${tab.linkText} tab as active when on ${tab.route} route`, async () => {
      const { getByText } = await setup({ url: `help/${tab.route}` });

      const tabLink = getByText(tab.linkText);

      expect(tabLink).toHaveClass('active');
    });
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

  it('should set the focus on the tab after clicking it', async () => {
    const { getByText, routerSpy, fixture } = await setup();
    const tabToClick = getByText("What's new");

    const focusSpy = spyOn(tabToClick, 'focus');

    fireEvent.click(tabToClick);
    await fixture.whenStable();

    expect(focusSpy).toHaveBeenCalled();
  });
});
