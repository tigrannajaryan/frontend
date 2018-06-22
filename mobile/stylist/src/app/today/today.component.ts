import * as moment from 'moment';
import { Component } from '@angular/core';
import {
  ActionSheetController,
  AlertController,
  IonicPage,
  NavController, NavParams
} from 'ionic-angular';
import { Store } from '@ngrx/store';

import {
  LoadAction,
  selectRemainingVisitsTodayCount,
  selectTodayState,
  TodayState
} from './today.reducer';

import { AppointmentStatuses, Today } from './today.models';
import { Appointment } from '~/today/today.models';
import { TodayService } from '~/today/today.service';
import { PageNames } from '~/core/page-names';
import { AppointmentCheckoutParams } from '~/appointment/appointment-checkout/appointment-checkout.component';
import { loading } from '~/core/utils/loading';
import { componentUnloaded } from '~/core/utils/component-unloaded';

enum AppointmentTag {
  NotCheckedOut = 'Not checked out',
  Now = 'Now',
  Next = 'Next',
  NoTag = ''
}

@IonicPage({ segment: 'today' })
@Component({
  selector: 'page-today',
  templateUrl: 'today.component.html'
})
export class TodayComponent {
  // this should be here if we using enum in html
  protected AppointmentStatuses = AppointmentStatuses;
  protected today: Today;
  protected appointmentTags: AppointmentTag[];
  protected AppointmentTag = AppointmentTag;
  protected remainingVisitsCount = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public todayService: TodayService,
    public alertCtrl: AlertController,
    private store: Store<TodayState>,
    private actionSheetCtrl: ActionSheetController
  ) {
  }

  ionViewDidEnter(): void {
    this.store
      .select(selectTodayState)
      .takeUntil(componentUnloaded(this))
      .subscribe(todayState => {
        this.processTodayData(todayState.today);
      });

    this.store
      .select(selectRemainingVisitsTodayCount)
      .takeUntil(componentUnloaded(this))
      .subscribe(remainingVisitsCount => {
        this.remainingVisitsCount = remainingVisitsCount;
      });

    // Initiate loading the today data.
    this.store.dispatch(new LoadAction());
  }

  /**
   * Processes today's data received from the backend and creates
   * the tags for each appointment card.
   */
  protected processTodayData(today: Today): void {
    this.today = today;
    this.appointmentTags = [];

    if (!this.today) {
      return;
    }

    // Create tags for each appointment based on their start/end times
    let metNext = false;
    for (const appoinment of this.today.today_appointments) {
      const startTime = moment(new Date(appoinment.datetime_start_at));

      const endTime = startTime.clone();
      endTime.add(appoinment.duration_minutes, 'minutes');

      const now = moment();

      let tag: AppointmentTag;
      if (startTime < now) {
        if (endTime > now) {
          tag = AppointmentTag.Now;
        } else {
          tag = AppointmentTag.NotCheckedOut;
        }
      } else {
        if (!metNext) {
          tag = AppointmentTag.Next;
          metNext = true;
        } else {
          tag = AppointmentTag.NoTag;
        }
      }
      this.appointmentTags.push(tag);
    }
  }

  /***
   * Update today page data
   */
  protected refresh(): void {
    this.store.dispatch(new LoadAction());
  }

  protected onAppointmentClick(appointment: Appointment): void {
    const buttons = [
      {
        text: 'Checkout Client',
        handler: () => {
          this.checkOutAppointmentClick(appointment);
        }
      }, {
        text: 'Delete Appointment',
        role: 'destructive',
        handler: () => {
          this.cancelAppointment(appointment);
        }
      }, {
        text: 'Back',
        role: 'cancel'
      }
    ];

    const actionSheet = this.actionSheetCtrl.create({ buttons });
    actionSheet.present();
  }

  /**
   * Handler for 'Checkout Client' action.
   */
  protected checkOutAppointmentClick(appointment: Appointment): void {
    const data: AppointmentCheckoutParams = { appointmentUuid: appointment.uuid };
    this.navCtrl.push(PageNames.AppointmentCheckout, { data });
  }

  /**
   * Handler for 'Cancel' action.
   */
  @loading
  protected async cancelAppointment(appointment: Appointment): Promise<void> {
    await this.todayService.changeAppointment(appointment.uuid, { status: AppointmentStatuses.cancelled_by_stylist });
    this.refresh();
  }
}
