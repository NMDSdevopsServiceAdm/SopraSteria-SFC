import { render } from '@testing-library/angular';
import { CharacterCountComponent } from './character-count.component';
import { SharedModule } from '@shared/shared.module';
import { FormControl, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { getTestBed } from '@angular/core/testing';
import { repeat } from 'lodash';

fdescribe('CharacterCountComponent', () => {
  const setup = async () => {
    const formBuilder = new UntypedFormBuilder();
    const mockFormGroup = formBuilder.group({ textInput: [''] });
    const textFormControl = mockFormGroup.get('textInput') as FormControl;
    const defaultConfigs = { max: 200, words: false };

    const setupTools = await render(CharacterCountComponent, {
      imports: [SharedModule, ReactiveFormsModule],
      componentProperties: {
        control: textFormControl,
        ...defaultConfigs,
      },
    });
    const fixture = setupTools.fixture;
    const component = setupTools.fixture.componentInstance;

    return { ...setupTools, component, fixture, mockFormGroup };
  };

  describe('With form control as input', () => {
    it('should show a string "You have x character(s) remaining"', async () => {
      const { fixture, mockFormGroup, getByText } = await setup();

      expect(getByText('You have 200 characters remaining')).toBeTruthy();

      mockFormGroup.setValue({ textInput: 'some random text' });
      fixture.detectChanges();
      expect(getByText('You have 184 characters remaining')).toBeTruthy();

      mockFormGroup.setValue({ textInput: repeat('a', 199) });
      fixture.detectChanges();
      expect(getByText('You have 1 character remaining')).toBeTruthy();
    });

    it('should show a string "you have x character(s) too many" when input text exceeds the allowed max length', async () => {
      const { fixture, mockFormGroup, getByText } = await setup();

      mockFormGroup.setValue({ textInput: repeat('a', 201) });
      fixture.detectChanges();
      expect(getByText('You have 1 character too many')).toBeTruthy();

      mockFormGroup.setValue({ textInput: repeat('a', 210) });
      fixture.detectChanges();
      expect(getByText('You have 10 characters too many')).toBeTruthy();
    });

    it('should correctly handle the case when user cleared the input text', async () => {
      const { fixture, mockFormGroup, getByText } = await setup();

      mockFormGroup.setValue({ textInput: 'some text' });
      fixture.detectChanges();
      expect(getByText('You have 191 characters remaining')).toBeTruthy();

      mockFormGroup.setValue({ textInput: '' });
      fixture.detectChanges();
      expect(getByText('You have 200 characters remaining')).toBeTruthy();
    });
  });
});
