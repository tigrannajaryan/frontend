import { Component, Input } from '@angular/core';

@Component({
  selector: '[madeBackHeader]',
  templateUrl: 'back-header.component.html'
})
export class BackHeaderComponent {
  @Input() hasBackButton;
}
