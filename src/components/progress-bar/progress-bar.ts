import { Component, Input, SimpleChanges } from '@angular/core';

/**
 * Re-usable component to display a progress bar
 */
@Component({
  selector: 'progress-bar',
  templateUrl: 'progress-bar.html'
})
export class ProgressBarComponent {

  @Input('progress') progress;

  ngOnChanges(changes: SimpleChanges){
    console.log("Progress bar has value: " + changes.progress.currentValue);
  }

  constructor() {
  }

}
