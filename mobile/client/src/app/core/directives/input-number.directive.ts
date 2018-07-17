import { Directive, ElementRef, HostListener } from '@angular/core';

enum SpecialKeysCodes {
  Backspace = 8,
  Tab = 9,
  End = 35,
  Home = 36,
  LeftArrow =  37,
  UpArrow =  38,
  RightArrow = 39,
  DownArrow =  40
}

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
  private regex: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g);

  constructor(
    private el: ElementRef
  ) {
  }

  @HostListener('keydown', [ '$event' ])
  keydown(event: KeyboardEvent): void {
    const code: number = event.which || Number(event.code);
    const key: string = event.key || String.fromCharCode(code);

    if (code in SpecialKeysCodes) {
      return;
    }

    const start: string = this.el.nativeElement.querySelector('input').value;
    const next: string = start.concat(key);

    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }
}
