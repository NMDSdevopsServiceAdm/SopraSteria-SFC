import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CareWorkforcePathwayRoleCategory, CWPRoleCategoryGroup } from '@core/model/careWorkforcePathwayCategory.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { CareWorkforcePathwayService } from '@core/services/care-workforce-pathway.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';

import { FinalQuestionComponent } from '../final-question/final-question.component';

@Component({
  selector: 'app-care-workforce-pathway',
  templateUrl: './care-workforce-pathway.component.html',
  styleUrl: './care-workforce-pathway.component.scss',
  standalone: false,
})
export class CareWorkforcePathwayRoleComponent extends FinalQuestionComponent {
  public section = 'Training and qualifications';
  public heading = 'Where are they currently on the Care Workforce Pathway?';
  public careWorkforcePathwayCategories: CareWorkforcePathwayRoleCategory[];
  public revealTitle = 'Why assign Care Workforce Pathway role categories?';
  public cameFromCWPSummaryPage: boolean;
  public groupedCategories: {
    title: string;
    categories: CareWorkforcePathwayRoleCategory[];
  }[] = [];

  constructor(
    protected formBuilder: UntypedFormBuilder,
    protected router: Router,
    protected route: ActivatedRoute,
    protected backLinkService: BackLinkService,
    protected errorSummaryService: ErrorSummaryService,
    protected workerService: WorkerService,
    protected establishmentService: EstablishmentService,
    protected alertService: AlertService,
    private careWorkforcePathwayService: CareWorkforcePathwayService,
  ) {
    super(
      formBuilder,
      router,
      route,
      backLinkService,
      errorSummaryService,
      workerService,
      establishmentService,
      alertService,
    );

    this.form = this.formBuilder.group({
      careWorkforcePathwayRoleCategory: null,
      isNominatedIndividual: false,
    });
    this.subscriptions.add(
      this.form.get('careWorkforcePathwayRoleCategory').valueChanges.subscribe(() => {
        this.form.get('isNominatedIndividual').setValue(false);
      }),
    );
  }

  async init() {
    this.getCareWorkforcePathwayRoleCategories();

    if (this.worker.careWorkforcePathwayRoleCategory) {
      this.prefill();
    }

    this.setupPageWhenCameFromCWPSummaryPage();

    this.next = this.getRoutePath('staff-record-summary');
  }

  prefill() {
    this.form.patchValue({
      careWorkforcePathwayRoleCategory: this.worker.careWorkforcePathwayRoleCategory.roleCategoryId,

      isNominatedIndividual: this.worker.careWorkforcePathwayRoleCategory.isNominatedIndividual ?? false,
    });
  }

  public getCareWorkforcePathwayRoleCategories(): void {
    this.subscriptions.add(
      this.careWorkforcePathwayService.getCareWorkforcePathwayRoleCategories().subscribe(
        (categories) => {
          if (categories) {
            this.careWorkforcePathwayCategories = categories;

            const groups = [
              { value: CWPRoleCategoryGroup.CareProviding, title: 'Care providing' },
              { value: CWPRoleCategoryGroup.SeniorLeadership, title: 'Senior leadership' },
              { value: CWPRoleCategoryGroup.NonCareProviding, title: 'Non-care providing' },
              { value: CWPRoleCategoryGroup.Others, title: 'Other options' },
            ];

            this.groupedCategories = groups.map((group) => ({
              title: group.title,
              categories: categories.filter((category) => category.group === group.value),
            }));
          }
        },
        (error) => {
          console.error(error.error);
        },
      ),
    );
  }

  private setupPageWhenCameFromCWPSummaryPage(): void {
    this.cameFromCWPSummaryPage = Boolean(
      this.return?.url?.some((urlPart) => urlPart?.includes('care-workforce-pathway-workers-summary')),
    );

    if (!this.cameFromCWPSummaryPage) {
      return;
    }
    this.section = 'Staff records';
    this.returnUrl = this.return.url;
  }

  public isSelectedSeniorLeadershipRole(category: CareWorkforcePathwayRoleCategory): boolean {
    const selectedRoleId = Number(this.form.get('careWorkforcePathwayRoleCategory')?.value);

    return category.group === CWPRoleCategoryGroup.SeniorLeadership && selectedRoleId === category.id;
  }

  generateUpdateProps() {
    const { careWorkforcePathwayRoleCategory, isNominatedIndividual } = this.form.value;

    if (!careWorkforcePathwayRoleCategory) {
      return null;
    }

    const selectedCategoryId = parseInt(careWorkforcePathwayRoleCategory, 10);

    const selectedCategory = this.careWorkforcePathwayCategories?.find(
      (category) => category.id === selectedCategoryId,
    );

    return {
      careWorkforcePathwayRoleCategory: {
        roleCategoryId: selectedCategoryId,
        isNominatedIndividual:
          selectedCategory?.group === CWPRoleCategoryGroup.SeniorLeadership ? Boolean(isNominatedIndividual) : false,
      },
    };
  }

  addAlert(): void {
    super.addAlert();
  }

  _onSuccess(data: any) {
    this.workerService.setState({ ...this.worker, ...data });
    this.onSuccess();
    this.navigate().then(() => this.addAlert());
  }

  protected formValueIsEmpty(): boolean {
    const { careWorkforcePathwayRoleCategory } = this.form.value;
    return careWorkforcePathwayRoleCategory === null;
  }
}
