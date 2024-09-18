import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'app-select-upload-file',
  templateUrl: './select-upload-file.component.html',
  styleUrls: ['./select-upload-file.component.scss'],
})
export class SelectUploadFileComponent implements OnInit {
  @Input() accept: string;
  @Input() multiple: boolean = false;
  @Input() buttonId: string | null = 'select-upload-file';
  @Input('aria-describedby') ariaDescribedBy: string | null;
  @Input() buttonText: string = 'Choose file';

  @Output() selectFiles = new EventEmitter<File[]>();

  ngOnInit() {}

  handleChange(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles?.length) {
      this.selectFiles.emit(selectedFiles);
    }
  }
}
