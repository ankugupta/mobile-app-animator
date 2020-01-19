//angular
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

//ionic-natives
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { QRScanner } from '@ionic-native/qr-scanner';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { SQLite } from '@ionic-native/sqlite';
import { Device } from '@ionic-native/device';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Network } from '@ionic-native/network';

//pages - all other pages are lazy loaded via their own modules
import { MyApp } from './app.component';

//providers
import { DataProvider } from '../providers/data.provider';
import { BooksProvider } from '../providers/books.provider';
import { SqlStorageProvider } from '../providers/sql-storage.provider';
import { DeviceProvider } from '../providers/device.provider';
import { FilesProvider } from '../providers/files.provider';
import { ScanProvider } from '../providers/scan.provider';

//custom modules
import { ComponentsModule } from '../components/components.module';
import { JugnuVideosProvider } from '../providers/jugnu-videos.provider';
import { MasterDataProvider } from '../providers/master-data.provider';



@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ComponentsModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    QRScanner,
    InAppBrowser,
    File,
    ScreenOrientation,
    SQLite,
    Device,
    FileTransfer,
    Network,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    DataProvider,
    BooksProvider,
    SqlStorageProvider,
    DeviceProvider,
    FilesProvider,
    ScanProvider,
    JugnuVideosProvider,
    MasterDataProvider,
    { provide: APP_INITIALIZER, useFactory: masterDataProviderFactory, deps: [MasterDataProvider], multi: true }
  ]
})
export class AppModule { }

/**
 * factory provider for APP_INITIALIZER - for loading master data
 */
export function masterDataProviderFactory(provider: MasterDataProvider) {
  return () => provider.load();
}
