import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-change-expires-soon-alerts',
  templateUrl: './change-expires-soon-alerts.component.html',
})
export class ChangeExpiresSoonAlertsComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  public expiresSoonDate: string;

  constructor(private formBuilder: FormBuilder, private backService: BackService, private router: Router) {}

  public ngOnInit(): void {
    this.expiresSoonDate = '90';
    this.setupForm();
    this.setBackLink();
  }

  public setupForm(): void {
    this.form = this.formBuilder.group({
      expiresSoonAlerts: this.formBuilder.control(this.expiresSoonDate),
    });
  }

  public setBackLink(): void {
    this.backService.setBackLink({ url: ['dashboard'], fragment: 'training-and-qualifications' });
  }

  public onSubmit(): void {
    this.router.navigate(['dashboard'], { fragment: 'training-and-qualifications' });
  }
}
