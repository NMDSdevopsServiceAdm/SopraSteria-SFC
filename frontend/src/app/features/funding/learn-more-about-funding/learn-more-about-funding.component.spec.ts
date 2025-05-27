import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PagesService } from '@core/services/pages.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPagesService } from '@core/test-utils/MockPagesService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { LearnMoreAboutFundingComponent } from './learn-more-about-funding.component';

describe('LearnMoreAboutFundingComponent', () => {
  const pages = MockPagesService.pagesFactory();

  async function setup() {
    const setupTools = await render(LearnMoreAboutFundingComponent, {
      imports: [RouterModule, HttpClientTestingModule, SharedModule],
      declarations: [],
      providers: [
        { provide: PagesService, useClass: MockPagesService },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                pages,
              },
            },
          }),
        },
      ],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
    };
  }

  it('should render a WdfLearnMoreComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    const title = getByText('The Learning and Development Support Scheme');

    expect(title).toBeTruthy();
  });

  it('should display the workplace name and the nmds ID in brackets in caption above title', async () => {
    const { component, getByText } = await setup();

    const workplaceName = component.workplace.name;
    const nmdsId = component.workplace.nmdsId;
    const workplaceIdCaption = `(Workplace ID: ${nmdsId})`;

    expect(getByText(workplaceName)).toBeTruthy();
    expect(getByText(workplaceIdCaption)).toBeTruthy();
  });

  it("should navigate to wdf main page when 'Does your data meet funding requirements?' is clicked", async () => {
    const { component, fixture, getByText, routerSpy } = await setup();

    const button = getByText('Does your data meet funding requirements?');

    fireEvent.click(button);
    fixture.detectChanges();

    expect(button).toBeTruthy();
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
  });

  it('should display the content of the cms page', async () => {
    const { getByText } = await setup();

    expect(getByText(pages.data[0].content)).toBeTruthy();
  });
});
