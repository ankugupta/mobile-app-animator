import { Component } from "@angular/core";
import { NavController, NavParams, IonicPage } from "ionic-angular";
import * as PageConstants from "../pages.constants";

@IonicPage()
@Component({
  selector: "page-more",
  templateUrl: "more.html"
})
export class MorePage {
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
  ) { }

  details = [
    {
      title: "About Us",
      icon: "md-information",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut sodales nunc. Morbi finibus ante viverra, auctor nisi quis, eleifend est. Etiam imperdiet, velit eget varius auctor, metus metus sodales augue, eu hendrerit elit leo vel lectus."
    },
    {
      title: "Help",
      icon: "md-help",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut sodales nunc. Morbi finibus ante viverra, auctor nisi quis, eleifend est. Etiam imperdiet, velit eget varius auctor, metus metus sodales augue, eu hendrerit elit leo vel lectus."
    },
    {
      title: "FAQ's",
      icon: "md-chatboxes",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut sodales nunc. Morbi finibus ante viverra, auctor nisi quis, eleifend est. Etiam imperdiet, velit eget varius auctor, metus metus sodales augue, eu hendrerit elit leo vel lectus."
    }
  ];

  openMoreDetailsPage(detail) {
    this.navCtrl.push(PageConstants.MORE_DETAIL_PAGE, { detail: detail });
  }

  logMeOut() {
    this.navCtrl.parent.parent.setRoot(PageConstants.WELCOME_PAGE);
  };
}
