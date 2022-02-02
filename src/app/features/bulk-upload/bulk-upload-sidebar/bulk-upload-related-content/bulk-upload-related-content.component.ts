import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-bulk-upload-related-content',
  templateUrl: './bulk-upload-related-content.component.html',
})
export class BulkUploadRelatedContentComponent implements OnInit {
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
    this.datachange = this.route.snapshot.data.dataChange.data.last_updated;
    this.dataChangeLastUpdated = this.route.snapshot.data.dataChangeLastUpdated.dataChangesLastUpdate;
    this.getShowFlagForBUDataChanges();
  }
  public getShowFlagForBUDataChanges() {
    const exsitedDate = new Date(this.dataChangeLastUpdated);
    const newDate = new Date(this.datachange);

    this.showFlagBUChanges = +exsitedDate !== +newDate;
  }
}
