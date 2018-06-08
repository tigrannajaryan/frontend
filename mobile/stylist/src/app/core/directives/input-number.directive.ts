import { Directive, HostListener } from '@angular/core';

/**
 * ngxInputNumber attribute need for input
 * it's fixing known ios input type="number/tel" problem
 * (not only number can be inside)
 *
 * example of use - (type="tel" ngxInputNumber)
 * for <input/> or <ion-input>
 */
@Directive({
  selector: '[ngxInputNumber]'
})
export class InputNumberDirective {
  private regexp = /\d|\./;

  @HostListener('keydown', [ '$event' ])
  keydown(event: KeyboardEvent): void {
    const charCode = (event.which) ? event.which : event.keyCode;
    const key = event.key;
    const isSpecialChar = charCode <= 31;

    if (!(isSpecialChar || this.regexp.test(key))) {
      event.preventDefault();
    }
  }
}
