import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { QuestionsAndAnswersComponent } from './questions-and-answers.component';

describe('QuestionsAndAnswersComponent', () => {
  async function setup() {
    const questionsAndAnswersData = [
      { section_heading: 'Get more from ASC-WDS', sub_sections: [] },
      {
        section_heading: 'Helping you and the sector',
        sub_sections: [
          { sub_section_heading: 'Workplace' },
          { sub_section_heading: 'Staff records' },
          { sub_section_heading: 'Benchmarks' },
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
});
