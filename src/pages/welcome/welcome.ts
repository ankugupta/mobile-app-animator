import { Component } from "@angular/core";
import { NavController, IonicPage } from "ionic-angular";
import * as PageConstants from "../pages.constants"

@IonicPage()
@Component({
  selector: "welcome",
  templateUrl: "welcome.html"
})
export class WelcomePage {
  constructor(public nav: NavController) {}

  goToLoginPage() {
    this.nav.push(PageConstants.LOGIN_PAGE);
  }
  goToSignupPage() {
    this.nav.push(PageConstants.SIGNUP_PAGE);
  }
  goToTabPage() {
    this.nav.setRoot(PageConstants.TABS_PAGE);
  }
}
