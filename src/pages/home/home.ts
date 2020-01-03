import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'home',
  templateUrl: 'home.html',
})
export class HomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }
goToBerryGarden(){
  this.navCtrl.push('BerryGardenPage');
}
goTojugnuKids(){
  this.navCtrl.push('JugnuKidsPage');
}
}
