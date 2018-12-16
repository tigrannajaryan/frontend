import { Component, Input } from '@angular/core';

import { StylistModel } from '~/shared/api/stylists.models';

@Component({
  selector: 'stylist-card',
  templateUrl: 'stylist-card.component.html'
})
export class StylistCardComponent {
  @Input() stylist: StylistModel;
}
