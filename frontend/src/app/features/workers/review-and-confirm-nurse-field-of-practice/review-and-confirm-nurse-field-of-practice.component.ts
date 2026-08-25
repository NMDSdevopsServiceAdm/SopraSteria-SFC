import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, UrlTree } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { NurseRow } from './nurse-row.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-review-and-confirm-nurse-field-of-practice',
  imports: [ReactiveFormsModule, NurseRow, RouterModule],
  templateUrl: './review-and-confirm-nurse-field-of-practice.component.html',
  styleUrl: './review-and-confirm-nurse-field-of-practice.component.scss',
})
export class ReviewAndConfirmNurseFieldOfPracticeComponent implements OnInit {
  public registeredNurses: RegisteredNurse[];
  public allNurseFieldsOfPractice: NurseFieldOfPractice[];
  public workplaceUid: string;
  public form: FormGroup<FormType>;
  public returnTo: UrlTree;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private backLinkService: BackLinkService,
    private formBuilder: NonNullableFormBuilder,
    private establishmentService: EstablishmentService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;

    this.registeredNurses = this.route.snapshot.data?.registeredNurses;
    this.allNurseFieldsOfPractice = this.route.snapshot.data.allNurseFieldsOfPractice;

    this.setupForm();

    this.returnTo = this.router.createUrlTree(['/dashboard'], { fragment: 'home' });
  }

  private setupForm(): void {
    const workerForms = this.formBuilder.array(
      this.registeredNurses.map((worker) => this.buildFormControlsForWorker(worker)),
    );
    this.form = this.formBuilder.group({ workerForms });
  }

  private buildFormControlsForWorker(worker: RegisteredNurse) {
    const previousAnswerIds = new Set(worker.nurseFieldOfPractice.map((field) => field.id));
    const initialCheckBoxValues = this.allNurseFieldsOfPractice.map((field) => previousAnswerIds.has(field.id));

    return this.formBuilder.group({
      nurseFieldOfPractice: this.formBuilder.array(initialCheckBoxValues),
      workerUid: worker.uid,
    });
  }

  private formValuesToAnswer(formValues: Array<boolean>): Array<NurseFieldOfPractice> {
    return this.allNurseFieldsOfPractice.filter((_field, index) => formValues[index]);
  }

  public get workerForms() {
    return this.form.controls.workerForms.controls;
  }

  public onSubmit(): void {
    const updateProps = this.extractUpdateProps();

    const submitForm = this.establishmentService.updateWorkers(this.workplaceUid, updateProps).subscribe(() => {
      this.returnToHome().then(() => {
        this.addAlert();
      });
    });

    this.subscriptions.add(submitForm);
  }

  private extractUpdateProps() {
    const formValue = this.form.value;
    const updateProps = formValue.workerForms?.map((workerForm) => {
      const uid = workerForm.workerUid!;
      const nurseFieldOfPractice = this.formValuesToAnswer(workerForm?.nurseFieldOfPractice ?? []);
      return { uid, nurseFieldOfPractice };
    });
    return updateProps;
  }

  public returnToHome(): Promise<boolean> {
    return this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  public addAlert(): void {
    this.alertService.addAlert({ type: 'success', message: 'NMC fields of practice confirmed' });
  }
}

interface FormType {
  workerForms: FormArray<
    FormGroup<{
      nurseFieldOfPractice: FormArray<FormControl<boolean>>;
      workerUid: FormControl<string>;
    }>
  >;
}
