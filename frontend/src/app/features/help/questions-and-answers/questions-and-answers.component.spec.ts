import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { QuestionsAndAnswersComponent } from './questions-and-answers.component';

describe('QuestionsAndAnswersComponent', () => {
  async function setup() {
    const questionsAndAnswersData = [
      { section_heading: 'Get more from ASC-WDS' },
      { section_heading: 'Helping you and the sector' },
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
});
