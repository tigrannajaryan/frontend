import * as faker from 'faker';
import * as moment from 'moment';

import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-appointment-date',
  templateUrl: 'appointment-date.html'
})
export class AppointmentDateComponent {
  private moment = moment;
  private testData = Array(14).fill(undefined).map(() => ({
    price: Number(faker.commerce.price())
  }));
}
