import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-for-workplace',
  templateUrl: './search-for-workplace.component.html',
})
export class SearchForWorkplaceComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;

  constructor(public formBuilder: FormBuilder) {}
  ngOnInit(): void {
    this.setupForm();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: '',
      postcode: '',
      workplaceId: '',
      locationId: '',
      providerId: '',
    });
  }

  public onSubmit(): void {
    console.log('onSubmit');
  }
}
