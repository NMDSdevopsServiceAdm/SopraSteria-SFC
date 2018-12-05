import { FormControl, Validators } from '@angular/forms';

// setup simple regex for white listed characters
// const validCharacters = /[^\s\w,.:&\/()+%'`@-]/;

export class CustomValidators extends Validators {

  // create a static method for your validation
  static multipleValuesValidator(c: FormControl): { [key: string]: boolean } | null {
    const postcodeControl = c.get('cqcRegisteredPostcode');
    const locationIdControl = c.get('locationId');

    if (postcodeControl.pristine || locationIdControl.pristine) {
      return null;
    }

    if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
      return null;
    }

    if ((postcodeControl.value.length < 1 && locationIdControl.value.length > 0) ||
        (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)) {
      return null;
    }

    return { 'bothHaveContent': true };
  }

}
