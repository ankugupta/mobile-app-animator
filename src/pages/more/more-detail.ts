import { Component } from "@angular/core";
import { NavController, NavParams, Platform, IonicPage } from "ionic-angular";

@IonicPage()
@Component({
  selector: "more-detail-page",
  templateUrl: "more-detail.html"
})
export class MoreDetailPage {
  detail;
  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams
  ) {
    this.detail = navParams.data.detail;
  }
}
