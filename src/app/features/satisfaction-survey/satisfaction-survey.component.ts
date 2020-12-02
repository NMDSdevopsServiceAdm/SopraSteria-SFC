import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
})
export class SatisfactionSurveyComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;
  private wid: string;

  constructor(formBuilder: FormBuilder, private http: HttpClient, private router: Router, route: ActivatedRoute) {
    this.form = formBuilder.group({
      didYouDoEverything: null,
      didYouDoEverythingAdditionalAnswer: null,
      howDidYouFeel: null,
    });

    route.queryParams.subscribe((params) => (this.wid = params.wid));
  }

  onSubmit(): void {
    this.http.post('/api/satisfactionSurvey', { establishmentId: this.wid, ...this.form.value }).subscribe();
    this.router.navigate(['/login']);
  }
}
