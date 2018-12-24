import { Component } from "@angular/core";
import {
  NavController,
  LoadingController,
  Loading,
  AlertController,
  IonicPage
} from "ionic-angular";
import { FormBuilder, FormGroup } from "@angular/forms";

@IonicPage()
@Component({
  selector: "signup",
  templateUrl: "signup.html"
})
export class SignupPage {
  public signupForm: FormGroup;
  public loading: Loading;

  constructor(
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public formBuilder: FormBuilder,
   ) {  }
 }
