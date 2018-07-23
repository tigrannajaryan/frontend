import {Component, OnDestroy, OnInit} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Store} from "@ngrx/store";
import {ProfileState, RequestUpdateProfileAction} from "~/core/reducers/profile.reducer";

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile-page.component.html',
})
export class ProfilePageComponent implements OnInit, OnDestroy {

  protected form: FormGroup;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public formBuilder: FormBuilder,
              protected store: Store<ProfileState>) {
  }

  ngOnDestroy(): void {

  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      first_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      last_name: ['', [
        Validators.maxLength(25),
        Validators.minLength(2),
        Validators.required
      ]],
      phone: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
      zip_code: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
      birthday: ['', [
        Validators.maxLength(15),
        Validators.minLength(5),
        Validators.required
      ]],
    })
  }

  submit(): void {
    this.store.dispatch(new RequestUpdateProfileAction(this.form.value))
  }

}
