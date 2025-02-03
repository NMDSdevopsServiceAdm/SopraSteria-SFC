import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { QuestionsAndAnswersComponent } from './questions-and-answers.component';

describe('QuestionsAndAnswersComponent', () => {
  async function setup() {
    const questionsAndAnswersData = [
      {
        section_heading: 'Get more from ASC-WDS',
        sub_sections: [],
        q_and_a_pages: [
          { title: 'How to make the most of ASC-WDS', slug: 'make-the-most' },
          { title: 'How can benchmarks benefit your business?', slug: 'benefit-from-benchmarks' },
        ],
      },
      {
        section_heading: 'Helping you and the sector',
        sub_sections: [
          {
            sub_section_heading: 'Workplace',
            q_and_a_pages: [
              { title: 'What workplace data is needed?', slug: 'needed-workplace-data' },
              { title: 'What can you do as a parent workplace?', slug: 'what-can-parents-do' },
            ],
          },
          {
            sub_section_heading: 'Staff records',
            q_and_a_pages: [{ title: 'How do you add a staff record?', slug: 'how-to-add-staff-records' }],
          },
          {
            sub_section_heading: 'Benchmarks',
            q_and_a_pages: [{ title: 'What are benchmarks?', slug: 'what-are-benchmarks' }],
          },
        ],
      },
    ];

    const setupTools = await render(QuestionsAndAnswersComponent, {
      imports: [RouterTestingModule],
      providers: [
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
      ],
    });

    return {
      ...setupTools,
      component: setupTools.fixture.componentInstance,
      questionsAndAnswersData,
    };
  }

  it('should create the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
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
