import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SetDates } from '@core/model/admin/local-authorities-return.model';
import { LocalAuthoritiesReturnService } from '@core/services/admin/local-authorities-return/local-authorities-return.service';
import { DateValidator } from '@shared/validators/date.validator';

@Component({
  selector: 'app-set-dates',
  templateUrl: './set-dates.component.html',
})
export class SetDatesComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public submitted: boolean;
  public serverError: boolean;

  constructor(private formBuilder: FormBuilder, private localAuthoritiesReturnService: LocalAuthoritiesReturnService) {}

  ngOnInit(): void {
    this.setupForm();
  }

  setupForm(): void {
    this.form = this.formBuilder.group({
      laReturnStartDate: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
      laReturnEndDate: this.formBuilder.group({
        day: null,
        month: null,
        year: null,
      }),
    });
    this.form.get('laReturnStartDate').setValidators([DateValidator.dateValid()]);
    this.form.get('laReturnEndDate').setValidators([DateValidator.dateValid()]);
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const { year: startYear, month: startMonth, day: startDay } = this.form.get('laReturnStartDate').value;
      const { year: endYear, month: endMonth, day: endDay } = this.form.get('laReturnEndDate').value;

      const laReturnDates: SetDates = {
        laReturnStartDate: new Date(`${startYear}-${startMonth}-${startDay}`),
        laReturnEndDate: new Date(`${endYear}-${endMonth}-${endDay}`),
      };

      this.localAuthoritiesReturnService.setDates(laReturnDates).subscribe();
    }
  }
}
