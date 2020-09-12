import { Injectable } from '@angular/core';

import * as Constants from '../app/app.constants';
import { MasterDataRecord } from '../model/masterData';
import { Result } from '../model/response';
import { DataProvider } from './data.provider';

@Injectable()
export class MasterDataProvider {

  private masterDataCache: Map<string, any> = new Map();

  constructor(public data: DataProvider) {
  }


  public load() {

    console.log("fetching master data from url: " + Constants.MASTER_DATA_PUBLISHER_URI);
    
    this.data.getAll<Result<MasterDataRecord>>(Constants.MASTER_DATA_PUBLISHER_URI).subscribe(
      result => {
        result.resources.forEach(masterRecord => {
          this.masterDataCache.set(masterRecord.type, masterRecord.data);
        });
        //perform operations to format data into a more usable format
        this.formatMasterData();

        console.log("master data load complete: ", this.masterDataCache);
      },
      error => {
        console.log("ERROR - could not load master data - ", error);
      }
    );
  }

  private formatMasterData(): void {
    //1. convert class-order data array into a map
    if(this.masterDataCache.has(Constants.MD_TYPE_CLASS_ORDERING)){
      let classOrders: { class: string; order: number }[] = this.masterDataCache.get(Constants.MD_TYPE_CLASS_ORDERING);
      let classOrderMap: Map<string, number> = new Map();
      classOrders.forEach(classOrder => {
        classOrderMap.set(classOrder.class, classOrder.order);
      })
      this.masterDataCache.set(Constants.MD_TYPE_CLASS_ORDERING, classOrderMap);
    }
  }

  public getMasterRecord(type: string): any {
    return this.masterDataCache.get(type);
  }


}
