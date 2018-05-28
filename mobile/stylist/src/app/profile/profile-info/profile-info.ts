import { Component, Input } from '@angular/core';

import { StylistProfile } from '~/shared/stylist-service/stylist-models';

@Component({
  selector: 'profile-info',
  templateUrl: 'profile-info.html'
})
export class ProfileInfoComponent {
  @Input() profile?: StylistProfile;
}
