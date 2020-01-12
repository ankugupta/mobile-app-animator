import { Pipe, PipeTransform } from '@angular/core';
import { normalizeURL } from 'ionic-angular';

/**
 * Normalizes URL passed as argument
 */
@Pipe({
  name: 'normalized',
})
export class NormalizedPipe implements PipeTransform {

  transform(url: string, ...args) {
    try {
      let nUrl = normalizeURL(url);
      console.log(`input url: ${url}, normalized url: ${nUrl}`);
      return nUrl;
    } catch (error) {
      console.log(`ERROR: could not normalize url: ${url}, Details: ${error}`);
    }
    return url;
  }
}
