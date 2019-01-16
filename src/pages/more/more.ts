import { Component } from "@angular/core";
import { NavController, IonicPage } from "ionic-angular";
import * as PageConstants from "../pages.constants"

@IonicPage()
@Component({
  selector: "page-more",
  templateUrl: "more.html"
})
export class MorePage {
  constructor(public nav: NavController) {}

  openAboutUsPage() {
    this.nav.push(PageConstants.ABOUTUS_PAGE);
  };
  openHelpPage() {
    this.nav.push(PageConstants.HELP_PAGE);
  };
  openFaqPage() {
    this.nav.push(PageConstants.FAQ_PAGE);
  };

  logMeOut() {
    this.nav.parent.parent.setRoot(PageConstants.WELCOME_PAGE);
  };
 }
