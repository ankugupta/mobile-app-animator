import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'jugnu-kids',
  templateUrl: 'jugnu-kids.html',
})
export class JugnuKidsPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad JugnuKidsPage');
  }

}
