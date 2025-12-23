import { getTestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { DatePickerComponent } from './date-picker.component';
import { SharedModule } from '@shared/shared.module';
import { FormBuilder, FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

describe('DatePickerComponent', () => {
  async function setup() {

    const formBuilder = new FormBuilder();
    const inputForm :UntypedFormGroup = formBuilder.group({
      date: formBuilder.group({
        day: [''],
        month: [''],
        year: [''],
      })
    })

    const setupTools = await render(DatePickerComponent, {
      imports: [SharedModule, ReactiveFormsModule, FormsModule, CommonModule],
      componentProperties: {
        formGroup: inputForm,
        formGroupName: 'date',
        submitted: false,
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

  describe('Input label', async () => {
    it('should show the day label', async () => {
      const { getByText } = await setup();
      expect(getByText('Day')).toBeTruthy();
    });

    it('should show the month label', async () => {
      const { getByText } = await setup();
      expect(getByText('Month')).toBeTruthy();
    });

    it('should show the year label', async () => {
      const { getByText } = await setup();
      expect(getByText('Year')).toBeTruthy();
    });
  })

  describe('Capture of data input', async () => {
    it('should show the correct form values', async () => {
      const { component, fixture } = await setup();

      const dayInputBox = fixture.nativeElement.querySelectorAll('input')[0];
      const monthInputBox = fixture.nativeElement.querySelectorAll('input')[1];
      const yearInputBox = fixture.nativeElement.querySelectorAll('input')[2];

      const day = '15';
      const month = '11';
      const year = '2025';

      dayInputBox.value = day;
      dayInputBox.dispatchEvent(new Event('input'));

      monthInputBox.value = month;
      monthInputBox.dispatchEvent(new Event('input'));

      yearInputBox.value = year;
      yearInputBox.dispatchEvent(new Event('input'));

      fixture.detectChanges();
      expect(component.formGroup.value.date.day).toEqual(15);
      expect(component.formGroup.value.date.month).toEqual(11);
      expect(component.formGroup.value.date.year).toEqual(2025);
    })
  })
})
