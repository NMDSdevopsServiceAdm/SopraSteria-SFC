import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { debug } from 'util';

// setup simple regex for white listed characters
// const validCharacters = /[^\s\w,.:&\/()+%'`@-]/;

export class CustomValidators extends Validators {

  // create a static method for your validation
  static multipleValuesValidator(c: AbstractControl): { [key: string]: boolean } | null {
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

  static matchInputValues(c: AbstractControl): { [key: string]: boolean } | null {
    const passwordControl = c.get('createPasswordInput');
    const confirmPasswordControl = c.get('confirmPasswordInput');

    if (passwordControl.pristine || confirmPasswordControl.pristine) {
      return null;
    }

    //debugger;
    if (passwordControl.value !== confirmPasswordControl.value) {
      //debugger;
      return { 'notMatched': true };
    }

  }

  // static apiErrorSet(c: AbstractControl): { [key: string]: boolean } | null {
  //   const postcodeControl = c.get('cqcRegisteredPostcode');
  //   //debugger;

  //   if (!c.errors) {
  //     return null;
  //   }
  //   return { 'apiErrorMessage': true };
  // }
  // checkInputValues(c: AbstractControl): { [key: string]: boolean } | null {
  //   const postcodeControl = c.get('cqcRegisteredPostcode');
  //   const locationIdControl = c.get('locationId');

  //   if (postcodeControl.pristine || locationIdControl.pristine) {
  //     return null;
  //   }

  //   if (postcodeControl.value.length < 1 && locationIdControl.value.length < 1) {
  //     return null;
  //   }

  //   if ((postcodeControl.value.length < 1 && locationIdControl.value.length > 0) ||
  //       (postcodeControl.value.length > 0 && locationIdControl.value.length < 1)) {

  //         return null;
  //   }
  //   return { 'bothHaveContent': true };
  // }


}
