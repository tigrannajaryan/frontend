import * as faker from 'faker';
import * as moment from 'moment';
import * as paper from 'paper';

import { Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { IonicPage, NavController } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';

import { componentUnloaded } from '~/core/utils/component-unloaded';

import {
  AppointmentDatesState,
  GetDatesAction,
  select2WeeksDays,
  SelectDateAction
} from '~/appointment/appointment-date/appointment-dates.reducer';
import { AppointmentDate } from '~/appointment/appointment-date/appointment-dates-service-mock';

const STROKE_COLOR = '#8519FF';

const calculatePricePosition = (prices: number[], width: number) => {
  const sorted = prices.sort((a, b) => a - b);
  const [min, max] = [sorted[0], sorted[sorted.length - 1]];
  const step = (max - min) / width; // price of one px from 0
  return (price: number) => (price - min) / step; // in px
};

@IonicPage()
@Component({
  selector: 'page-appointment-date',
  templateUrl: 'appointment-date.html'
})
export class AppointmentDateComponent {
  @ViewChild('canvas') canvas;

  private moment = moment;
  private days: AppointmentDate[];

  private project: paper.Project;

  constructor(
    private navCtrl: NavController,
    private store: Store<AppointmentDatesState>
  ) {
  }

  ionViewDidEnter(): void {
    this.store
      .select(select2WeeksDays)
      .takeUntil(componentUnloaded(this))
      .subscribe(days => {
        this.days = days;
        if (days.length) {
          this.drawChart();
        }
      });

    this.store.dispatch(new GetDatesAction());
  }

  drawChart(): void {
    if (!this.project) {
      this.project = paper.setup(this.canvas.nativeElement);
      this.project.view.scale(this.project.view.pixelRatio);
    } else {
      // TODO: find a way to clear canvas
    }

    const width = this.canvas.nativeElement.width / this.project.view.pixelRatio;
    const getPricePx = calculatePricePosition(this.days.map(day => day.price), width / 4);

    const path = new paper.Path({
      shadowBlur: 16,
      shadowOffset: new paper.Point(6, 0),
      shadowColor: new paper.Color(0, 0, 250),
      strokeColor: 'rgba(133, 25, 255, 0.2)', // STROKE_COLOR with alfa
      strokeWidth: 2
    });

    const points = [];

    this.days.forEach((day, i) => {
      const point = new paper.Point(getPricePx(day.price), i * 47);
      path.add(point);

      const anchor = [
        new paper.Path.Circle({
          center: point,
          fillColor: STROKE_COLOR,
          radius: 2.2,
          strokeColor: STROKE_COLOR
        }),
        new paper.Path.Circle({
          center: point,
          opacity: 0.2,
          radius: 6,
          strokeColor: STROKE_COLOR
        })
      ];
      points.push(...anchor);
    });

    path.smooth({ type: 'continuous' });

    const group = new paper.Group({
      children: [path, ...points],
      strokeCap: 'round',
      strokeJoin: 'round',
      pivot: path.position,
      position: new paper.Point(width / 2, this.days.length * 94 / 2 - 8),
      transformContent: false
    });
  }

  select(date: AppointmentDate): void {
    this.store.dispatch(new SelectDateAction(date));
    this.navCtrl.pop();
  }
}
