import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as Constants from '../app/app.constants';
import { DataProvider } from './data.provider';
import { Result } from '../model/response';
import { Book } from '../model/book';
import { Video } from '../model/video';

@Injectable()
export class JugnuVideosProvider {

  constructor(public data: DataProvider) {
  }


  public getAll(): Observable<Result<Video>> {

    console.log("fetching video list from url: " + Constants.JUGNU_VIDEOS_URI);
    // return Observable.of(
    //   {
    //     resources: [
    //       { mediaUrl: "https://www.youtube.com/embed/gddB3Esa1ZU", thumbUrl: "https://img.youtube.com/vi/gddB3Esa1ZU/mqdefault.jpg" },
    //       { mediaUrl: "https://www.youtube.com/embed/ZYp2OXtj5gY", thumbUrl: "https://img.youtube.com/vi/ZYp2OXtj5gY/mqdefault.jpg" }
    //     ],
    //     count: 2
    //   });
    return this.data.getAll<Result<Video>>(Constants.JUGNU_VIDEOS_URI);
  }


}
