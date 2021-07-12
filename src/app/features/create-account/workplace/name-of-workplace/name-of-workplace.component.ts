import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackService } from '@core/services/back.service';

@Component({
  selector: 'app-name-of-workplace',
  templateUrl: './name-of-workplace.component.html',
})
export class NameOfWorkplaceComponent implements OnInit {
  @ViewChild('formEl') formEl: ElementRef;

  private flow: string;
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private backService: BackService,
    protected router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.flow = this.route.snapshot.parent.url[0].path;
    this.setupForm();
    this.backService.setBackLink({ url: [this.flow, 'new-regulated-by-cqc'] });
  }

  private setupForm(): void {
    this.form = this.formBuilder.group({
      workplaceName: [null, { validators: Validators.required, updateOn: 'submit' }],
    });
  }

  public onSubmit() {
    console.log(this.form.value);
  }
}
