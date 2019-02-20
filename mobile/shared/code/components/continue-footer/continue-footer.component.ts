import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MadeDisableOnClick } from '~/shared/utils/loading';

@Component({
  selector: '[madeContinueFooter]',
  templateUrl: 'continue-footer.component.html'
})
export class ContinueFooterComponent {
  @Input() disabled: boolean;
  @Output() continue = new EventEmitter();
  @Input() title: string;

  @MadeDisableOnClick
  async onContinue(): Promise<void> {
    this.continue.emit();
  }
}
