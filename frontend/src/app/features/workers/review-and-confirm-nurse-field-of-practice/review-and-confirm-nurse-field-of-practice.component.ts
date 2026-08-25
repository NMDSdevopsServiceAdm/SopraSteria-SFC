import lodash from 'lodash';

import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule, UrlTree } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';

import { NurseRow } from './nurse-row.component';
import { AlertService } from '@core/services/alert.service';

type WorkerUid = string;

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
  public returnTo: UrlTree;

  private changes: Record<WorkerUid, NurseFieldOfPractice[]> = {};

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.backLinkService.showBackLink();
    this.workplaceUid = this.establishmentService.establishment.uid;
    this.registeredNurses = this.route.snapshot.data?.registeredNurses;
    this.allNurseFieldsOfPractice = this.route.snapshot.data.allNurseFieldsOfPractice;

    this.returnTo = this.router.createUrlTree(['/dashboard'], { fragment: 'home' });
  }

  handleChange(newChange: Record<WorkerUid, NurseFieldOfPractice[]>): void {
    this.changes = lodash.merge(this.changes, newChange);
  }

  returnToHome(): Promise<boolean> {
    return this.router.navigate(['/dashboard'], { fragment: 'home' });
  }

  onSubmit(_event: Event): void {
    if (lodash.isEmpty(this.changes)) {
      this.returnToHome();
      return;
    }

    const updateProps = Object.entries(this.changes).map(([workerUid, nurseFieldOfPractice]) => {
      return { uid: workerUid, nurseFieldOfPractice };
    });

    this.establishmentService.updateWorkers(this.workplaceUid, updateProps).subscribe(() => {
      this.returnToHome().then(() => {
        this.alertService.addAlert({ type: 'success', message: 'NMC fields of practice confirmed' });
      });
    });
  }
}
