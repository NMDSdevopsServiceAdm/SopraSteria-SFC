import { repeat } from 'lodash';

import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { CharacterCountComponent } from './character-count.component';

describe('CharacterCountComponent', () => {
  const setupWithFormControlAsInput = async (override: any = {}) => {
    // This is the existing usage of this component which requires a form control object passed in as input.
    // Cannot work with form controls with option {updateOn: 'submit'}
    const setupConfigs = { words: false, max: 200, ...override };

    const formBuilder = new UntypedFormBuilder();
    const mockFormGroup = formBuilder.group({ textInput: [''] });
    const textFormControl = mockFormGroup.get('textInput') as FormControl;

    const setupTools = await render(CharacterCountComponent, {
      imports: [SharedModule, ReactiveFormsModule],
      componentProperties: {
        control: textFormControl,
        words: setupConfigs.words,
        max: setupConfigs.max,
      },
    });
    const fixture = setupTools.fixture;
    const component = setupTools.fixture.componentInstance;

    const updateTextValue = (newText: string) => {
      mockFormGroup.setValue({ textInput: newText });
    };

    return { ...setupTools, component, fixture, updateTextValue };
  };

  const setupWithTextAsInput = async (override: any = {}) => {
    // A new option to pass in the input text as a plain string instead. This can co-exist with option {updateOn: 'submit'}.
    const setupConfigs = { words: false, max: 200, ...override };

    const templateString = `
      <app-character-count [max]="max" [words]="words" [textToCount]="textToCount" />`;

    const setupTools = await render(templateString, {
      imports: [SharedModule, ReactiveFormsModule],
      declarations: [CharacterCountComponent],
      componentProperties: {
        textToCount: null,
        words: setupConfigs.words,
        max: setupConfigs.max,
      },
    });
    const fixture = setupTools.fixture;
    const component = setupTools.fixture.componentInstance;

    const updateTextValue = (newText: string) => {
      component['textToCount'] = newText;
    };

    return { ...setupTools, component, fixture, updateTextValue };
  };

  const testSuites = [
    {
      testSuiteName: 'With form control as input',
      setup: setupWithFormControlAsInput,
    },
    {
      testSuiteName: 'With plain text as input',
      setup: setupWithTextAsInput,
    },
  ];

  testSuites.forEach(({ testSuiteName, setup }) => {
    describe(testSuiteName, () => {
      it('should show a string "You have x character(s) remaining"', async () => {
        const { fixture, getByText, updateTextValue } = await setup();

        expect(getByText('You have 200 characters remaining')).toBeTruthy();

        updateTextValue('some random text');
        fixture.detectChanges();
        expect(getByText('You have 184 characters remaining')).toBeTruthy();

        updateTextValue(repeat('a', 199));
        fixture.detectChanges();
        expect(getByText('You have 1 character remaining')).toBeTruthy();
      });

      it('should show a string "you have x character(s) too many" when input text exceeds the allowed max length', async () => {
        const { fixture, getByText, updateTextValue } = await setup();

        updateTextValue(repeat('a', 201));
        fixture.detectChanges();
        expect(getByText('You have 1 character too many')).toBeTruthy();

        updateTextValue(repeat('a', 210));
        fixture.detectChanges();
        expect(getByText('You have 10 characters too many')).toBeTruthy();
      });

      it('should correctly handle the case when user cleared the input text', async () => {
        const { fixture, getByText, updateTextValue } = await setup();

        updateTextValue('some text');
        fixture.detectChanges();
        expect(getByText('You have 191 characters remaining')).toBeTruthy();

        updateTextValue(null);
        fixture.detectChanges();
        expect(getByText('You have 200 characters remaining')).toBeTruthy();
      });

      it('should count words instead of characters when words = true is given', async () => {
        const { fixture, getByText, updateTextValue } = await setup({ words: true, max: 20 });

        expect(getByText('You have 20 words remaining')).toBeTruthy();

        updateTextValue('some random text');
        fixture.detectChanges();
        expect(getByText('You have 17 words remaining')).toBeTruthy();

        updateTextValue(repeat('some random text ', 7));
        fixture.detectChanges();
        expect(getByText('You have 1 word too many')).toBeTruthy();
      });
    });
  });
});
