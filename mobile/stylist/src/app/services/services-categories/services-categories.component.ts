import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { ServiceCategory } from '~/shared/stylist-api/stylist-models';

export interface ServicesCategoriesListData {
  categories: ServiceCategory[];
}

@Component({
  selector: 'pop-services-categories',
  templateUrl: 'services-categories.component.html'
})
export class ServicesCategoriesComponent {
  data: ServicesCategoriesListData;

  constructor(
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
  }

  ionViewWillLoad(): void {
    this.data = this.navParams.get('data') as ServicesCategoriesListData;
  }

  selectCategory(category: ServiceCategory): void {
    this.viewCtrl.dismiss(category);
  }
}
