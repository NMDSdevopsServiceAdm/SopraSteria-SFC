import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NurseFieldOfPractice, RegisteredNurse } from '@core/model/nurse-field-of-practice.model';
import { BackLinkService } from '@core/services/backLink.service';
import { WorkerService } from '@core/services/worker.service';

@Component({
  selector: 'app-review-and-confirm-nurse-field-of-practice',
  imports: [],
  templateUrl: './review-and-confirm-nurse-field-of-practice.component.html',
  styleUrl: './review-and-confirm-nurse-field-of-practice.component.scss',
})
export class ReviewAndConfirmNurseFieldOfPracticeComponent implements OnInit {
  public registeredNurses: Partial<RegisteredNurse>[];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected workerService: WorkerService,
  ) {}

  ngOnInit(): void {
    this.registeredNurses = this.route.snapshot.data?.registeredNurses;
  }
}
