import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class UtilityService{

  slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

}
