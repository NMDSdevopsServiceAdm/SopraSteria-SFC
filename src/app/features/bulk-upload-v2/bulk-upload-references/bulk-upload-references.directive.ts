import { Directive } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ArrayUtil } from '@core/utils/array-util';

@Directive()
export class BulkUploadReferencesDirective {
  public checkDuplicates(group: FormGroup): void {
    const controls = Object.values(group.controls);
    const dupes = ArrayUtil.getDuplicates(controls, 'value');
    dupes.forEach((dupe: AbstractControl) => dupe.setErrors({ duplicate: true }));
  }
}
