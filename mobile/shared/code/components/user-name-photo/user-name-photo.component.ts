import { Component, Input } from '@angular/core';

/**
 * A component that shows user name and avatar. Used by appointment page.
 */
@Component({
  selector: 'user-name-photo',
  templateUrl: 'user-name-photo.component.html'
})
export class UserNamePhotoComponent {
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() photoUrl: string;
}
