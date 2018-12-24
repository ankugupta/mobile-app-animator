import { Component } from "@angular/core";
import {
  NavController,
  Loading,
  LoadingController,
  AlertController,
  IonicPage
} from "ionic-angular";
import { FormBuilder, FormGroup } from "@angular/forms";

import * as PageConstants from '../pages.constants';

@IonicPage()
@Component({
  selector: "login",
  templateUrl: "login.html"
})
export class LoginPage {
  public loginForm: FormGroup;
  public loading: Loading;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
  ) {}

  goToSignup() {
    this.navCtrl.push(PageConstants.SIGNUP_PAGE);
  }
  goToResetPassword() {
    this.navCtrl.push(PageConstants.PASSWORD_RESET_PAGE);
  }

}
