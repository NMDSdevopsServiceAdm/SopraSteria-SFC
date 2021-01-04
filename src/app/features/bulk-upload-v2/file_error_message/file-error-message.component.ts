import { I18nPluralPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BulkUploadService, BulkUploadServiceV2 } from '@core/services/bulk-upload.service';

@Component({
  selector: 'app-file-error-message',
  templateUrl: './file-error-message.component.html',
  providers: [I18nPluralPipe, { provide: BulkUploadService, useClass: BulkUploadServiceV2 }],
})
export class FileErrorMessageComponent {
  @Input() warning: number;
  @Input() error: number;
}
