import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { ErrorSummaryComponent } from './error-summary.component';

describe('ErrorSummaryComponent', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (override: any = {}) => {
    spyOn(ErrorSummaryComponent.prototype, 'getFormErrorMessage').and.stub();

    const setupTools = await render(ErrorSummaryComponent, {
      imports: [SharedModule, ReactiveFormsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
      componentProperties: {
        formErrorsMap: [],
        ...override,
      },
    });

    const component = setupTools.fixture.componentInstance;

    return {
      component,
      ...setupTools,
    };
  };

  describe('getFormErrors', () => {
    describe('for the error of any element in a formArray', () => {
      const buildMockForm = () => {
        const formBuilder = new UntypedFormBuilder();
        const mockFormArray = formBuilder.array([]);
        const mockInputValues = [0, 0, 0];
        mockInputValues.forEach((value) =>
          mockFormArray.push(formBuilder.control(value, [Validators.min(1), Validators.max(10)])),
        );
        const mockForm = formBuilder.group({ numbers: mockFormArray });
        return mockForm;
      };

      it('should not include an index number in the item key by default', async () => {
        // This is the existing behaviour before change.
        // Can't be sure if any component is depending on this,
        // so keep this behaviour as the default, and setup with addIndexKeyToFormArrayErrors=true only when needed
        const { component } = await setup({ form: buildMockForm() });

        component.form.setValue({ numbers: [0, 5, 20] });
        expect(component.errors).toEqual([
          { item: 'numbers', errors: ['min'] },
          { item: 'numbers', errors: ['max'] },
        ]);
      });

      it('should includes an index number in the item key if addIndexKeyToFormArrayErrors is true', async () => {
        const { component } = await setup({ form: buildMockForm(), addIndexKeyToFormArrayErrors: true });
        component.form.setValue({ numbers: [0, 5, 20] });
        expect(component.errors).toEqual([
          { item: 'numbers.0', errors: ['min'] },
          { item: 'numbers.2', errors: ['max'] },
        ]);
      });
    });
  });

  describe('focus on click', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setup = async (overrides: any = {}) => {
      const formBuilder = new UntypedFormBuilder();
      const mockForm = formBuilder.group({ someInput: ['', Validators.required] });
      const formErrorsMap = [
        {
          item: 'someInput',
          type: [
            {
              name: 'required',
              message: 'some error message',
            },
          ],
        },
      ];

      const querySelectorOverride = overrides.querySelectorForOnClickFocus
        ? `querySelectorForOnClickFocus=${overrides.querySelectorForOnClickFocus}`
        : '';

      const mockTemplate = `
      <app-error-summary
        *ngIf="submitted && form.invalid"
        [formErrorsMap]="formErrorsMap"
        [serverError]="serverError"
        [form]="form"
        ${querySelectorOverride}
    >
      </app-error-summary>
      <form #formEl [formGroup]="form">
        <div>
        <p *ngIf="submitted && form.get('someInput').errors"
            id="someInput-error"
          > inline error message </p>
          <button type="button">a button</button>
          <input id="text-input" name="text-input" type="text"/>
        </div>
      </form>
    `;

      const setupTools = await render(mockTemplate, {
        imports: [SharedModule, ReactiveFormsModule],
        declarations: [ErrorSummaryComponent],
        componentProperties: { form: mockForm, formErrorsMap, submitted: true },
        providers: [
          ErrorSummaryService,
          {
            provide: ActivatedRoute,
            useValue: {
              snapshot: {},
            },
          },
        ],
      });

      const fixture = setupTools.fixture;
      const component = fixture.componentInstance;

      const injector = getTestBed();
      const errorSummaryService = injector.inject(ErrorSummaryService) as ErrorSummaryService;

      const formEl = { nativeElement: fixture.nativeElement.querySelector('form') };
      errorSummaryService.formEl$.next(formEl);

      const button = setupTools.getByRole('button');
      const textInput = setupTools.getByRole('textbox');
      const buttonFocusSpy = spyOn(button, 'focus');
      const textInputFocusSpy = spyOn(textInput, 'focus');

      return { ...setupTools, component, fixture, mockForm, errorSummaryService, buttonFocusSpy, textInputFocusSpy };
    };

    it('should focus on the first input element when error message is clicked (default behaviour)', async () => {
      const { fixture, getByText, textInputFocusSpy, buttonFocusSpy } = await setup();
      fixture.autoDetectChanges();

      userEvent.click(getByText('some error message'));

      await fixture.whenStable();

      expect(textInputFocusSpy).toHaveBeenCalled();
      expect(buttonFocusSpy).not.toHaveBeenCalled();
    });

    it('should be able to focus on other types of html element, when a different querySelector is provided', async () => {
      const { fixture, getByText, textInputFocusSpy, buttonFocusSpy } = await setup({
        querySelectorForOnClickFocus: 'button,input,select,textarea',
      });
      fixture.autoDetectChanges();

      userEvent.click(getByText('some error message'));

      await fixture.whenStable();

      expect(buttonFocusSpy).toHaveBeenCalled();
      expect(textInputFocusSpy).not.toHaveBeenCalled();
    });
  });

  describe('when serverError is provided', () => {
    const buildMockForm = () => {
      const formBuilder = new UntypedFormBuilder();
      return formBuilder.group({ textField: ['', null] });
    };

    it('should show a link with the server error message by default', async () => {
      const { getByRole } = await setup({
        form: buildMockForm(),
        serverError: 'Some error message from server',
      });

      const errorMessage = getByRole('link', { name: 'Some error message from server' });
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.getAttribute('href')).toEqual('/#server-error');
    });

    it('should show the server error message as non-clickable text if showServerErrorAsLink is false', async () => {
      const { getByText, queryByRole } = await setup({
        form: buildMockForm(),
        serverError: 'Some error message from server',
        showServerErrorAsLink: false,
      });

      expect(getByText('Some error message from server')).toBeTruthy();
      expect(queryByRole('link', { name: 'Some error message from server' })).toBeFalsy();
      expect(getByText('Some error message from server').getAttribute('href')).toEqual(null);
    });
  });
});
