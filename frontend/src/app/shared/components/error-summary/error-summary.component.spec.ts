import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ErrorSummaryComponent } from './error-summary.component';

describe('ErrorSummaryComponent', () => {
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
