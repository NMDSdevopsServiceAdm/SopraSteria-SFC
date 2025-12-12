import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { HttpClientTestingModule} from '@angular/common/http/testing';
import { AddANoteAccordionComponent } from './add-a-note-accordion.component';
import { BackLinkService } from '@core/services/backLink.service';
import { TrainingService } from '@core/services/training.service';
import { DeliveredBy, HowWasItDelivered } from '@core/model/training.model';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';

fdescribe('AddANoteAccordionComponent', () => {
  async function setup() {
    const notes = new UntypedFormControl();

    const setupTools = await render(AddANoteAccordionComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, CommonModule, HttpClientTestingModule, RouterModule],
      componentProperties: {
        notes: notes,
      },
      providers: [
        // {
        //   provide: ActivatedRoute,
        //   useValue: {
        //     snapshot: {
        //       data: {
        //         establishment: workplace,
        //       },
        //     },
        //   },
        // },
      ],
    });

    const injector = getTestBed();


    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const component = setupTools.fixture.componentInstance;

    return {
      ...setupTools,
      component,
      routerSpy,
    }
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the heading', async () => {
    const { getByTestId } = await setup();

    const heading = getByTestId('notes-heading');

    expect(heading.textContent.trim()).toEqual('Add a note');
  });

  describe('Notes', () => {
    it('should show the Add a note heading', async () => {
      const { getByTestId } = await setup();
      const heading = getByTestId('notes-heading');
      expect(heading.textContent.trim()).toEqual('Add a note');
    })

    it('should show the open notes toggle label', async () => {
      const { getByTestId } = await setup();
      const label = getByTestId('notes-toggle-label');
      expect(label.textContent).toEqual('Open notes');
    })

    it('should show the down arrow on the notes toggle', async () => {
      const { getByTestId } = await setup();

      const arrow = getByTestId('notes-toggle-arrow');
      expect(arrow.classList).toContain('govuk-accordion-nav__chevron--down');
      expect(arrow.classList).not.toContain('govuk-accordion-nav__chevron--up');
    })

    describe('After clicking on the Notes toggle', () => {
      it('should show the close notes toggle label', async () => {
        const { fixture, getByTestId } = await setup();

        const label = getByTestId('notes-toggle-label');
        label.click();
        fixture.detectChanges();

        expect(label.textContent).toEqual('Close notes');
      })

      it('should show the down arrow on the notes toggle', async () => {
        const { fixture, getByTestId } = await setup();

        const arrow = getByTestId('notes-toggle-arrow');
        arrow.click();
        fixture.detectChanges();

        expect(arrow.classList).toContain('govuk-accordion-nav__chevron--up');
        expect(arrow.classList).not.toContain('govuk-accordion-nav__chevron--down');
      })

      it('should show the remaining characters reminder', async () => {
        const { fixture, getByTestId } = await setup();

        const arrow = getByTestId('notes-toggle-arrow');
        arrow.click();
        fixture.detectChanges();

        const reminder = getByTestId('character-count-reminder');
        expect(reminder.textContent.trim()).toContain('You have 1,000 characters remaining');
      })

      it('should show the remaining characters reminder change as text is entered', async () => {
        const { fixture, getByTestId } = await setup();
        const arrow = getByTestId('notes-toggle-arrow');
        arrow.click();
        fixture.detectChanges();

        const textArea = getByTestId('text-area');
        userEvent.type(textArea, 'Hello');
        fixture.detectChanges();

        const reminder = getByTestId('character-count-reminder');
        expect(reminder.textContent.trim()).toContain('You have 995 characters remaining');
      })

      it('should show a reminder when more than 1000 characters have been entered', async () => {
        const { fixture, getByTestId } = await setup();
        const arrow = getByTestId('notes-toggle-arrow');
        arrow.click();
        fixture.detectChanges();

        const textArea = getByTestId('text-area');
        const longString = 'H'.repeat(1005);
        userEvent.type(textArea, longString);
        fixture.detectChanges();

        const reminder = getByTestId('character-count-reminder');
        expect(reminder.textContent.trim()).toContain('You have 5 characters too many');
      })
    //   error messages as input
    })
  })
})
