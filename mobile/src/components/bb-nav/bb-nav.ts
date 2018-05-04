import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

/**
 * Generated class for the BbNavComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'bb-nav',
  templateUrl: 'bb-nav.html'
})
export class BbNavComponent implements AfterViewInit {
  navItems: string[] = [
    'Personal Data',
    'Services',
    'Worktime',
    'Summary'
  ];
  @Input() activePageIndex: number;
  @ViewChild('navEl') navEl: ElementRef;

  constructor(public navCtrl: NavController) {
  }

  ngAfterViewInit(): void {
    this.scrollToActive();
  }

  scrollToActive(): void {
    this.activePageIndex = this.activePageIndex > this.navItems.length - 1 ? this.navItems.length - 1 : this.activePageIndex;

    const elChildren = this.navEl.nativeElement.children;
    for (let i = 0; i < elChildren.length; i++) {
      if (
        elChildren[i].className.indexOf('active') >= 0 && i !== 0 &&
        elChildren[i - 1]
      ) {
        this.navEl.nativeElement.style.marginLeft = `${-elChildren[i].offsetLeft}px`;
      }
    }
  }
}
