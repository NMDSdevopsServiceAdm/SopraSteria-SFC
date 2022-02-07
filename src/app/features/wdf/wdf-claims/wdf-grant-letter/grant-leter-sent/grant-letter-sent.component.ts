import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorDetails } from '@core/model/errorSummary.model';

@Component({
  selector: 'app-grant-letter-sent',
  templateUrl: './grant-letter-sent.component.html',
})
export class GrantLetterSentComponent implements OnInit {
  public form: FormGroup;
  public submitted = false;
  public formErrorsMap: Array<ErrorDetails> = [];
  public flow: string;

  constructor(protected formBuilder: FormBuilder, protected router: Router) {
    this.form = this.formBuilder.group({});
  }

  ngOnInit(): void {}

  public onSubmit(): void {
    this.submitted = true;
    this.navigateToNextPage();
  }

  public navigateToNextPage(): void {
    this.router.navigate(['/dashboard']);
  }
}
