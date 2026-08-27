import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        selected?: boolean;
        removable?: boolean;
        elevated?: boolean;
        disabled?: boolean;
        'has-icon'?: boolean;
      }, HTMLElement>;
      'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        elevated?: boolean;
        disabled?: boolean;
      }, HTMLElement>;
      'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        ariaLabel?: string;
      }, HTMLElement>;
      'md-dialog': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        open?: boolean;
        type?: 'alert' | 'full-screen';
        headline?: string;
      }, HTMLElement>;
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
      'md-outlined-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
      'md-text-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
      'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
        label?: string;
        lowered?: boolean;
      }, HTMLElement>;
      'md-outlined-text-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        rows?: number;
        label?: string;
        placeholder?: string;
        value?: string;
        disabled?: boolean;
        'supporting-text'?: string;
        maxLength?: number;
        error?: boolean;
        'error-text'?: string;
      }, HTMLElement>;
      'md-outlined-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: string;
        disabled?: boolean;
        error?: boolean;
        'error-text'?: string;
      }, HTMLElement>;
      'md-select-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
        selected?: boolean;
        disabled?: boolean;
      }, HTMLElement>;
      'md-filled-tonal-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
      'md-menu': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        anchor?: string;
        open?: boolean;
        quick?: boolean;
        'has-overflow'?: boolean;
        positioning?: 'absolute' | 'fixed' | 'document' | 'popover';
        'anchor-corner'?: string;
        'menu-corner'?: string;
        'x-offset'?: number;
        'y-offset'?: number;
        'stay-open-on-outside-click'?: boolean;
        'stay-open-on-focusout'?: boolean;
        onClosed?: () => void;
        onClose?: () => void;
        onOpened?: () => void;
      }, HTMLElement>;
      'md-menu-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        selected?: boolean;
      }, HTMLElement>;
      'md-checkbox': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
        indeterminate?: boolean;
        'aria-label'?: string;
        'touch-target'?: 'wrapper' | 'none';
      }, HTMLElement>;
      'md-radio': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        checked?: boolean;
        disabled?: boolean;
        name?: string;
        value?: string;
        'aria-label'?: string;
        'touch-target'?: 'wrapper' | 'none';
      }, HTMLElement>;
      'md-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        type?: string;
        href?: string;
      }, HTMLElement>;
    }
  }
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    slot?: string;
  }
}
