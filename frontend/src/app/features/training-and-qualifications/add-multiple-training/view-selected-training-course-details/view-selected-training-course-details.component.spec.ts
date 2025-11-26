import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { ViewSelectedTrainingCourseDetailsComponent } from './view-selected-training-course-details.component';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

describe('ViewSelectedTrainingCourseDetailsComponent', () => {
  const workplace = {
    uid: '1',
  }

  let selectedTrainingCourse = {
    id: 2,
    uid: 'uid-2',
    trainingCategoryId: 2,
    name: 'Basic safeguarding for support staff',
    trainingCategoryName: 'Safeguarding adults',
    accredited: null,
    deliveredBy: DeliveredBy.ExternalProvider,
    externalProviderName: 'Care skills academy',
    otherTrainingProviderName: 'Care skills academy',
    howWasItDelivered: HowWasItDelivered.ELearning,
    validityPeriodInMonth: 12,
  }

  let courseCompletionDate = null;

  let previousNotes = null;
  const notes = "Hello";

  async function setup() {
    const setupTools = await render(ViewSelectedTrainingCourseDetailsComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, CommonModule, HttpClientTestingModule, RouterModule],
      providers: [
        BackLinkService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment: workplace,
              },
            },
          },
        },
        {
          provide: TrainingService,
          useValue: {
            getSelectedTrainingCourse() {
              return selectedTrainingCourse;
            },
            getCourseCompletionDate() {
              return courseCompletionDate;
            },
            setCourseCompletionDate() {
              return courseCompletionDate;
            },
            getNotes() {
              return previousNotes;
            },
            setNotes() {
              return notes;
            }
          },
        },
      ],
    });

    const injector = getTestBed();

    const backLinkService = injector.inject(BackLinkService) as BackLinkService;
    const showBackLinkSpy = spyOn(backLinkService, 'showBackLink');

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const setCourseCompletionDateSpy = spyOn(trainingService, 'setCourseCompletionDate');
    const setNotesSpy = spyOn(trainingService, 'setNotes');

    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      setCourseCompletionDateSpy,
      setNotesSpy,
      component,
      routerSpy,
      showBackLinkSpy,
      workplace,
    }
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`displays a Back link`, async () => {
    const { component, showBackLinkSpy, fixture } = await setup();

    component.ngOnInit();
    fixture.detectChanges();

    expect(showBackLinkSpy).toHaveBeenCalled();
  });

  it('should show the caption', async () => {
    const { getByTestId } = await setup();

    const caption = getByTestId('caption');

    expect(caption.textContent).toEqual('Add multiple training records');
  });

  it('should show the heading', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('heading');

    expect(heading.textContent).toEqual('Add training record details');
  });

  describe('Summary list of course details', () => {
    describe('Training course name', () => {
      it('should show the Training course name key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-course-name-key');
        expect(key.textContent.trim()).toEqual('Training course name');
      });

      it('should show the Training course name value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-course-name-value');
        expect(key.textContent.trim()).toEqual('Basic safeguarding for support staff');
      });

      describe('Select a different training course link', () => {
        it('should be displayed', async () => {
          const { getByTestId } = await setup();
          const link = getByTestId('different-training-course-link');
          expect(link.textContent.trim()).toEqual('Select a different training course');
        });

        it('should link to the previous page to select a training course', async () => {
          const { component, getByTestId } = await setup();
          const link = getByTestId('different-training-course-link');

          expect(link.getAttribute('href')).toEqual(
            `/workplace/${component.workplace.uid}/add-multiple-training/select-training-course`
          );
        });
      })
    })

    describe('Training category', () => {
      it('should show the Training category key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-category-key');
        expect(key.textContent.trim()).toEqual('Training category');
      });

      it('should show the Training category value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-category-value');
        expect(key.textContent.trim()).toEqual('Safeguarding adults');
      });
    })

    describe('Accreditation', () => {
      it('should show the Accreditation key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('accreditation-key');
        expect(key.textContent.trim()).toEqual('Is the training course accredited?');
      });

      it('should show the null Accreditation value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('accreditation-value');
        expect(key.textContent.trim()).toEqual('-');
      });
    })

    describe('Delivered by', () => {
      it('should show the Delivered by key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('delivered-by-key');
        expect(key.textContent.trim()).toEqual('Who delivered the training course?');
      });

      it('should show the Delivered by value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('delivered-by-value');
        expect(key.textContent.trim()).toEqual('External provider');
      });
    })

    describe('Training provider name', () => {
      it('should show the Training provider name key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-provider-name-key');
        expect(key.textContent.trim()).toEqual('Training provider name');
      });

      it('should show the Training provider name value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-provider-name-value');
        expect(key.textContent.trim()).toEqual('Care skills academy');
      });
    })

    describe('Course delivery method' , () => {
      it('should show the How was the training course delivered key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('course-delivery-method-key');
        expect(key.textContent.trim()).toEqual('How was the training course delivered?');
      });

      it('should show the How was the training course delivered value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('course-delivery-method-value');
        expect(key.textContent.trim()).toEqual('E-learning');
      });
    })

    describe('Training validity period' , () => {
      it('should show the How long is the training valid for key', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-validity-period-key');
        expect(key.textContent.trim()).toEqual('How long is the training valid for?');
      });

      it('should show the How long is the training valid for value', async () => {
        const { getByTestId } = await setup();
        const key = getByTestId('training-validity-period-value');
        expect(key.textContent.trim()).toEqual('12 months');
      });
    })
  })

  describe('Course completion date' , () => {
    it('should show the heading', async () => {
      const { getByTestId } = await setup();
      const key = getByTestId('course-completion-date-heading');
      expect(key.textContent.trim()).toEqual('Course completion date');
    });

    it('should show the hint', async () => {
      const { getByTestId } = await setup();
      const hint = getByTestId('course-completion-date-hint');
      expect(hint.textContent.trim()).toEqual('For example, 31 3 2024');
    });

    describe('When there are validation errors', () => {
      it('should not show an error message if the form has not been submitted', async () => {
        const { fixture, queryAllByText } = await setup();

        const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
        userEvent.type(dayInputBox, '01');
        fixture.detectChanges();

        const errorMessages = queryAllByText('Course completion date must be a valid date');
        expect(errorMessages.length).toEqual(0);
      })
    })

    describe('Population of fields', async () => {
      describe('When a date has previously been entered', () => {
        it('should populate the fields ', async () => {
          courseCompletionDate = new Date('2025-10-21')
          const { component } = await setup();

          expect(component.form.value.courseCompletionDate.day).toEqual(21);
          expect(component.form.value.courseCompletionDate.month).toEqual(10);
          expect(component.form.value.courseCompletionDate.year).toEqual(2025);
        });
      })

      describe('When a date has not previously been entered', () => {
        it('should not populate the fields ', async () => {
          courseCompletionDate = null;
          const { component } = await setup();

          expect(component.form.value.courseCompletionDate.day).toEqual(null);
          expect(component.form.value.courseCompletionDate.month).toEqual(null);
          expect(component.form.value.courseCompletionDate.year).toEqual(null);
        });
      })
    })
  })

  describe('Notes', () => {
    describe('When notes have been entered previously', () => {
      it('should populate the field', async () => {
        previousNotes = 'Hello, World!'
        const { component } = await setup();

        expect(component.form.value.notes).toEqual(previousNotes);
      });
    })

    describe('When notes have not been entered previously', () => {
      it('should not populate the field', async () => {
        const { component } = await setup();

        expect(component.form.value.notes).toEqual(previousNotes);
      });
    })
  })

  describe('Continue button', () => {
    it('should be displayed correctly', async () => {
      const { getByRole } = await setup();
      const button = getByRole('button', { name: 'Continue' });
      expect(button).toBeTruthy();
    })

    describe('When there are no validation errors', () => {
      describe('When a course completion date is entered', () => {
        it(`should call the training service with the course completion date`, async () => {
          const { fixture, getByRole, setCourseCompletionDateSpy } = await setup();

          const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
          const monthInputBox = fixture.nativeElement.querySelectorAll('input')[1];
          const yearInputBox = fixture.nativeElement.querySelectorAll('input')[2];

          const courseCompletionDateDay = '15';
          const courseCompletionDateMonth = '11';
          const courseCompletionDateYear = '2025';

          userEvent.type(dayInputBox, courseCompletionDateDay);
          userEvent.type(monthInputBox, courseCompletionDateMonth);
          userEvent.type(yearInputBox, courseCompletionDateYear);
          fixture.detectChanges();

          const button = getByRole('button', { name: 'Continue' });
          button.click();

          const date = new Date(`${courseCompletionDateYear}-${courseCompletionDateMonth}-${courseCompletionDateDay}`);

          expect(setCourseCompletionDateSpy).toHaveBeenCalledWith(date);
        });
      })

      describe('When a course completion date is not entered', () => {
        it('should call the training service', async () => {
          courseCompletionDate = null;
          const { getByRole, setCourseCompletionDateSpy } = await setup();

          const button = getByRole('button', { name: 'Continue' });
          button.click();

          expect(setCourseCompletionDateSpy).toHaveBeenCalledWith(courseCompletionDate);
        });
      })

      describe('When notes are entered', () => {
        it(`should call the training service with the notes`, async () => {
          previousNotes = null
          const { fixture, getByRole, setNotesSpy, getByTestId} = await setup();

          const arrow = getByTestId('notes-toggle-arrow');
          arrow.click();
          fixture.detectChanges();

          const textArea = getByTestId('text-area');
          userEvent.type(textArea, notes);
          fixture.detectChanges();

          const button = getByRole('button', { name: 'Continue' });
          button.click();

          expect(setNotesSpy).toHaveBeenCalledWith(notes);
        });
      })

      describe('When the notes field is blank', () => {
        it(`should call the training service with the notes`, async () => {
          const { getByRole, setNotesSpy } = await setup();

          const button = getByRole('button', { name: 'Continue' });
          button.click();

          expect(setNotesSpy).toHaveBeenCalledWith(null);
        });
      })

      it(`should navigate to the correct page`, async () => {
        courseCompletionDate = null;
        const { getByRole, routerSpy } = await setup();

        const button = getByRole('button', { name: 'Continue' });
        button.click();
        // to be updated when next page is developed
        expect(routerSpy).toHaveBeenCalledWith(['/']);
      });
    })


    describe('When there are validation errors', () => {
      it('should not navigate away from the page', async () => {
        courseCompletionDate = null;
        const { fixture, getByRole, routerSpy } = await setup();

        const dayInputBox = fixture.nativeElement.querySelector('input');
        userEvent.type(dayInputBox, '01');
        fixture.detectChanges();

        const button = getByRole('button', { name: 'Continue' });
        button.click();

        expect(routerSpy).not.toHaveBeenCalledWith(['/']);
      });

      describe('when only a day is entered in the completion date', () => {
        it('should raise the correct error message ', async () => {
          const { fixture, getByRole, getAllByText } = await setup();

          const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
          userEvent.type(dayInputBox, '20');
          fixture.detectChanges();

          const button = getByRole('button', { name: 'Continue' });
          button.click();
          fixture.detectChanges();

          const errorMessages = getAllByText('Course completion date must be a valid date');
          expect(errorMessages.length).toEqual(2);
        })
      })

      describe('when a future date is entered in the completion date', () => {
        it('should raise the correct error message ', async () => {
          jasmine.clock().install();
          const fakeDateToday = new Date('2025-12-15T12:00:00Z');
          jasmine.clock().mockDate(fakeDateToday);

          const { fixture, getByRole, getAllByText } = await setup();

          const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
          const monthInputBox = fixture.nativeElement.querySelectorAll('input')[1];
          const yearInputBox = fixture.nativeElement.querySelectorAll('input')[2];

          userEvent.type(dayInputBox, '01');
          userEvent.type(monthInputBox, '12');
          userEvent.type(yearInputBox, '2125');
          fixture.detectChanges();

          const button = getByRole('button', { name: 'Continue' });
          button.click();
          fixture.detectChanges();

          const errorMessages = getAllByText('Course completion date must be before 16 12 2025');

          expect(errorMessages.length).toEqual(2);
          jasmine.clock().uninstall();
        })
      })

      describe('when a date more than 100 years ago is entered in the completion date', () => {
        it('should raise the correct error message ', async () => {
          const { fixture, getByRole, getAllByText } = await setup();

          const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
          const monthInputBox = fixture.nativeElement.querySelectorAll('input')[1];
          const yearInputBox = fixture.nativeElement.querySelectorAll('input')[2];

          userEvent.type(dayInputBox, '01');
          userEvent.type(monthInputBox, '12');
          userEvent.type(yearInputBox, '1905');

          fixture.detectChanges();
          const button = getByRole('button', { name: 'Continue' });
          button.click();
          fixture.detectChanges();

          const errorMessages = getAllByText('Course completion date cannot be more than 100 years ago');
          expect(errorMessages.length).toEqual(2);
        })
      })

      describe('When more than 1000 characters are entered in the notes box', () => {
        it('should raise the correct error message ', async () => {
          const { fixture, getByTestId, getAllByText, getByRole } = await setup();
          const arrow = getByTestId('notes-toggle-arrow');
          arrow.click();
          fixture.detectChanges();

          const textArea = fixture.nativeElement.querySelector('textarea');
          const longString = 'H'.repeat(1005);

          userEvent.type(textArea, longString);
          fixture.detectChanges();

          const button = getByRole('button', { name: 'Continue' });
          button.click();
          fixture.detectChanges();

          const errorMessages = getAllByText('Notes must be 1000 characters or fewer');
          expect(errorMessages.length).toEqual(2);
        })
      })
    })
  })

  describe('Cancel link', () => {
    it('should be displayed correctly', async () => {
      const { getByRole } = await setup();
      const link = getByRole('link', { name: 'Cancel' });
      expect(link).toBeTruthy();
    });

    it('should have the correct href', async () => {
      const { getByRole } = await setup();
      const link = getByRole('link', { name: 'Cancel' });
      expect(link.getAttribute('href')).toEqual(
        `/dashboard#training-and-qualifications`,
      );
    });
  })

  describe('Page refresh', () => {
    it('Returns to page to select those you want to add a record for', async () => {
      const { component, routerSpy } = await setup();
      selectedTrainingCourse = null
      component.ngOnInit();
      expect(routerSpy).toHaveBeenCalledWith(
        [`workplace/${component.workplace.uid}/add-multiple-training/select-staff`]
      );
    });
  })
})
