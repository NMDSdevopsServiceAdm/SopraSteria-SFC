import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-grant-letter-sent',
  templateUrl: './grant-letter-sent.component.html',
})
export class GrantLetterSentComponent {
  public form: FormGroup;
  public submitted = false;
  public flow: string;

  constructor(protected formBuilder: FormBuilder, protected router: Router) {
    this.form = this.formBuilder.group({});
  }

  public onSubmit(): void {
    this.submitted = true;
    this.navigateToNextPage();
  }

  public navigateToNextPage(): void {
    this.router.navigate(['/dashboard']);
  }
}
