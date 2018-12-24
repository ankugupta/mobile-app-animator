import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ScanBookPage } from './scan-book';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ScanBookPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ScanBookPage),
  ],
})
export class ScanBookPageModule {}
