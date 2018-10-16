import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface CodeData {
  code: string;
  valid: boolean;
}

@Component({
  selector: 'code-input',
  templateUrl: 'code-input.component.html'
})
export class CodeInputComponent implements AfterViewInit {
  static CODE_LENGTH = 6;

  digits = Array(CodeInputComponent.CODE_LENGTH).fill(undefined);

  @Input() isDisabled = false;
  @Input() hasError = false;

  @Output() codeChange = new EventEmitter<CodeData>();

  code: FormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(CodeInputComponent.CODE_LENGTH),
    Validators.maxLength(CodeInputComponent.CODE_LENGTH)
  ]);

  @ViewChild('input') codeInput;

  // Prevents firing focus event
  isScrolled = false;

  // Get native input (for more details see https://forum.ionicframework.com/t/ion-input-and-the-nativeelement/82049)
  @ViewChild('input', { read: ElementRef }) codeInputRef;
  nativeInput: HTMLInputElement;

  ngAfterViewInit(): void {
    this.nativeInput = this.codeInputRef.nativeElement.querySelector('input');
  }

  autofocus(): void {
    // Autofocus code input.
    // Using setTimeout is the only way to succeed in programmatically setting focus on a real device.
    setTimeout(() => {
      this.codeInput.setFocus();
    });
  }

  /**
   * Reset value on code with error become focused.
   */
  onFocusCode(): void {
    if (!this.isScrolled && this.code.value.length >= CodeInputComponent.CODE_LENGTH) {
      // only happen when error occurred
      this.code.patchValue('');
      this.code.updateValueAndValidity();
      this.emitOnChange();
    }
  }

  // Note: using (ionChange)="onInput($event)" because of a strange bug: doubled onInput and therefor doubled code confirm request
  // (more info https://github.com/ionic-team/ionic/issues/12432)
  onInput(event: any): void {
    this.emitOnChange();

    if (this.codeInput.value.length >= CodeInputComponent.CODE_LENGTH) {
      // Scroll code input to the left to prevent numbers changing their position in boxes.
      // isScrolled=true should prevent clearing out the input when the focus event is fired.
      this.isScrolled = true;
      this.nativeInput.selectionStart = this.nativeInput.selectionEnd = 0;
      this.nativeInput.scrollLeft = 0;
      this.isScrolled = false;
      this.nativeInput.blur();
    }
  }

  private emitOnChange(): void {
    this.codeChange.emit({
      code: this.code.value,
      valid: this.code.valid
    });
  }
}
