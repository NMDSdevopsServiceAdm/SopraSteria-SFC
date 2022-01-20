import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

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

  public datachange: any;
  public dataChangeLastUpdated: any;
  public showFlagBUChanges: boolean;

  constructor(public authService: AuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log(this.route.snapshot.data);
    this.datachange = new Date(this.route.snapshot.data.dataChange?.data.last_updated);
    this.dataChangeLastUpdated = new Date(this.route.snapshot.data.dataChangeLastUpdated?.dataChangesLastUpdate);
    console.log(this.datachange);
    console.log(this.dataChangeLastUpdated);
    this.getShowFlagForBUDataChanges();
  }
  public getShowFlagForBUDataChanges() {
    this.showFlagBUChanges = +this.dataChangeLastUpdated !== +this.datachange;
  }
}
