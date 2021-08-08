import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-local-authority',
  templateUrl: './local-authority.component.html',
})
export class LocalAuthorityComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.setupForm();
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      numberOfWorkers: [''],
      status: [''],
      notes: [''],
    });
  }

  public onSubmit(): void {
    console.log('submit');
  }
}
