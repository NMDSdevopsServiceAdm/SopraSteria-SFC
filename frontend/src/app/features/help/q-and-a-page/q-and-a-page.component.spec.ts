import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { QAndAPageComponent } from './q-and-a-page.component';

describe('QAndAPageComponent', () => {
  async function setup() {
    const qAndAPageData = {
      title: 'An example Q and A page',
      content: 'Some example content',
    };

    const setupTools = await render(QAndAPageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule],
      providers: [
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: ActivatedRoute,
          useValue: new MockActivatedRoute({
            snapshot: {
              data: {
                questionAndAnswerPage: {
                  data: [qAndAPageData],
                },
              },
            },
          }),
        },
      ],
      declarations: [HelpContentComponent],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      routerSpy,
      qAndAPageData,
    };
  }

  it('should render QAndAPageComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title and content', async () => {
    const { qAndAPageData, getByText } = await setup();

    expect(getByText(qAndAPageData.title)).toBeTruthy();
    expect(getByText(qAndAPageData.content)).toBeTruthy();
  });

  it('should show a back link with a link back to the previous page (questions and answers)', async () => {
    const { component, getByText, routerSpy } = await setup();

    const backLink = getByText('Back', { selector: 'a' }) as HTMLAnchorElement;
    userEvent.click(backLink);

    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
  });
});
