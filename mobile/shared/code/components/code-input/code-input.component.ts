import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

export interface CodeData {
  code: string;
  valid: boolean;
}

@Component({
  selector: 'code-input',
  templateUrl: 'code-input.component.html'
})
export class CodeInputComponent {
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

  isScrolled = false;

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

  onInput(event: any): void {
    this.emitOnChange();

    if (this.code.value.length >= CodeInputComponent.CODE_LENGTH) {
      // Scroll code input to the left to prevent numbers changing their position in boxes.
      // isScrolled=true should prevent clearing out the input when the focus event is fired.
      this.isScrolled = true;
      event.target.selectionStart = event.target.selectionEnd = 0;
      event.target.scrollLeft = 0;
      this.isScrolled = false;
      event.target.blur();
    }
  }

  private emitOnChange(): void {
    this.codeChange.emit({
      code: this.code.value,
      valid: this.code.valid
    });
  }
}
