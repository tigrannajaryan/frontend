import { Directive, ElementRef, HostListener, OnInit } from '@angular/core';

@Directive({
  selector: '[madeAutosize]'
})

export class MadeAutosizeDirective implements OnInit {
  @HostListener('input', ['$event.target'])
  onInput(): void {
    this.adjust();
  }

  constructor(public element: ElementRef) {
  }

  ngOnInit(): void {
    setTimeout(() => this.adjust(), 0);
  }

  adjust(): void {
    const textArea = this.element.nativeElement.getElementsByTagName('textarea')[0];
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = `${textArea.scrollHeight}px`;
  }
}
