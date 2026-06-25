import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GenericDialog } from './GenericDialog';

describe('GenericDialog Component', () => {
  it('does not render anything into the DOM when open is false', () => {
    render(
      <GenericDialog open={false} onClose={() => {}} title="Test Dialog">
        <div>Hidden Content</div>
      </GenericDialog>
    );
    expect(screen.queryByText('Test Dialog')).toBeNull();
    expect(screen.queryByText('Hidden Content')).toBeNull();
  });

  it('renders the dialog, title, and content when open is true', () => {
    render(
      <GenericDialog open={true} onClose={() => {}} title="Important Title">
        <div>Visible Content</div>
      </GenericDialog>
    );
    
    expect(screen.getByText('Important Title')).toBeDefined();
    expect(screen.getByText('Visible Content')).toBeDefined();
  });

  it('renders the custom actions block if provided', () => {
    render(
      <GenericDialog 
        open={true} 
        onClose={() => {}} 
        title="Title"
        actions={<button>Confirm Action</button>}
      >
        <div>Content</div>
      </GenericDialog>
    );
    
    expect(screen.getByText('Confirm Action')).toBeDefined();
  });
});
