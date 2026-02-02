import { Component } from '@angular/core';

@Component({
  selector: 'blog',
  templateUrl: './FormValidation.component.html',
  styles: [ `
    .valid {
      border: 2px solid rgb(138, 201, 138);
    }

    .invalid {
      border: 2px solid rgb(255, 108, 103);
    }

    .preview {
      border: 1px solid rgb(190, 190, 190);
    }
  ` ],
  standalone: false
})
export class BlogComponent {
  public submitted = false;
  public post = { title: '', content: '' };

  public onSubmit() {
    this.submitted = !this.submitted;
  }
}
