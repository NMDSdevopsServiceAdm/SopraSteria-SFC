import { Component, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  public form: FormGroup;
  private establishmentId;
  private subscriptions: Subscription = new Subscription();
  constructor(
    protected backLinkService: BackLinkService,
    protected trainingService: TrainingService,
    protected route: ActivatedRoute,
    protected router: Router,
    private alertService: AlertService,
    protected establishmentService: EstablishmentService,
  ) {}

  get categoriesArray(): FormArray {
    return this.form.get('categories') as FormArray;
  }

  ngOnInit(): void {
    this.setBackLink();
    const id = parseInt(this.route.snapshot.parent.url[0].path, 10);
    this.establishmentId = this.route.parent.snapshot.data.establishment.id;
    this.trainingService.getCategories().subscribe((x) => (this.selectedCategory = x.find((y) => y.id === id)));
  }

  public removeCategory(event: Event, index): void {
    event.preventDefault();
    this.categoriesArray.removeAt(index);
  }

  public onDelete() {
    this.trainingService.deleteCategoryById(this.establishmentId, this.selectedCategory.id).subscribe(() => {
      this.router.navigate([
        '/workplace',
        this.establishmentService.primaryWorkplace.uid,
        'add-and-manage-mandatory-training',
      ]);
      this.alertService.addAlert({
        type: 'success',
        message: 'Mandatory training category removed',
      });
    });
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
