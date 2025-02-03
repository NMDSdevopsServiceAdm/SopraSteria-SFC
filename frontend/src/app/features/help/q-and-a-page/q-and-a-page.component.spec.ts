import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockActivatedRoute } from '@core/test-utils/MockActivatedRoute';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { HelpContentComponent } from '@shared/components/help-content/help-content.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { QuestionsAndAnswersComponent } from '../questions-and-answers/questions-and-answers.component';
import { QAndAPageComponent } from './q-and-a-page.component';

describe('QAndAPageComponent', () => {
  async function setup(overrides: any = {}) {
    const routes: Routes = [
      { path: 'questions-and-answers', component: QuestionsAndAnswersComponent },
      { path: 'questions-and-answers/:slug', component: QAndAPageComponent },
    ];

    const setupTools = await render(QAndAPageComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule.withRoutes(routes)],
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
                  data: {},
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
    };
  }

  it('should render WhatsNewComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the content', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('content')).toBeTruthy();
  });

  it('should show a back link with a link back to the previous page (questions and answers)', async () => {
    const { component, getByText, routerSpy } = await setup();

    const backLink = getByText('Back', { selector: 'a' }) as HTMLAnchorElement;
    userEvent.click(backLink);

    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
  });
});
