import { Directive, HostListener, Input } from '@angular/core';
import { App, NavController } from 'ionic-angular';
import { NavOptions, Page } from 'ionic-angular/navigation/nav-util';

@Directive({
  selector: '[madeLink]'
})
export class MadeLinkDirective {
  @Input() madeLink: [Page, any, NavOptions];
  @Input() isRootNav?: boolean;

  constructor(
    private app: App,
    private navCtrl: NavController
  ) {
  }

  @HostListener('click') redirectOnClick(): void {
    const [ path, params, options ] = this.madeLink;
    try {
      if (this.isRootNav) {
          this.app.getRootNav().push(path, params);
      } else {
          this.navCtrl.push(path, params, options);
      }
    } catch (e) {
      throw new Error(`Error when navigating to ${path}. ${path} doesn’t exist in PageNames`);
    }
  }
}
