import { Component } from '@angular/core';

@Component({
  selector: 'app-download-data-files',
  templateUrl: './download-data-files.component.html',
})
export class DownloadDataFilesComponent {
  public lastUpdated = new Date();

  constructor() {}
}
