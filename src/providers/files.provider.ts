import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File, FileEntry } from '@ionic-native/file';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Services for downloading files
 */
@Injectable()
export class FilesProvider {

  fileTransfer: FileTransferObject;

  constructor(private transfer: FileTransfer, private file: File) {
    console.log('FilesProvider constructed');
    this.fileTransfer = this.transfer.create();
  }

  public downloadFile(srcUrl: string, destPathname: string): Promise<string> {

    console.log("initiate file download:\nsrcUrl - " + srcUrl + "\nencoded srcUrl - " + encodeURI(srcUrl) + "\ndestPathname - " + destPathname);
    return new Promise<string>((resolve, reject) => {
      this.fileTransfer.download(encodeURI(srcUrl), this.file.dataDirectory + destPathname).then(
        (entry: FileEntry) => {
          let destUrl: string = entry.toURL();
          console.log('download complete: ' + destUrl);
          resolve(destUrl);
        },
        (error) => {
          console.log("Error downloading file: ", error);
          reject(error);
        });
    })
  }

  public getProgressAsObservable(): Observable<number> {
    return Observable.create((observer) => {
      this.fileTransfer.onProgress((progressEvent: ProgressEvent) => {
        let progressPercent = Math.floor(progressEvent.loaded / progressEvent.total * 100);
        //console.log("Progress: " + progressPercent + " (Loaded " + progressEvent.loaded + " of " + progressEvent.total + ")");
        observer.next(progressPercent);
      })
    })
  }

  /**
   * This 'tries' to abort on-going operation
   * since the operation might already have been completed
   */
  public tryToAbortOperation(): void {
    this.fileTransfer.abort();
  }

}
