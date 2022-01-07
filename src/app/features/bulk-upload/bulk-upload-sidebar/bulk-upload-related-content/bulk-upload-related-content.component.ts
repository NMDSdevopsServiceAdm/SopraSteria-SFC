import { Component, Input } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bulk-upload-related-content',
  templateUrl: './bulk-upload-related-content.component.html',
})
export class BulkUploadRelatedContentComponent {
  @Input() showAboutBulkUpload = true;
  @Input() showViewLastBulkUpload = true;
  @Input() showViewReferences = true;
  @Input() showDataChanges = true;
  @Input() showGetHelpWithBulkUploads = true;

  protected subscriptions: Subscription = new Subscription();

  public showFlagBUChanges: boolean = this.establishmentService.checkFlagForBUDataChanges;

  constructor(public authService: AuthService, public establishmentService: EstablishmentService) {}

  ngOnInit(): void {
    this.getShowFlagForBUDataChanges();
  }

  private getShowFlagForBUDataChanges(): void {
    this.establishmentService.checkFlagForBUDataChanges$.subscribe((showBanner) => {
      this.showFlagBUChanges = showBanner;
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
