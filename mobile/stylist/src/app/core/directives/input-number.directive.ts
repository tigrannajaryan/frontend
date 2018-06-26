import { Directive, HostListener } from '@angular/core';

/**
 * ngxInputNumber attribute need for input
 * it's fixing known ios input type="number/tel" problem
 * (not only number can be inside)
 *
 * example of use - (type="tel" ngxInputNumber)
 * for <input/> or <ion-input>
 *
 * from https://www.davebennett.tech/angular-4-input-numbers-directive/
 */
@Directive({
  selector: '[ngxInputNumber]'
})
export class InputNumberDirective {
  private regex: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g);
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home'];

  @HostListener('keydown', [ '$event' ])
  keydown(event: KeyboardEvent): void {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // tslint:disable-next-line
    const current: string = event.target.value; // input’s value
    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
