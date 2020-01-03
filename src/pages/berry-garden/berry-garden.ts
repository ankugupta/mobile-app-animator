import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'berry-garden',
  templateUrl: 'berry-garden.html',
})
export class BerryGardenPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad BerryGardenPage');
  }
  goToKgBooks(){
    this.navCtrl.push('SearchBooksPage');
  }
}
