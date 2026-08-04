import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class UtilityService{

  // BASE COLORS IN ONE PLACE
  baseColors = {
    blue: '#255498',
    gray: '#CCC',
    green: '#01ba01',
    red: '#e75557',
    yellow: '#febf48',
  }
  // Users page
  color = {
    brown: '#3c1a02',
    yellow: '#fceccc',
    lightGreen: '#bcf3c3',
    green: '#428d5b',
    lightGrey: "#ded9d9",
    grey: '#625f5f',
    blue: '#273265',
    lightBlue: '#ebf3fc',
  }

  // THIS APPLY JUST FOR LAST UPDATE AND CLOSED AT DATES
  isValidDate(date: string):string{
    if (date === "N/A"){
      return date
    }else return new Date(date).toDateString();
  }

  validLongDate(date: string):string{
    if (date === "N/A"){
      return date
    }else return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
  }

  slugify(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-');
  }

  /** Get file content type and set an icon */
  getType(contentType: string):{icon:string, type:string} {
    switch (contentType) {
      case 'application/pdf':
        return {icon:'/file-icons/pdf.webp', type: 'PDF'};

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return {icon:'/file-icons/doc.webp', type: 'DOC'};

      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return {icon:'/file-icons/xls.webp', type: 'XLS'};

      case 'application/zip':
      case 'application/x-zip-compressed':
      case 'application/x-7z-compressed':
      case 'application/x-rar-compressed':
        return {icon: 'file-icons/zip.webp', type: 'ZIP'};

      case 'image/png':
      case 'image/jpeg':
      case 'image/gif':
            return {icon: 'file-icons/img.webp', type: 'IMG'};
      default: return {icon: 'file-icons/other.webp', type: 'OTHER'};
    }
  }

  formatSize(bytes: number): string {
    if (!bytes) {
      return '0 B';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];

    let size = bytes;
    let unit = 0;

    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return `${size.toFixed(2)} ${units[unit]}`;
  }

}
