import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, viewChild } from '@angular/core';
import { NgxDropzoneChangeEvent, NgxDropzoneComponent } from 'ngx-dropzone';

@Component({
  selector: 'app-select-upload-file',
  templateUrl: './select-upload-file.component.html',
  styleUrls: ['./select-upload-file.component.scss'],
  standalone: false,
})
export class SelectUploadFileComponent implements AfterViewInit {
  @Input() accept: string = '';
  @Input() multiple: boolean = false;
  @Input() buttonId: string | null = 'select-upload-file';
  @Input('aria-describedby') ariaDescribedBy: string | null;
  @Input() buttonText: string = 'Choose file';
  @Input() buttonClasses: string = '';

  @Input() showDragAndDropZone: boolean = false;
  @Input() dragAndDropZoneText: string = 'Drag and drop the files here';

  @Output() selectFiles = new EventEmitter<File[]>();

  private hiddenFileInput = viewChild<ElementRef<HTMLInputElement>>('hiddenFileInput');
  private dropzone = viewChild<NgxDropzoneComponent>('dropzone');

  ngAfterViewInit(): void {
    const dropzone = this.dropzone();
    if (this.dropzone()) {
      const nativeFileInput = dropzone?._fileInput.nativeElement as HTMLInputElement;
      nativeFileInput.setAttribute('data-testid', 'fileInput');
      nativeFileInput.classList.add('asc-util__display-none');
    }
  }

  public handleFileInputChange(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    const selectedFiles = Array.from(event.target.files!);
    if (selectedFiles?.length) {
      this.selectFiles.emit(selectedFiles);
      event.target.value = '';
    }
  }

  public handleFileDrop(event: NgxDropzoneChangeEvent): void {
    // includes rejectedFiles as well, as file filtering is to be handled by parent component
    const files = [...event.addedFiles, ...event.rejectedFiles];
    if (files?.length) {
      this.selectFiles.emit(files);
    }
  }

  public showFileSelector(): void {
    if (this.showDragAndDropZone) {
      const dropzone = this.dropzone()!;
      dropzone.showFileSelector();
    } else {
      const hiddenFileInput = this.hiddenFileInput()!;
      hiddenFileInput.nativeElement.click();
    }
  }
}
