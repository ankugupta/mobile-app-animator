import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyPagesPage } from './my-pages';

@NgModule({
  declarations: [
    MyPagesPage,
  ],
  imports: [
    IonicPageModule.forChild(MyPagesPage),
  ],
})
export class MyPagesPageModule {}
