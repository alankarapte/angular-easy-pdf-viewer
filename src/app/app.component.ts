import { HttpClient } from '@angular/common/http';
import { Component, OnInit, VERSION } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  pdfForm: FormGroup;
  pdfData: any;
  constructor(
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.pdfForm = this.fb.group({
      source: '',
    });
  }

  dataURLtoBlob(dataURL) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    let byteString;
    if (dataURL.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURL.split(',')[1]);
    } else {
      byteString = unescape(dataURL.split(',')[1]);
    }
    // separate out the mime component
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    const blobImg = new Blob([ia], { type: mimeString });
    return blobImg;
  }

  onSubmit(pdfForm: FormGroup) {
    const sourceValue: string = pdfForm.value.source;
    const isURI = sourceValue.startsWith('http');

    if (isURI) {
      this.http
        .get(sourceValue, { responseType: 'blob', observe: 'response' })
        .subscribe((data) => {
          const fileName = sourceValue.substring(
            sourceValue.lastIndexOf('/') + 1
          );

          let metadata = {
            type: 'application/pdf',
          };
          let file = new File([data.body], fileName, metadata);
          const objectURL = URL.createObjectURL(file);
          console.log(objectURL, fileName);

          this.pdfData = {
            source: this.sanitizer.bypassSecurityTrustResourceUrl(objectURL),
          };
        });
    } else {
      const blob = this.dataURLtoBlob(sourceValue);

      const objectURL = URL.createObjectURL(blob);
      this.pdfData = {
        source: this.sanitizer.bypassSecurityTrustResourceUrl(objectURL),
      };
    }

    // console.log(this.pdfData);
  }
}
