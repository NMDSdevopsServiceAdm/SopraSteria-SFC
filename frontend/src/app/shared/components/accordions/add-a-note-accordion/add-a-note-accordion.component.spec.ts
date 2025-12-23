import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { AddANoteAccordionComponent } from './add-a-note-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import userEvent from '@testing-library/user-event';
import { Router } from '@angular/router';

describe('AddANoteAccordionComponent', () => {
  let errorMessage = '';
  let notes: UntypedFormControl;
  notes = new UntypedFormControl();

  async function setup() {
    const setupTools = await render(AddANoteAccordionComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, CommonModule],
      componentProperties: {
        errorMessage: errorMessage,
        notes: notes,
      },
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
        notes = new UntypedFormControl();
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
    })

    describe('Error message handling', () => {
      it('should show the correct error message when no input is given', async () => {
        const { component } = await setup();
        expect(component.errorMessage).toEqual(errorMessage);
      })

      it('should show the correct error message when an input is given', async () => {
        errorMessage = 'An error occurred';
        const { component } = await setup();
        expect(component.errorMessage).toEqual(errorMessage);
      })
    })

    describe('When the notes form is not pre-filled', () => {
      it('should show the accordion as closed', async () => {
        notes = new UntypedFormControl();
        const { component } = await setup();
        expect(component.notesOpen).toEqual(false);
      })

      it('should show the remaining characters reminder correctly', async () => {
        notes = new UntypedFormControl();
        const { getByTestId } = await setup();

        const reminder = getByTestId('character-count-reminder');
        expect(reminder.textContent.trim()).toContain('You have 1,000 characters remaining');
      })
    })

    describe('When the notes form is pre-filled', () => {
      it('should show the accordion as open', async () => {
        notes = new UntypedFormControl('Hello');
        const { component } = await setup();
        expect(component.notesOpen).toEqual(true);
      })

      it('should show the remaining characters reminder correctly', async () => {
        notes = new UntypedFormControl('Hello');
        const { getByTestId } = await setup();

        const reminder = getByTestId('character-count-reminder');
        expect(reminder.textContent.trim()).toContain('You have 995 characters remaining');
      })
    })
  })
})
