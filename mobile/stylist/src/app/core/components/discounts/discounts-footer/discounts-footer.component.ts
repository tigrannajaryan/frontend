import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '[madeDiscountsFooter]',
  templateUrl: 'discounts-footer.component.html'
})
export class DiscountsFooterComponent {
  @Input() disabled: boolean;
  @Output() continue = new EventEmitter();
  @Input() title: string;

  onContinue(): void {
    this.continue.emit();
  }
}
