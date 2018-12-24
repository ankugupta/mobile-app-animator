import { Component } from '@angular/core';
import { NavController, AlertController, Loading, LoadingController, IonicPage } from 'ionic-angular';
import { FormBuilder, FormGroup } from '@angular/forms';

@IonicPage()
@Component({
  selector: 'password-reset',
  templateUrl: 'password-reset.html',
})
export class PasswordResetPage {
  public resetPasswordForm: FormGroup;
  public loading: Loading;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController
  ) {

  }

}
