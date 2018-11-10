import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { MyBooksPage } from '../pages/myBooks/myBooks';
import { SearchBooksPage } from '../pages/searchBooks/searchBooks';
import { BookDetailsPage} from '../pages/bookDetails/bookDetails';
import { TabsPage } from '../pages/tabs/tabs';
import { ScanBookPage } from '../pages/scan-book/scan-book';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { QRScanner } from '@ionic-native/qr-scanner';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { DataProvider } from '../providers/data.provider';
import { BooksProvider } from '../providers/books.provider';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    MyBooksPage,
    SearchBooksPage,
    BookDetailsPage,
    TabsPage,
    ScanBookPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    MyBooksPage,
    SearchBooksPage,
    TabsPage,
    BookDetailsPage,
    ScanBookPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QRScanner,
    InAppBrowser,
    File,
    ScreenOrientation,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataProvider,
    BooksProvider
  ]
})
export class AppModule {}
