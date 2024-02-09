import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { TrainingCategory } from '@core/model/training.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-delete-mandatory-training-category',
  templateUrl: './delete-mandatory-training-category.component.html',
})
export class DeleteMandatoryTrainingCategoryComponent implements OnInit {
  public categories: TrainingCategory[];
  public selectedCategory: TrainingCategory;
  public form: UntypedFormGroup;
  public establishment: Establishment;
  private subscriptions: Subscription = new Subscription();
  constructor(
    protected backLinkService: BackLinkService,
    protected trainingService: TrainingService,
    protected route: ActivatedRoute,
    protected router: Router,
    private alertService: AlertService,
    protected establishmentService: EstablishmentService,
  ) {}

  ngOnInit(): void {
    this.setBackLink();
    const id = parseInt(this.route.snapshot.parent.url[0].path, 10);
    this.establishment = this.route.snapshot.parent.data.establishment;
    this.trainingService.getCategories().subscribe((x) => (this.selectedCategory = x.find((y) => y.id === id)));
  }

  public onDelete(): void {
    this.trainingService.deleteCategoryById(this.establishment.id, this.selectedCategory.id).subscribe(() => {
      this.router.navigate(['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training']);
      this.alertService.addAlert({
        type: 'success',
        message: 'Mandatory training category removed',
      });
    });
  }

  public onCancel(): void {
    this.router.navigate(['/workplace', this.establishment.uid, 'add-and-manage-mandatory-training']);
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
