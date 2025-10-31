
import { render, fireEvent } from '@testing-library/angular';

import { IncludeTrainingCourseDetailsComponent } from './include-training-course-details.component';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkersModule } from '@features/workers/workers.module';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, RouterModule } from '@angular/router';
import { getTestBed } from '@angular/core/testing';

describe('IncludeTrainingCourseDetailsComponent', () => {
  const workplace = {
    uid: '1',
  }
  const worker = {
    uid: 123,
    nameOrId: 'John',
    mainJob: {
      title: 'Care Worker',
    },
  }

  const trainingRecord = {
    title: 'Basic safeguarding for support staff',
    uid: 910,
  }

  const oneTrainingCourse =  {
    id:   1,
    name: 'Deprivation of liberty standards',
  }

  const multipleTrainingCourses = [
    {
      id:   1,
      name: "Deprivation of liberty standards",
    },
    {
      id:    2,
      name: "Basic safeguarding for support staff",
    },
    {
      id:   3,
      name: "Basic safeguarding for managers and leads",
    },
  ]

  const mockDataObject = {
    imports: [WorkersModule, HttpClientTestingModule],
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              establishment: workplace,
              worker: worker,
              trainingRecord: trainingRecord,
              trainingCourses: [oneTrainingCourse],
            },
          },
        },
      },
    ],
  }

  async function setup() {
    const setupTools = await render(IncludeTrainingCourseDetailsComponent, mockDataObject
  );

    const component = setupTools.fixture.componentInstance;

    // const injector = getTestBed();
    // const router = injector.inject(Router) as Router;
    // const routerSpy = spyOn(router, 'navigate');
    // routerSpy.and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      worker,
      workplace,
      // routerSpy,
    };
  }

  describe('page render', () => {
    it('should render a IncludeTrainingCourseDetailsComponent', async () => {
      const { component } = await setup();
      expect(component).toBeTruthy();
    });

    it('should display the worker name', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId("workerName");
      expect(heading.textContent).toEqual('John');
    });

    it('should display the correct page heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId("page-heading");
      expect(heading.textContent).toEqual('Select a training course');
    });

    describe('Additional details section', () => {
      it('should display the dropdown toggle', async () => {
        const { getByTestId } = await setup();
        const toggle = getByTestId('details-toggle');
        expect(toggle.textContent).toEqual(' Why is it a good idea to update records with training course details? ');
      });

      it('should hide the additional details initially', async () => {
        const { getByTestId } = await setup();
        const details = getByTestId('additional-details');
        expect(details.hasAttribute('open')).toBeFalsy();
      });

      it('should display the additional details after clicking on the toggle', async () => {
        const { getByTestId, fixture} = await setup();
        getByTestId('details-toggle').click();
        fixture.detectChanges();
        const details = getByTestId('additional-details');
        expect(details.hasAttribute('open')).toBeTruthy();
      });

      it('should display the additional details after clicking on the toggle', async () => {
        const { getByTestId, fixture} = await setup();
        getByTestId('details-toggle').click();
        fixture.detectChanges();
        const details = getByTestId('additional-details');
        expect(details.hasAttribute('open')).toBeTruthy();
      });
    })

    describe('Training record', () => {
      it('should display the header', async () => {
        const { getByTestId } = await setup();
        const header = getByTestId('training-record-heading');
        expect(header.textContent).toContain('Training record name');
      })

      it('should contain the name of the training record', async () => {
        const { getByTestId } = await setup();
        const name = getByTestId('training-record-name');
        expect(name.textContent).toContain('Basic safeguarding for support staff');
      })
    });

    describe('Training course name options',() => {
      it('should display the header', async () => {
        const { getByTestId } = await setup();
        const name = getByTestId('training-course-heading');
        expect(name.textContent).toContain('Training course name');
      })

      describe('When a single course matches the training record', () => {
        it('should display the correct course related to the training record as a checkbox', async () => {
          const { getByTestId, queryAllByRole } = await setup();
          const name = getByTestId('checkbox-label');
          const radioOptions = queryAllByRole('radio')

          expect(name.textContent).toContain('Deprivation of liberty standards');
          expect(radioOptions.length).toBe(0);
        })
      });

      describe('When multiple courses match the training record', () => {
        it('should display the correct courses related to the training record as radios', async () => {
          mockDataObject.providers[0].useValue.snapshot.data.trainingCourses = [
            {
              id:   1,
              name: "Deprivation of liberty standards",
            },
            {
              id:    2,
              name: "Basic safeguarding for support staff",
            },
            {
              id:   3,
              name: "Basic safeguarding for managers and leads",
            },
          ]

          const { queryAllByRole, queryByTestId } = await setup();
          const name = queryByTestId('training-course-name-checkbox');
          const radioOptions = queryAllByRole('radio');

          expect(name).toBe(null);
          expect(radioOptions.length).toBe(3);
        })
      });
    });

    describe('Continue button', () => {
      it('should be displayed correctly', async () => {
        const { queryByTestId } = await setup();
        const button = queryByTestId('continue-button');
        expect(button.textContent).toContain('Continue');
      });

      describe('When page has a course selection checkbox', () => {
        it('should have the correct href when the checkbox has been ticked', async () => {
          mockDataObject.providers[0].useValue.snapshot.data.trainingCourses = [oneTrainingCourse]
          const { getByTestId, queryAllByRole } = await setup();
          const checkbox = getByTestId('training-course-name-checkbox') as HTMLInputElement;
          const button = getByTestId('continue-button');
          await fireEvent.click(checkbox);

          expect(checkbox.checked).toBeTruthy();
          expect(button.getAttribute('href')).toEqual(
            `/`,
          );
        })

        it('should have the correct href when the checkbox has not been ticked', async () => {
          mockDataObject.providers[0].useValue.snapshot.data.trainingCourses = [oneTrainingCourse]
          const { getByTestId, queryAllByRole } = await setup();
          const checkbox = getByTestId('training-course-name-checkbox') as HTMLInputElement;
          const button = getByTestId('continue-button');

          expect(checkbox.checked).toBeFalse();
          expect(button.getAttribute('href')).toEqual(
            `/workplace/${workplace.uid}/training-and-qualifications-record/${worker.uid}/training/${trainingRecord.uid}`,
          );
        })
      })

      describe('When page has course selection radios', () => {
        it('should have the correct href when a radio has been selected', async () => {
          mockDataObject.providers[0].useValue.snapshot.data.trainingCourses = multipleTrainingCourses

          const { getByTestId } = await setup();
          const radio = getByTestId(`radio-${multipleTrainingCourses[0].id}`);
          await fireEvent.click(radio);

          const button = getByTestId('continue-button');
          expect(button.getAttribute('href')).toEqual(
            `/`,
          );
        })

        it('should have the correct href when a radio has not been selected', async () => {
          mockDataObject.providers[0].useValue.snapshot.data.trainingCourses = multipleTrainingCourses
          const { getByTestId } = await setup();
          const button = getByTestId('continue-button');

          expect(button.getAttribute('href')).toEqual(
            `/workplace/${workplace.uid}/training-and-qualifications-record/${worker.uid}/training/${trainingRecord.uid}`,
          );
        })
      })
    })

    describe('Cancel link', () => {
      it('should be displayed correctly', async () => {
        const { queryByTestId } = await setup();
        const link = queryByTestId('cancel-link');
        expect(link.textContent).toContain('Cancel');
      });

      it('should have the correct href', async () => {
        const { queryByTestId } = await setup();
        const link = queryByTestId('cancel-link');
        expect(link.getAttribute('href')).toEqual(
          `/workplace/${workplace.uid}/training-and-qualifications-record/${worker.uid}/training/${trainingRecord.uid}`,
        );
      });
    })
  })
})
