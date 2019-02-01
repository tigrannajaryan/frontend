import { Component, Input } from '@angular/core';

@Component({
  selector: 'made-thumb',
  templateUrl: 'made-thumb.component.html'
})
export class MadeThumbComponent {
  @Input() percentage: number;
  @Input() isThumbsUp: boolean;
}
