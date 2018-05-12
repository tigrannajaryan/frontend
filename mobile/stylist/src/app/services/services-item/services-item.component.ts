import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import {
  ServiceCategory,
  ServiceTemplateItem
} from '../../shared/stylist-service/stylist-models';

/**
 * Represents the data that is passed in and out of
 * the item editing form.
 */
export interface ServiceItemComponentData {
  categories?: ServiceCategory[];
  categoryUuid?: string;
  service?: ServiceTemplateItem;
}

/**
 * The modal form that is used for editing of service details.
 */
@IonicPage({ segment: 'service-item' })
@Component({
  selector: 'page-service-item',
  templateUrl: 'services-item.component.html'
})
export class ServiceItemComponent {

  data: ServiceItemComponentData;
  form: FormGroup;

  constructor(
    public navCtrl: NavController,
    public formBuilder: FormBuilder,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    // Unfortunately navaParams.get() is untyped 'any' data.
    this.data = navParams.get('data') as ServiceItemComponentData;
    this.createForm();
    this.setFormData();
  }

  onServiceDelete(): void {
    // Empty data indicates deleted item.
    const newData: ServiceItemComponentData = {
    };

    this.viewCtrl.dismiss(newData);
  }

  /**
   * Submit the data and close the modal.
   */
  submit(): void {
    const { vars, categoryUuid, ...newServiceItem } = this.form.value;

    const newData: ServiceItemComponentData = {
      service: newServiceItem,
      categoryUuid
    };

    this.viewCtrl.dismiss(newData);
  }

  private createForm(): void {
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
  private setFormData(): void {
    if (this.data) {
      if (this.data.categories) {
        const categoriesNameUuidArr = [];

        for (const curCategory of this.data.categories) {
          categoriesNameUuidArr.push({
            name: curCategory.name,
            uuid: curCategory.uuid
          });
        }

        this.setFormControl('vars.categories', categoriesNameUuidArr);
      }

      if (this.data.categoryUuid) {
        this.setFormControl('categoryUuid', this.data.categoryUuid);
      }

      if (this.data.service) {
        this.setFormControl('id', this.data.service.id);
        this.setFormControl('base_price', this.data.service.base_price);
        this.setFormControl('description', this.data.service.description);
        this.setFormControl('duration_minutes', this.data.service.duration_minutes);
        this.setFormControl('name', this.data.service.name);
      }
    }
  }

  private setFormControl(control: string, value: any): void {
    const formControl = this.form.get(control) as FormControl;
    formControl.setValue(value);
  }
}
