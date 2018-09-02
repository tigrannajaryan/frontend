import { Component, Input } from '@angular/core';

@Component({
  selector: 'num-list',
  templateUrl: 'num-list.component.html'
})
export class NumListComponent {
  @Input() list: string[];
}
