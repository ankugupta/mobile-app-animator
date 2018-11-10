import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { TabsPage } from '../pages/tabs/tabs';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = TabsPage;

  constructor(private screenOrientation: ScreenOrientation,
    platform: Platform,
    statusBar: StatusBar,
    splashScreen: SplashScreen) {

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      if (platform.is('cordova')) {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }
    });
  }

  // startScanning(){

  //   var imgDetectionPlugin = (<any>window).plugins.ImageDetectionPlugin;

  //   console.log("plugin loaded successfully: ", imgDetectionPlugin);

  //   imgDetectionPlugin.startProcessing(true, function(success){console.log(success);}, function(error){console.log(error);});

  //   imgDetectionPlugin.isDetecting(function(success){
  //     console.log(success);
  //     var resp = JSON.parse(success);
  //     alert("Index detected: " + resp.index + ", Image detected: " + indexes[resp.index]);
  //   }, function(error){console.log(error);});

  //   function setAllPatterns(patterns) {
  //     console.log("setting all patterns");
  //     imgDetectionPlugin.setPatterns(patterns, function(success){console.log(success);}, function(error){console.log(error);});
  //   }

  //   var loadAllImg = 0;
  //   var patternsHolder = [];
  //   var indexes = {};
  //   var limit = 3;

  //   function ToDataURL (self) {
  //     var canvas = document.createElement('canvas');
  //     var ctx = canvas.getContext('2d');
  //     var dataURL;
  //     canvas.height = self.height;
  //     canvas.width = self.width;
  //     ctx.drawImage(self, 0, 0);
  //     dataURL = canvas.toDataURL("image/jpeg", 0.8);
  //     patternsHolder.push(dataURL);
  //     indexes[loadAllImg] = self.src.substr(self.src.lastIndexOf("/") + 1);
  //     loadAllImg += 1;
  //     console.log("!!!", loadAllImg, indexes);
  //     if(loadAllImg == limit){
  //       console.log("patterns set", patternsHolder);
  //       alert("patterns set!");
  //       setAllPatterns(patternsHolder);
  //     }
  //     canvas = null;
  //   }

  //   var img = new Image();
  //   img.crossOrigin = "Anonymous";
  //   img.onload = function(){
  //     ToDataURL(this)
  //   };
  //   img.src = "assets/img/patterns/target1.jpg";

  //   var img = new Image();
  //   img.crossOrigin = "Anonymous";
  //   img.onload = function(){
  //     ToDataURL(this)
  //   };
  //   img.src = "assets/img/patterns/target2.jpg";

  //   var img = new Image();
  //   img.crossOrigin = "Anonymous";
  //   img.onload = function(){
  //     ToDataURL(this)
  //   };
  //   img.src = "assets/img/patterns/target3.jpg";

  // }
}
