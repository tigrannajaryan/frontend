import { Component, Input } from '@angular/core';

@Component({
  selector: 'user-header',
  templateUrl: 'user-header.component.html'
})
export class UserHeaderComponent {
  @Input() hasBackButton: boolean;
}
