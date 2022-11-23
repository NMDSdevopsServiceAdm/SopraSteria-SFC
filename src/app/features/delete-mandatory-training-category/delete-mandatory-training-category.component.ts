import { Component, OnInit } from '@angular/core';
import { BackLinkService } from '@core/services/backLink.service';

@Component({
  selector: 'app-delete-mandatory-training-category',
  templateUrl: './delete-mandatory-training-category.component.html',
})
export class DeleteMandatoryTrainingCategoryComponent implements OnInit {
  constructor(protected backLinkService: BackLinkService) {}

  ngOnInit(): void {
    this.setBackLink();
  }

  public setBackLink(): void {
    this.backLinkService.showBackLink();
  }
}
