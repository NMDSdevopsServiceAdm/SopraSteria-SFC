import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'sanitizeVideoUrl' })
export class SanitizeVideoUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(rawVideoUrl) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(rawVideoUrl);
  }
}
