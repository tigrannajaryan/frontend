import { Component, Input } from '@angular/core';

import { StylistProfile } from '~/core/stylist-service/stylist-models';

@Component({
  selector: 'profile-info',
  templateUrl: 'profile-info.html'
})
export class ProfileInfoComponent {
  @Input() profile?: StylistProfile;
}
