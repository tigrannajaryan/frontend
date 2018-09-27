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

  autofocus(): void {
    // Autofocus code input.
    // Using setTimeout is the only way to succeed in programmatically setting focus on a real device.
    setTimeout(() => {
      this.codeInput.setFocus();
    });
  }

  onChange(): void {
    this.codeChange.emit({
      code: this.code.value,
      valid: this.code.valid
    });
  }

  /**
   * Reset value on code with error become focused.
   */
  onFocusCode(): void {
    if (this.code.value.length === CodeInputComponent.CODE_LENGTH) {
      // only happen when error occurred
      this.code.patchValue('');
      this.code.updateValueAndValidity();
      this.onChange();
    }
  }

  /**
   * Scroll code input to the left to prevent numbers to change their position relative to the boxes.
   */
  onAutoblurCode(event: any): void {
    const code: number = event.which || Number(event.code);
    const key: string = event.key || String.fromCharCode(code);

    if (!isNaN(parseInt(key, 10)) && event.target.value.length === CodeInputComponent.CODE_LENGTH - 1) {
      event.target.selectionStart = event.target.selectionEnd = 0;
      event.target.scrollLeft = 0;
      event.target.blur();
      setTimeout(() => {
        this.code.patchValue(event.target.value + key);
        this.code.updateValueAndValidity();
        this.onChange();
      });
    }
  }
}
