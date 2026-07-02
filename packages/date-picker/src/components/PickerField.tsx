import {
  useEffect,
  useId,
  useRef,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

export type PickerDisplayMode = 'popover' | 'inline';

export type HiddenField = {
  name: string;
  value: string;
};

type PickerFieldProps = {
  id?: string;
  name?: string;
  label?: ReactNode;
  helperText?: ReactNode;
  errorText?: ReactNode;
  placeholder?: string;
  valueText: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClear?: () => void;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  direction: 'ltr' | 'rtl';
  calendarId?: string;
  popoverLabel?: string;
  hiddenFields?: HiddenField[];
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'readOnly'
    | 'disabled'
    | 'required'
    | 'dir'
    | 'id'
    | 'name'
    | 'placeholder'
  >;
  children: ReactNode;
};

export function PickerField({
  id,
  name,
  label,
  helperText,
  errorText,
  placeholder,
  valueText,
  open,
  onOpenChange,
  onClear,
  clearable = true,
  disabled = false,
  readOnly = false,
  required = false,
  direction,
  calendarId,
  popoverLabel,
  hiddenFields,
  inputProps,
  children,
}: PickerFieldProps) {
  const generatedId = useId();
  const inputId = id ?? `adp-field-${generatedId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = errorText ? `${inputId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(' ') || undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const canInteract = !disabled && !readOnly;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onOpenChange, open]);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    inputProps?.onKeyDown?.(event);

    if (event.defaultPrevented || !canInteract) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      onOpenChange(true);
    }
  };

  return (
    <div
      ref={rootRef}
      className="adp-field-root"
      data-open={open ? 'true' : undefined}
      data-invalid={errorText ? 'true' : undefined}
      dir={direction}
    >
      {label ? (
        <label className="adp-field-label" htmlFor={inputId}>
          {label}
          {required ? <span className="adp-required-mark" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <div className="adp-field-control">
        <input
          {...inputProps}
          id={inputId}
          name={name}
          className={["adp-field-input", inputProps?.className].filter(Boolean).join(' ')}
          value={valueText}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          required={required}
          dir={direction}
          aria-invalid={errorText ? true : undefined}
          aria-describedby={describedBy}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={calendarId}
          onClick={(event: MouseEvent<HTMLInputElement>) => {
            inputProps?.onClick?.(event);
            if (canInteract) onOpenChange(true);
          }}
          onFocus={(event: FocusEvent<HTMLInputElement>) => {
            inputProps?.onFocus?.(event);
            if (canInteract) onOpenChange(true);
          }}
          onKeyDown={handleInputKeyDown}
        />
        {clearable && valueText && onClear && !disabled && !readOnly ? (
          <button
            type="button"
            className="adp-field-action adp-field-clear"
            onClick={() => onClear()}
            aria-label="Clear selected date"
          >
            ×
          </button>
        ) : null}
        <button
          type="button"
          className="adp-field-action adp-field-toggle"
          onClick={() => canInteract && onOpenChange(!open)}
          disabled={disabled || readOnly}
          aria-label={open ? 'Close calendar' : 'Open calendar'}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={calendarId}
        >
          ⌄
        </button>
      </div>

      {hiddenFields?.map((field) => (
        <input key={field.name} type="hidden" name={field.name} value={field.value} />
      ))}

      {helperText ? <div id={helperId} className="adp-field-helper">{helperText}</div> : null}
      {errorText ? <div id={errorId} className="adp-field-error" role="alert">{errorText}</div> : null}

      {open ? (
        <div className="adp-popover" role="dialog" aria-label={popoverLabel}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
