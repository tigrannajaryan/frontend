import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../../../helpers/base-component';
import { ServiceTemplateSetResponse } from '../../../../providers/store/store-model';
import { StoreService } from '../../../../providers/store/store';
import {
  ServiceTemplateSet,
  ServiceTemplateSetCategories,
  ServiceTemplateSetServices
} from '../../../../providers/stylist-service/stylist-models';
import { StoreServiceHelper } from '../../../../providers/store/store-helper';
import { ServicesItemForm } from './services-item.component.model';

@IonicPage({
  segment: 'service-item'
})
@Component({
  selector: 'page-service-item',
  templateUrl: 'services-item.component.html'
})
export class ServicesItemComponent extends BaseComponent {
  templateSet: ServiceTemplateSet;
  form: FormGroup;
  oldCategoryUuid: string;

  constructor(
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private store: StoreService,
    private storeHelper: StoreServiceHelper
  ) {
    super();
    this.init();
  }

  changeCategory(selectUuid: string): void {
    if (this.oldCategoryUuid && this.oldCategoryUuid !== selectUuid) {
      const {vars, categoryUuid, ...newServiceItem} = this.form.value;
      this.deleteCurrentServiceItem(categoryUuid, newServiceItem);
      this.pushNewServiceItem(categoryUuid, newServiceItem);
    }
    this.oldCategoryUuid = selectUuid;
  }

  onServiceDelete(): void {
    const {vars, categoryUuid, ...newServiceItem} = this.form.value;
    this.deleteCurrentServiceItem(categoryUuid, newServiceItem);

    this.storeHelper.update('template_set', this.templateSet as ServiceTemplateSet);
    this.viewCtrl.dismiss();
  }

  submit(): void {
    const {vars, categoryUuid, ...newServiceItem} = this.form.value;

    // add new category service element if !id else update
    if (!newServiceItem.id) {
      this.pushNewServiceItem(categoryUuid, newServiceItem);
    } else {
      this.updateCurrentServiceItem(categoryUuid, newServiceItem);
    }

    this.storeHelper.update('template_set', this.templateSet as ServiceTemplateSet);
    this.viewCtrl.dismiss();
  }

  private async init(): Promise<void> {
    await this.store.changes.safeSubscribe(this, (res: ServiceTemplateSetResponse) => {
      this.templateSet = res.template_set;
    });

    const data: ServicesItemForm = {
      categories: this.templateSet.categories,
      ...this.navParams.get('data')
    };

    this.initForm();
    this.setForm(data);
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      vars: this.formBuilder.group({
        categories: ''
      }),

      categoryUuid: ['', Validators.required],

      id: '',
      base_price: ['', Validators.required],
      description: [''],
      duration_minutes: ['', Validators.required],
      name: ['', Validators.required]
    });
  }

  /**
   * If we have some data we can set it via this function
   * its should be initialized after form creation
   */

  private setForm(data: ServicesItemForm): void {
    if (data) {
      if (data.categories) {
        const categoriesNameUuidArr = [];

        for (const curCategory of data.categories) {
          categoriesNameUuidArr.push({
            name: curCategory.name,
            uuid: curCategory.uuid
          });
        }

        this.setFormControl('vars.categories', categoriesNameUuidArr);
      }

      if (data.categoryUuid) {
        this.setFormControl('categoryUuid', data.categoryUuid);
      }

      if (data.service) {
        this.setFormControl('id', data.service.id);
        this.setFormControl('base_price', data.service.base_price);
        this.setFormControl('description', data.service.description);
        this.setFormControl('duration_minutes', data.service.duration_minutes);
        this.setFormControl('name', data.service.name);
      }
    }
  }

  private setFormControl(control, value): void {
    const formControl = this.form.get(control) as FormControl;
    formControl.setValue(value);
  }

  private pushNewServiceItem(categoryUuid, newServiceItem): void {
    const categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === categoryUuid);
    const curCategory: ServiceTemplateSetCategories = this.templateSet.categories[categoryIndex];
    curCategory.services.push(newServiceItem);
  }

  private updateCurrentServiceItem(categoryUuid, newServiceItem): void {
    const categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === categoryUuid);
    const curCategory: ServiceTemplateSetCategories = this.templateSet.categories[categoryIndex];
    const serviceIndex = curCategory.services.findIndex(x => x.id === newServiceItem.id);
    const services: ServiceTemplateSetServices = curCategory.services[serviceIndex];

    for (const key in services) {
      if (services.hasOwnProperty(key)) {
        services[key] = newServiceItem[key];
      }
    }
  }

  private deleteCurrentServiceItem(categoryUuid, newServiceItem): void {
    const categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === categoryUuid);
    const curCategory: ServiceTemplateSetCategories = this.templateSet.categories[categoryIndex];
    const serviceIndex = curCategory.services.findIndex(x => x.id === newServiceItem.id);
    curCategory.services.splice(serviceIndex, 1);
  }
}
