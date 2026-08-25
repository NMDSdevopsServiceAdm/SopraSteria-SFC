import { Component, OnInit } from '@angular/core';
import { FormArray, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';
import { AccordionToggleButtonComponent } from './accordion-toggle-button/accordion-toggle-button.component';
import { NurseRow } from './nurse-row.component';

@Component({
  selector: 'app-review-and-confirm-nurse-field-of-practice',
  imports: [ReactiveFormsModule, NurseRow],
  templateUrl: './review-and-confirm-nurse-field-of-practice.component.html',
  styleUrl: './review-and-confirm-nurse-field-of-practice.component.scss',
})
export class ReviewAndConfirmNurseFieldOfPracticeComponent implements OnInit {
  public registeredNurses: RegisteredNurse[];
  public allNurseFieldsOfPractice: NurseFieldOfPractice[];
  public form: UntypedFormGroup;

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.registeredNurses = this.route.snapshot.data?.registeredNurses;
    this.allNurseFieldsOfPractice = this.route.snapshot.data.allNurseFieldsOfPractice;
    this.setupForm();
  }

  setupForm(): void {
    const allWorkerFormControls = Object.fromEntries(
      this.registeredNurses.map((worker) => {
        return [worker.uid, this.formBuilder.array(this.allNurseFieldsOfPractice.map(() => null))];
      }),
    );
    this.form = this.formBuilder.group(allWorkerFormControls);
  }
}
