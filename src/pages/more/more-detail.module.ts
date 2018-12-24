import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MoreDetailPage } from './more-detail';

@NgModule({
  declarations: [
    MoreDetailPage
  ],
  imports: [
    IonicPageModule.forChild(MoreDetailPage)
  ],
})
export class MorePageModule {}
