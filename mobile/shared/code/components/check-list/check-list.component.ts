import { Component, Input } from '@angular/core';

@Component({
  selector: 'check-list',
  templateUrl: 'check-list.component.html'
})
export class CheckListComponent {
  @Input() list: string[];
}
