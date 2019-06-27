import { Component } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-workplace-references-page',
  templateUrl: './workplace-references-page.component.html',
})
export class WorkplaceReferencesPageComponent {
  public referencesUpdated = false;

  constructor(private authService: AuthService) {}
  /**
   * @todo
   * Implement update references logic
   */
  updateReferences() {
    this.referencesUpdated = true;
    this.authService.isFirstBulkUpload = false;
  }
}
