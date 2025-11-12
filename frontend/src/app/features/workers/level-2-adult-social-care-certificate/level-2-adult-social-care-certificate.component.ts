import { Component } from '@angular/core';
import { QuestionComponent } from '../question/question.component';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { WorkerService } from '@core/services/worker.service';
import { EstablishmentService } from '@core/services/establishment.service';
import dayjs from 'dayjs';

@Component({
    selector: 'app-level-2-adult-social-care-certificate',
    templateUrl: './level-2-adult-social-care-certificate.component.html',
    standalone: false
})
export class Level2AdultSocialCareCertificateComponent extends QuestionComponent {
  public answersAvailable = ['Yes, completed', 'Yes, started', 'No'];

  public section = 'Training and qualifications';

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
  ) {
    super(formBuilder, router, route, backLinkService, errorSummaryService, workerService, establishmentService);

    this.form = this.formBuilder.group({
      level2CareCertificate: null,
      level2CareCertificateYearAchieved: [null, { validators: null, updateOn: 'submit' }],
    });
  }

  init() {
    this.next = this.getRoutePath('apprenticeship-training');

    this.subscriptions.add(
      this.form.get('level2CareCertificate').valueChanges.subscribe((value) => {
        this.form.get('level2CareCertificateYearAchieved').clearValidators();

        if (value === 'Yes, completed') {
          this.form
            .get('level2CareCertificateYearAchieved')
            .setValidators([Validators.min(2024), Validators.max(dayjs().year())]);
        }
        this.form.get('level2CareCertificateYearAchieved').updateValueAndValidity();
      }),
    );

    if (this.worker.level2CareCertificate && this.worker.level2CareCertificate.value) {
      this.form.patchValue({
        level2CareCertificate: this.worker.level2CareCertificate.value,
        level2CareCertificateYearAchieved: this.worker.level2CareCertificate.year,
      });
    }
  }

  generateUpdateProps() {
    const { level2CareCertificate, level2CareCertificateYearAchieved } = this.form.value;

    if (!level2CareCertificate) {
      return null;
    }

    return {
      level2CareCertificate: {
        value: level2CareCertificate,
        year: level2CareCertificateYearAchieved,
      },
    };
  }

  setupFormErrorsMap(): void {
    this.formErrorsMap = [
      {
        item: 'level2CareCertificateYearAchieved',
        type: [
          {
            name: 'min',
            message: `Year achieved cannot be before 2024`,
          },
          {
            name: 'max',
            message: `Year achieved cannot be in the future`,
          },
        ],
      },
    ];
  }
}
