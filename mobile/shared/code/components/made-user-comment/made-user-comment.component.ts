import { Component, Input } from '@angular/core';
import * as moment from 'moment';

import { ISODate } from '~/shared/api/base.models';

@Component({
  selector: 'made-user-comment',
  templateUrl: 'made-user-comment.component.html'
})
export class MadeUserCommentComponent {
  _date: ISODate;

  @Input() userAva: string;
  @Input() userName: string;
  @Input() isThumbsUp: boolean;
  @Input() comment: string;
  @Input('date')
  set allowDay(value: ISODate) {
    this._date = moment(value).fromNow();
  }
}
