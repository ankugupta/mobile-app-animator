import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeviceProvider } from '../../providers/device.provider';
import * as PageConstants from '../../pages/pages.constants';
import { BooksProvider } from '../../providers/books.provider';

@IonicPage()
@Component({
  selector: 'berry-garden',
  templateUrl: 'berry-garden.html',
})
export class BerryGardenPage {

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public deviceProvider: DeviceProvider,
    private booksProvider: BooksProvider) {
  }

    
  goToBerryGardenSection(){

    
    
      this.navCtrl.setRoot(PageConstants.TABS_PAGE);
    
    
  }
}
