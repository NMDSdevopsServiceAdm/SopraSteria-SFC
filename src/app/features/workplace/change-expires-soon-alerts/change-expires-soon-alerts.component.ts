import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-change-expires-soon-alerts',
  templateUrl: './change-expires-soon-alerts.component.html',
})
export class ChangeExpiresSoonAlertsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public expiresSoonDate: string;

  constructor(private formBuilder: FormBuilder) {}

  public ngOnInit(): void {
    this.expiresSoonDate = '90';
    this.setupForm();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      expiresSoonAlerts: this.formBuilder.control(this.expiresSoonDate),
    });
  }
}
