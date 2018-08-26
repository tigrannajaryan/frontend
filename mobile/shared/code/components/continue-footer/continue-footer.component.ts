import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: '[madeContinueFooter]',
  templateUrl: 'continue-footer.component.html'
})
export class ContinueFooterComponent {
  @Input() disabled: boolean;
  @Output() continue = new EventEmitter();
  @Input() title: string;

  onContinue(): void {
    this.continue.emit();
  }
}
