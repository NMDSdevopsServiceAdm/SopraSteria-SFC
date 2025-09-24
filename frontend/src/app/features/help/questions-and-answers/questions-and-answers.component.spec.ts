import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { render, within } from '@testing-library/angular';
import { QuestionsAndAnswersComponent } from './questions-and-answers.component';
import { AutoSuggestComponent } from '@shared/components/auto-suggest/auto-suggest.component';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import userEvent from '@testing-library/user-event';
import { getTestBed } from '@angular/core/testing';
import { PreviousRouteService } from '@core/services/previous-route.service';
import { MockPreviousRouteService } from '@core/test-utils/MockPreviousRouteService';

describe('QuestionsAndAnswersComponent', () => {
  async function setup(override: any = {}) {
    const questionsAndAnswersData = [
      {
        section_heading: 'Get more from ASC-WDS',
        sub_sections: [],
        q_and_a_pages: [
          { title: 'How to make the most of ASC-WDS', slug: 'make-the-most', content: 'make the most' },
          { title: 'How can benchmarks benefit your business?', slug: 'benefit-from-benchmarks', content: 'benefit' },
        ],
      },
      {
        section_heading: 'Helping you and the sector',
        sub_sections: [
          {
            sub_section_heading: 'Workplace',
            q_and_a_pages: [
              { title: 'What workplace data is needed?', slug: 'needed-workplace-data', content: 'workplace' },
              {
                title: 'Why should we share our data?',
                slug: 'share-workplace-data',
                content: 'share workplace data with CQC and local authorities',
              },
              { title: 'What can you do as a parent workplace?', slug: 'what-can-parents-do', content: 'parents' },
            ],
          },
          {
            sub_section_heading: 'Staff records',
            q_and_a_pages: [
              { title: 'How do you add a staff record?', slug: 'how-to-add-staff-records', content: 'staff records' },
            ],
          },
          {
            sub_section_heading: 'Benchmarks',
            q_and_a_pages: [{ title: 'What are benchmarks?', slug: 'what-are-benchmarks', content: 'benchmarks' }],
          },
        ],
      },
    ];

    const setupTools = await render(QuestionsAndAnswersComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                questionsAndAnswers: {
                  data: questionsAndAnswersData,
                },
              },
            },
          },
        },
        {
          provide: BreadcrumbService,
          useClass: MockBreadcrumbService,
        },
        {
          provide: PreviousRouteService,
          useFactory: MockPreviousRouteService.factory(override?.previousUrl),
          deps: [Router],
        },
      ],
      declarations: [AutoSuggestComponent],
    });

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      questionsAndAnswersData,
      routerSpy,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('all questions and answers', () => {
    it('should show all the questions and answers on page load', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('all-questions-and-answers')).toBeTruthy();
    });

    it('should display the titles of each section', async () => {
      const { getByText, questionsAndAnswersData } = await setup();

      questionsAndAnswersData.forEach((section) => {
        expect(getByText(section.section_heading)).toBeTruthy();
      });
    });

    it('should display each of the sub section titles', async () => {
      const { getByText, questionsAndAnswersData } = await setup();

      questionsAndAnswersData.forEach((section) => {
        section.sub_sections?.forEach((sub_section) => {
          expect(getByText(sub_section.sub_section_heading)).toBeTruthy();
        });
      });
    });

    it('should display a link for each of the question and answer pages which are not in a sub section', async () => {
      const { getByText, questionsAndAnswersData } = await setup();

      questionsAndAnswersData.forEach((section) => {
        section.q_and_a_pages?.forEach((page) => {
          const link = getByText(page.title, { selector: 'a' }) as HTMLAnchorElement;
          expect(link.getAttribute('ng-reflect-router-link')).toEqual(page.slug);
        });
      });
    });

    it('should display a link for each of the question and answer pages which are in sub sections', async () => {
      const { getByText, questionsAndAnswersData } = await setup();

      questionsAndAnswersData.forEach((section) => {
        section.sub_sections?.forEach((sub_section) => {
          sub_section.q_and_a_pages?.forEach((page) => {
            const link = getByText(page.title, { selector: 'a' }) as HTMLAnchorElement;
            expect(link.getAttribute('ng-reflect-router-link')).toEqual(page.slug);
          });
        });
      });
    });
  });

  describe('search', () => {
    describe('no results found', () => {
      it('should show when the search icon has been clicked with an empty input', async () => {
        const { fixture, getByRole, getByTestId, getByText } = await setup();

        const button = getByRole('button');

        userEvent.click(button);
        fixture.detectChanges();

        expect(getByTestId('no-matching-results')).toBeTruthy();
        expect(getByRole('heading', { level: 3, name: 'There are no matching results' })).toBeTruthy();
        expect(getByText('You need to search with at least 2 letters or numbers, or both')).toBeTruthy();
      });

      it('should show when the search icon has been clicked with 1 letter inputted', async () => {
        const { fixture, getByRole, getByTestId, getByText } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'w');
        userEvent.click(button);
        fixture.detectChanges();

        expect(getByTestId('no-matching-results')).toBeTruthy();
        expect(getByRole('heading', { level: 3, name: 'There are no matching results' })).toBeTruthy();
        expect(getByText('You need to search with more than 1 letter or number')).toBeTruthy();
      });

      it('should show when the has no matching pages', async () => {
        const { getByRole, fixture, getByText, getByTestId } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'asdasfd');
        userEvent.click(button);
        fixture.detectChanges();

        expect(getByTestId('no-matching-results')).toBeTruthy();
        expect(getByRole('heading', { level: 3, name: 'There are no matching results' })).toBeTruthy();
        expect(getByText('Make sure that your spelling is correct')).toBeTruthy();
      });

      it('should show a no matching results message when an unsuccessful search has been done after a matching search', async () => {
        const { getByRole, fixture, getByTestId } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();
        expect(getByTestId('matching-results')).toBeTruthy();

        userEvent.clear(getByRole('textbox'));
        userEvent.click(button);
        fixture.detectChanges();
        expect(getByTestId('no-matching-results')).toBeTruthy();
      });
    });

    describe('results found', () => {
      it('should show when search has matching results', async () => {
        const { fixture, getByRole, getByTestId } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();

        expect(getByTestId('matching-results')).toBeTruthy();
        expect(getByRole('heading', { level: 3, name: 'Showing search results' })).toBeTruthy();
      });

      it('should display a link for each of the question and answer pages which have been found in the search', async () => {
        const { getByText, getByRole, fixture } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();

        const link = getByText('How do you add a staff record?', { selector: 'a' }) as HTMLAnchorElement;
        expect(link.getAttribute('ng-reflect-router-link')).toEqual('how-to-add-staff-records');
      });

      it('should call localstorage', async () => {
        const { getByRole, fixture } = await setup();

        const localStorageSpy = spyOn(localStorage, 'setItem');
        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['qAndASearchValue', 'staff']);
      });

      it('should show all the questions and answers and clear the input when "Show all questions and answers" is clicked', async () => {
        const { component, getByRole, getByText, getByTestId, fixture } = await setup();

        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();

        const showAllLinkQandAs = getByText('Show all questions and answers');
        userEvent.click(showAllLinkQandAs);
        fixture.detectChanges();

        expect(getByTestId('all-questions-and-answers')).toBeTruthy();
        expect(component.form.value.qAndASearch).toEqual('');
      });

      it('should clear localstorage when "Show all questions and answers" is clicked', async () => {
        const { getByText, getByRole, fixture } = await setup();

        const localStorageSpy = spyOn(localStorage, 'removeItem');
        const button = getByRole('button');
        userEvent.type(getByRole('textbox'), 'staff');
        userEvent.click(button);
        fixture.detectChanges();

        const showAllLinkQandAs = getByText('Show all questions and answers');
        userEvent.click(showAllLinkQandAs);
        fixture.detectChanges();

        expect(localStorageSpy).toHaveBeenCalledTimes(1);
        expect(localStorageSpy.calls.all()[0].args).toEqual(['qAndASearchValue']);
      });

      it('should not show the previous query if the previous url was not a question and answer page', async () => {
        const override = {
          previousUrl: '/help/get-started',
        };
        const { component } = await setup(override);

        const localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(undefined);
        component.ngOnInit();

        expect(localStorageSpy).toHaveBeenCalled();
        expect(component.form.value.qAndASearch).toEqual('');
      });

      it('should show the previous query if the previous url was a question and answer page', async () => {
        const override = {
          previousUrl: '/help/questions-and-answers/make-the-most-of',
        };
        const { component, fixture } = await setup(override);
        localStorage.setItem('qAndASearchValue', 'staff');
        fixture.detectChanges();

        const localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue('staff');
        component.ngOnInit();

        expect(localStorageSpy).toHaveBeenCalled();
        expect(component.form.value.qAndASearch).toBe('staff');
      });
    });

    it('should go to the page of the clicked suggested question', async () => {
      const { component, getByRole, getByTestId, fixture, routerSpy } = await setup();

      userEvent.type(getByRole('textbox'), 'staff');
      fixture.detectChanges();
      const trayList = getByTestId('tray-list');
      const listItem = within(trayList).getByText('How do you add a staff record?');

      userEvent.click(listItem);

      expect(routerSpy).toHaveBeenCalledWith(['./how-to-add-staff-records'], { relativeTo: component.route });
    });

    it('should remove the suggested tray on click of the search button', async () => {
      const { getByRole, queryByTestId, getByTestId, fixture } = await setup();

      const button = getByRole('button');
      userEvent.type(getByRole('textbox'), 'staff');
      fixture.detectChanges();

      const getTrayList = getByTestId('tray-list');
      expect(getTrayList).toBeTruthy();

      userEvent.click(button);
      fixture.detectChanges();

      const queryTrayList = queryByTestId('tray-list');
      expect(queryTrayList).toBeFalsy();
    });

    it('should match the amount of suggested with the amount of results after clicking search button', async () => {
      const { getByRole, getByTestId, fixture } = await setup();

      const button = getByRole('button');
      userEvent.type(getByRole('textbox'), 'workplace');
      fixture.detectChanges();

      const trayList = getByTestId('tray-list');
      const suggestedLength = trayList.querySelectorAll('li').length;

      userEvent.click(button);
      fixture.detectChanges();

      const matchingResults = getByTestId('matching-results');
      const searchLength = matchingResults.querySelectorAll('li').length;

      expect(suggestedLength).toEqual(searchLength);
    });
  });

  it('should find title that contains capital letters', async () => {
    const { getByRole, fixture, getByTestId } = await setup();

    const button = getByRole('button');
    userEvent.type(getByRole('textbox'), 'ASC');
    fixture.detectChanges();

    const trayList = getByTestId('tray-list');
    expect(within(trayList).getByText('How to make the most of ASC-WDS'));

    userEvent.click(button);
    fixture.detectChanges();

    const matchingResults = getByTestId('matching-results');

    expect(within(matchingResults).getByText('How to make the most of ASC-WDS')).toBeTruthy();
  });

  it('should find content that contains capital letters', async () => {
    const { getByRole, fixture, getByTestId } = await setup();

    const button = getByRole('button');
    userEvent.type(getByRole('textbox'), 'CQC');
    fixture.detectChanges();

    const trayList = getByTestId('tray-list');
    expect(within(trayList).getByText('Why should we share our data?'));

    userEvent.click(button);
    fixture.detectChanges();

    const matchingResults = getByTestId('matching-results');

    expect(within(matchingResults).getByText('Why should we share our data?')).toBeTruthy();
  });

  it('should show the matching titles first then content', async () => {
    const { getByRole, fixture, getByTestId } = await setup();

    const expectedResult = [
      'What workplace data is needed?',
      'What can you do as a parent workplace?',
      'Why should we share our data?',
    ];

    const button = getByRole('button');
    userEvent.type(getByRole('textbox'), 'workplace');
    fixture.detectChanges();

    userEvent.click(button);
    fixture.detectChanges();

    const matchingResultsList = within(getByTestId('matching-results')).queryAllByRole('listitem');

    expect(matchingResultsList[0].textContent).toEqual(expectedResult[0]);
    expect(matchingResultsList[1].textContent).toEqual(expectedResult[1]);
    expect(matchingResultsList[2].textContent).toEqual(expectedResult[2]);
  });
});
