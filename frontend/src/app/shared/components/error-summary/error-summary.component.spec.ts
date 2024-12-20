import { ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { ErrorSummaryComponent } from './error-summary.component';

describe('ErrorSummaryComponent', () => {
  describe('getFormErrors', () => {
    describe('for the error of any element in a formArray', () => {
      const setup = async (override: any = {}) => {
        const formBuilder = new UntypedFormBuilder();
        const mockFormArray = formBuilder.array([]);
        const mockInputValues = [0, 0, 0];
        mockInputValues.forEach((value) =>
          mockFormArray.push(formBuilder.control(value, [Validators.min(1), Validators.max(10)])),
        );
        const mockForm = formBuilder.group({ numbers: mockFormArray });

        spyOn(ErrorSummaryComponent.prototype, 'getFormErrorMessage').and.stub();

        const { fixture } = await render(ErrorSummaryComponent, {
          imports: [SharedModule, ReactiveFormsModule],
          providers: [
            {
              provide: ActivatedRoute,
              useValue: {},
            },
          ],
          componentProperties: {
            form: mockForm,
            formErrorsMap: [],
            ...override,
          },
        });

        const component = fixture.componentInstance;

        return {
          component,
        };
      };

      it('should not include an index number in the item key by default', async () => {
        // This is the existing behaviour before change.
        // Can't be sure if any component is depending on this,
        // so keep this behaviour as the default, and setup with addIndexKeyToFormArrayErrors=true only when needed
        const { component } = await setup();

        component.form.setValue({ numbers: [0, 5, 20] });
        expect(component.errors).toEqual([
          { item: 'numbers', errors: ['min'] },
          { item: 'numbers', errors: ['max'] },
        ]);
      });

      it('should includes an index number in the item key if addIndexKeyToFormArrayErrors is true', async () => {
        const { component } = await setup({ addIndexKeyToFormArrayErrors: true });
        component.form.setValue({ numbers: [0, 5, 20] });
        expect(component.errors).toEqual([
          { item: 'numbers.0', errors: ['min'] },
          { item: 'numbers.2', errors: ['max'] },
        ]);
      });
    });
  });
});
