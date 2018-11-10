import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { Platform, NavParams, NavController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { File } from '@ionic-native/file';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Book } from '../../model/book';


@Component({
  selector: 'page-scan-book',
  templateUrl: 'scan-book.html'
})
export class ScanBookPage implements OnInit{

  public currentBook: Book;
  public scanning: boolean = false;

  @ViewChild("myaudio")
  public myAudio: ElementRef;
  // Are we launching Vuforia with simple options?
  simpleOptions = null;
  // Which images have we matched?
  matchedImages = [];

  // Vuforia license
  vuforiaLicense = "AfwNugr/////AAABmXSkhi4Wc0y2k2u/t+KF1/iJ4ZMm1p1k8duNetuGt2xMVstBzN2aOC3aNkUMWuCQjUcdoluNVL+wkRqiden+ZsuveS8ccvkbGFZyPLexUsFBZrlrycv4c+O+tH6stLswQ8oh9mpwqFj09Kajfgr8Mabf40Y+QjtGffxa/Un93OMnULUCebsQVJVlY18GsUydNSSc5ijLmKqQpTLFp5xDWnSsVD3Pz9gE5z7Bvyv+2oI35uccwY/gEsKQhHs4oCbgESgTqMyTxvICvQO4vYEljmt3Ac4g4CQjVZcttQiAiRLxTDFcfY0xxORaXc9CltcVq4TWrviKRKAZsqDMLz2eOepHdHI42gpCfIJHDGnfMpTF";
  // Application Constructor
  constructor(private screenOrientation: ScreenOrientation, 
    private file: File, 
    private iab: InAppBrowser, 
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public platform: Platform) {

  }

  ngOnInit(){
    this.currentBook = this.navParams.get("book");
    console.log("current book: ", this.currentBook);    
  }

  public scanForImage(){
    this.startVuforia(true);
  }

  public startAndStop() {
    this.startVuforia(true);

    console.log('Starting timer...');

    // Wait for a timeout, then automatically stop Vuforia
    setTimeout(function () {
      this.stopVuforia();
    }, 10000);
  }

  public recognizeInSeq() {
    var imagesMatched = 0,
      imageSequence = ['iceland', ['canterbury-grass', 'brick-lane'], 'iceland'];

    var successCallback = function (data) {
      console.log('Found ' + data.result.imageName);

      imagesMatched++;

      this.playSound(); // Play a sound so that the user has some feedback

      // Are there more images to match?
      if (imagesMatched < imageSequence.length) {
        var newTargets = [imageSequence[imagesMatched]];

        console.log('Updating targets to: ' + newTargets);

        (<any>navigator).VuforiaPlugin.updateVuforiaTargets(
          newTargets,
          function (data) {
            console.log(data);
            console.log('Updated targets');
          },
          function (data) {
            alert("Error: " + data);
          }
        );
      } else {
        (<any>navigator).VuforiaPlugin.stopVuforia(function () {
          alert("Congratulations!\nYou found all three images!");
        },
          this.errorHandler);
      }
    };

    var options = {
      databaseXmlFile: 'PluginTest.xml',
      targetList: ['iceland'],
      overlayMessage: 'Scan images in the order: \'iceland\', (\'canterbury-grass\' or \'brick-lane\'), then \'iceland\'.',
      vuforiaLicense: this.vuforiaLicense,
      autostopOnImageFound: false
    };

    // Start Vuforia with our options
    (<any>navigator).VuforiaPlugin.startVuforia(
      options,
      successCallback,
      function (data) {
        alert("Error: " + data);
      }
    );
  }

  // Start the Vuforia plugin
  public startVuforia(simpleOptions, successCallback?, overlayMessage?, targets?) {
    var options;

    if (typeof overlayMessage == 'undefined')
      overlayMessage = 'Point your camera at an image...';

    if (typeof targets == 'undefined')
      //targets = ['iceland', 'canterbury-grass'];
      targets = ['abc'];

    // Reset the matched images
    this.matchedImages = [];

    // Set the global simpleOptions flag
    this.simpleOptions = simpleOptions;

    // Log out wether or not we are using simpleOptions
    console.log('Simple options: ' + !!this.simpleOptions);

    let file_path = "www/assets/targets/targetB/Test.xml";
    // Load either simple, or full options
    if (!!this.simpleOptions) {
      options = {
        databaseXmlFile: file_path,
        targetList: targets,
        overlayMessage: overlayMessage,
        vuforiaLicense: this.vuforiaLicense
      };
    } else {
      options = {
        databaseXmlFile: file_path,
        targetList: targets,
        vuforiaLicense: this.vuforiaLicense,
        overlayMessage: overlayMessage,
        showDevicesIcon: true,
        showAndroidCloseButton: true,
        autostopOnImageFound: false
      };
    }

    // Start Vuforia with our options
    (<any>navigator).VuforiaPlugin.startVuforia(
      options,
      successCallback || this.vuforiaMatch,
      function (data) {
        alert("Error: " + data);
      }
    );
  }

  vuforiaMatch = (data) => {
    // To see exactly what `data` can contain, see 'Success callback `data` API' within the plugin's documentation.
    console.log(data);

    // Have we found an image?
    if (data.status.imageFound) {
      // If we are using simple options, alert the image name
      if (this.simpleOptions) {
        console.log("Image name: " + data.result.imageName);
        this.playVideo();
      } else { // If we are using full options, add the image to an array of images matched
        this.matchedImages.push(data.result.imageName);
        this.playSound(); // Play a sound so that the user has some feedback
      }
    }
    // Are we manually closing?
    else if (data.status.manuallyClosed) {
      // Let the user know they've manually closed Vuforia
      alert("User manually closed Vuforia!");

      // If we've matched any images, tell the user what we found
      if (this.matchedImages.length) {
        alert("Found:\n" + this.matchedImages);
      }
    }
  }
  // Stop the Vuforia plugin
  public stopVuforia() {
    (<any>navigator).VuforiaPlugin.stopVuforia(function (data) {
      console.log(data);

      if (data.success == 'true') {
        alert('TOO SLOW! You took too long to find an image.');
      } else {
        alert('Couldn\'t stop Vuforia\n' + data.message);
      }
    }, function (data) {
      console.log("Error stopping Vuforia:\n" + data);
    });
  }

  //play video if image match found
  playVideo() {

    let img_path = this.file.applicationDirectory + "www/assets/videos/SampleVideo5mb.mp4";
    
    console.log("orientation before video: " + this.screenOrientation.type);
    console.log("playing video at: ", img_path);
    let iab = this.iab.create(img_path, "_blank", "location=no,hidden=yes");

    iab.on("loadstop").subscribe(
      () => {
        console.log("loadstop fired!");
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        iab.show();
      }
    )
    iab.on("exit").subscribe(
      () => {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
        console.log("orientation after browser close: " + this.screenOrientation.type);
      }
    )

  }
  // Play a bell sound
  public playSound() {
    // Where are we playing the sound from?
    var soundURL = this.getMediaURL("sounds/sound.wav");

    this.myAudio.nativeElement.src = soundURL;
    this.myAudio.nativeElement.play();
    (<any>navigator).VuforiaPlugin.startVuforiaTrackers(
      function () {
        console.log('Started tracking again')
      },
      function () {
        console.log('Could not start tracking again')
      }
    );
  }
  // Get the correct media URL for both Android and iOS
  public getMediaURL(s) {
    if (this.platform.is("android")) return "/android_asset/www/" + s;
    return s;
  }


}
