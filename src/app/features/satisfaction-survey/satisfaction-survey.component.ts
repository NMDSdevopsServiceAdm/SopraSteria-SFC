import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-satisfaction-survey',
  templateUrl: './satisfaction-survey.component.html',
  styleUrls: ['./satisfaction-survey.component.scss'],
})
export class SatisfactionSurveyComponent {
  @ViewChild('formEl') formEl: ElementRef;
  public form: FormGroup;

  constructor(formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      didYouDoEverything: null,
    });
  }
}
