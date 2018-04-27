import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '../../../../helpers/base-component';
import { Store } from '../../../../providers/store/store-model';
import { StoreService } from '../../../../providers/store/store';
import {
  ServiceTemplateSet,
  ServiceTemplateSetCategories,
  ServiceTemplateSetServices
} from '../../../../providers/stylist-service/stylist-models';
import { StoreServiceHelper } from '../../../../providers/store/store-helper';

@IonicPage({
  segment: 'service-add'
})
@Component({
  selector: 'page-service-item-add',
  templateUrl: 'services-item-add.component.html'
})
export class ServicesItemAddComponent extends BaseComponent {
  templateSet: ServiceTemplateSet;
  form: FormGroup;
  oldCategoryUuid: string;

  constructor(
    public navCtrl: NavController,
    public fb: FormBuilder,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    private store: StoreService,
    private storeHelper: StoreServiceHelper
  ) {
    super();
    this.init();
  }

  async init(): Promise<void> {
    await this.store.changes.safeSubscribe(this, (res: Store) => {
      this.templateSet = res.template_set;
    });

    const data = {
      templateSet: this.templateSet,
      ...this.navParams.get('data')
    };

    this.initForm();
    this.setForm(data);
  }

  initForm(): void {
    this.form = this.fb.group({
      vars: this.fb.group({
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

  setForm(data): void {
    if (data) {
      if (data.templateSet && data.templateSet.categories) {
        const categoriesNameUuidArr = [];

        for (const curCategory of this.templateSet.categories) {
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

  setFormControl(control, value): void {
    const formControl = this.form.get(control) as FormControl;
    formControl.setValue(value);
  }

  changeCategory(selectUuid): void {
    if (this.oldCategoryUuid && this.oldCategoryUuid !== selectUuid) {
      const {vars, categoryUuid, ...newServiceItem} = this.form.value;
      this.deleteCurrentServiceItem(categoryUuid, newServiceItem);
      this.pushNewServiceItem(categoryUuid, newServiceItem);
    }
    this.oldCategoryUuid = selectUuid;
  }

  pushNewServiceItem(categoryUuid, newServiceItem): void {
    const categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === categoryUuid);
    const curCategory: ServiceTemplateSetCategories = this.templateSet.categories[categoryIndex];
    curCategory.services.push(newServiceItem);
  }

  updateCurrentServiceItem(categoryUuid, newServiceItem): void {
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

  deleteCurrentServiceItem(categoryUuid, newServiceItem): void {
    const categoryIndex = this.templateSet.categories.findIndex(x => x.uuid === categoryUuid);
    const curCategory: ServiceTemplateSetCategories = this.templateSet.categories[categoryIndex];
    const serviceIndex = curCategory.services.findIndex(x => x.id === newServiceItem.id);
    curCategory.services.splice(serviceIndex, 1);
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
}
