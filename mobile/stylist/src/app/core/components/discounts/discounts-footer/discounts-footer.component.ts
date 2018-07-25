import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: '[madeDiscountsFooter]',
  templateUrl: 'discounts-footer.component.html'
})
export class DiscountsFooterComponent {
  @Output() continue = new EventEmitter();

  protected onContinue(): void {
    this.continue.emit();
  }
}
