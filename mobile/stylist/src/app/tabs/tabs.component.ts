import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { PageNames } from '../core/page-names';

interface TabsObject {
  name: string;
  link: PageNames;
  params: any;
}

@IonicPage({
  segment: 'tabs'
})
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.component.html'
})
export class TabsComponent {
  protected tabs: TabsObject[] = [
    {
      name: 'Home',
      link: PageNames.Home,
      params: undefined
    },
    {
      name: 'Hours',
      link: PageNames.Worktime,
      params: { isProfile: true }
    },
    {
      name: 'Discount',
      link: PageNames.Discounts,
      params: { isProfile: true }
    },
    {
      name: 'Services',
      link: PageNames.RegisterServicesItem,
      params: { isProfile: true }
    },
    {
      name: 'Profile',
      link: PageNames.Profile,
      params: undefined
    }
  ];

}
