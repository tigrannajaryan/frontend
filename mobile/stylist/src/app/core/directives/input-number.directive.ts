import { Directive, ElementRef, HostListener } from '@angular/core';

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
  // Allow decimal numbers and negative values
  private regex: RegExp = /^-?[0-9]+(\.[0-9]*){0,1}$/g;

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', [ '$event' ])
  keydown(event: KeyboardEvent): void {
    let element = this.el.nativeElement;

    if (element.tagName !== 'INPUT') {
      element = element.querySelector('input');
    }

    const next = `${element.value}${event.key}`;
    if (next && !next.match(this.regex)) {
      event.preventDefault();
    }
  }
}
