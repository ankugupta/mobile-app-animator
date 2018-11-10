import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

@Component({
  selector: 'page-my-books',
  templateUrl: 'myBooks.html'
})
export class MyBooksPage {

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController
  ) { }

  deleteAlert() {
    let alert = this.alertCtrl.create({
      title: "Delete",
      subTitle: "Are you sure you want to delete this Book",
      buttons: ["NO", "YES"]
    });
    alert.present();
  }

}
