import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'md-chip-set': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      'md-filter-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        selected?: boolean;
        removable?: boolean;
      }, HTMLElement>;
      'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
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
        value?: string;
        'supporting-text'?: string;
        maxLength?: number;
        error?: boolean;
        'error-text'?: string;
      }, HTMLElement>;
      'md-outlined-select': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: string;
        error?: boolean;
        'error-text'?: string;
      }, HTMLElement>;
      'md-select-option': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        value?: string;
      }, HTMLElement>;
      'md-filled-tonal-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
      }, HTMLElement>;
    }
  }
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    slot?: string;
  }
}
