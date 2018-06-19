import * as paper from 'paper';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AppointmentDateOffer } from '~/today/today.models';

/**
 * Project prices to px between 0 and width.
 * prices: [$26, $100, $64, $210]
 *         ||||||||||||||||||||||
 * range:  0px_._._._._._._width
 */
function calculatePricePosition(prices: number[], width: number): (price?: number) => number {
  if (prices.length < 2) {
    return (): number => width / 2; // centered
  }
  let max = -Infinity;
  const min = prices.reduce((minPrice, price) => {
    if (price > max) {
      max = price;
    }
    return price < minPrice ? price : minPrice;
  });
  if (min === max) {
    return (): number => width / 2; // also centered
  }
  const step = (max - min) / width; // price of one px from 0
  return (price: number): number => (price - min) / step; // in px
}

@Component({
  selector: 'made-chart',
  templateUrl: 'chart.component.html'
})
export class ChartComponent implements OnInit {
  @ViewChild('canvas') canvas;
  @Input() dates: AppointmentDateOffer[];

  private project: paper.Project;

  // config
  private color: string;
  private width: number;
  private drawingWidth: number;
  private topOffset = -4; // px
  private cardSize = 94; // px
  private verticalStep = this.cardSize / 2;

  static getStrokeColor = (alpha = 1) => `rgba(133, 25, 255, ${alpha})`;

  ngOnInit(): void {
    this.initProject();
    this.configure();
    this.draw();
  }

  /**
   * Set PaperJS up. Scale drawing for device’s pixel ratio.
   */
  initProject(): void {
    if (!this.project) {
      this.canvas.nativeElement.style.height = `${this.cardSize * this.dates.length}px`;
      this.project = paper.setup(this.canvas.nativeElement);
      this.project.view.scale(this.project.view.pixelRatio);
    } else {
      // TODO: find a way to clear canvas, project.clear() doesn’t work
    }
  }

  /**
   * Calculate color and widths.
   */
  configure(): void {
    this.color = ChartComponent.getStrokeColor();
    this.width = this.canvas.nativeElement.width / this.project.view.pixelRatio;
    this.drawingWidth = this.width / 4;
  }

  /**
   * Get path to draw line for given dates’ prices.
   */
  getMainPath(): paper.Path {
    return new paper.Path({
      shadowBlur: 16,
      shadowOffset: new paper.Point(6, 0),
      shadowColor: new paper.Color(0, 0, 250),
      strokeColor: ChartComponent.getStrokeColor(0.2),
      strokeWidth: 2
    });
  }

  /**
   * Converts x, y to PaperJS Point.
   */
  getPoint(x: number, y: number): paper.Point {
    return new paper.Point(x, y);
  }

  /**
   * Get PaperJS Point to draw a point’s anchor. 2 points needed to draw a designed point’s anchor.
   */
  getAnchor(point): paper.Path.Circle[] {
    return [
      new paper.Path.Circle({
        center: point,
        fillColor: this.color,
        radius: 2.2,
        strokeColor: this.color
      }),
      new paper.Path.Circle({
        center: point,
        opacity: 0.2,
        radius: 6,
        strokeColor: this.color
      })
    ];
  }

  /**
   * Return center coordinates of a drawing.
   */
  getCenter(): paper.Point {
    return new paper.Point(this.width / 2, this.dates.length * this.verticalStep + this.topOffset);
  }

  /**
   * Draw on a canvas.
   */
  draw(): void {
    const getPricePx = calculatePricePosition(this.dates.map(day => day.price), this.drawingWidth);

    const path = this.getMainPath(); // draw semi-transparent line
    const points = []; // draw points

    this.dates.forEach((day, i) => {
      const point = this.getPoint(getPricePx(day.price), i * this.verticalStep);
      path.add(point);
      points.push(...this.getAnchor(point));
    });

    path.smooth({ type: 'continuous' });

    // group all shapes in one drawing
    // tslint:disable-next-line:no-unused-expression
    new paper.Group({
      children: [path, ...points],
      strokeCap: 'round',
      strokeJoin: 'round',
      pivot: path.position,
      position: this.getCenter(),
      transformContent: false
    });
  }
}
