import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class UtilityService{

  // TAG COLORS IN ONE PLACE
  tagColors = {
    red: '#c72e30',
    green: '#428d5b',
    yellow: '#ec8a42',
    gray: '#CCC',
  }

  slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

}
