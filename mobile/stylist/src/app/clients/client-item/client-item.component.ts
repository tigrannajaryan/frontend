import { Component, EventEmitter, Input, Output } from '@angular/core';

import { ClientModel, MyClientModel } from '~/core/api/clients-api.models';

@Component({
  selector: 'client-item',
  templateUrl: 'client-item.component.html'
})
export class ClientItemComponent {
  @Input() isLoading: boolean;
  @Input() fullnameOnly: boolean; // when only pic and fullname are shown
  @Input() client: ClientModel | MyClientModel;
  @Input() showArrow: boolean;
  @Output() clientClick = new EventEmitter<ClientModel | MyClientModel>();
}
