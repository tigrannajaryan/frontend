import { Component, Input } from '@angular/core';

@Component({
  selector: '[madeMenuHeader]',
  templateUrl: 'made-menu-header.component.html'
})
export class MadeMenuHeaderComponent {
  @Input() hideBackButton;
}
