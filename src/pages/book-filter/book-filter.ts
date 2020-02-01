import {
  AlertController, IonicPage, LoadingController, NavController, NavParams, Platform
} from 'ionic-angular';

import { Component } from '@angular/core';

import { BooksProvider } from '../../providers/books.provider';
import { DeviceProvider } from '../../providers/device.provider';
import * as PageConstants from '../pages.constants';

@IonicPage()
@Component({
  selector: 'book-filter',
  templateUrl: 'book-filter.html',
})
export class BookFilterPage {

  schoolClassList: string[] = [];
  //currentClass: string;

  constructor(private navCtrl: NavController,
    private platform: Platform,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private navParams: NavParams,
    private deviceProvider: DeviceProvider,
    private booksProvider: BooksProvider
  ) {
  }

  ionViewWillEnter() {

    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else if (this.schoolClassList.length == 0) {
      //load books and other data - this page uses only the class data, but other info fetched is required 
      //in other parts of the app
      this.loadBooks();
    }
    //this.subscribeToClassFilterSubject();

  }

  //the value of class filter can be updated via this page itself
  //however, to highlight the current filter value next time this page opens,
  //we subscribe to the subject tracking the filter's value
  // subscribeToClassFilterSubject() {
  //   this.booksProvider.getClassFilterAsObservable().subscribe(classFilter => {
  //     this.currentClass = classFilter;
  //   })
  // }

  //triggers loading of book list - uses the list of school classes calculated from book data
  //to give users an option to filter books by class
  public loadBooks() {
    let loader = this.loadingController.create();
    loader.present();

    this.booksProvider.getAll().subscribe(
      () => {
        //setup filter
        this.booksProvider.getSchoolClassList().forEach(schoolClass => this.schoolClassList.push(schoolClass));
        loader.dismiss();
        console.log("fetched class list: ", this.schoolClassList);
      },
      error => {
        loader.dismiss();
        console.log("ERROR: while loading class list ", error);
        this.presentFailureAlert("Technical Error", "Please try again later");
      }
    )
  }

  setClassFilter(filterVal: string) {
    this.booksProvider.setClassFilterNextVal(filterVal);
    this.navCtrl.setRoot(PageConstants.TABS_PAGE);
  }

  presentOfflineAlert() {
    let alert = this.alertCtrl.create({
      title: "Device Offline",
      subTitle: "A connection to internet is required to use this section. Please connect to a Wi-Fi or cellular network.",
      buttons: [
        {
          text: "OK",
          role: "cancel"
        }
      ]
    });
    alert.present();
  }

  presentFailureAlert(title: string, message: string) {
    if (this.deviceProvider.checkNetworkDisconnected()) {
      this.presentOfflineAlert();
    }
    else {
      let alert = this.alertCtrl.create({
        title: title,
        message: message,
        buttons: [
          {
            text: "OK",
            role: "cancel",
            handler: () => {
              if (this.platform.is('android')) {
                this.platform.exitApp();
              }
            }
          }
        ]
      });
      alert.present();
    }
  }
}
