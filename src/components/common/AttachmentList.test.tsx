import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AttachmentList, Attachment } from './AttachmentList';

afterEach(() => {
  cleanup();
});

describe('AttachmentList Component', () => {
  const mockAttachments: Attachment[] = [
    { name: 'document1.pdf', size: '2 MB' },
    { name: 'image.png', size: '500 KB' }
  ];

  it('renders nothing when the attachments array is empty', () => {
    const { container } = render(<AttachmentList attachments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct title and attachment count', () => {
    render(<AttachmentList attachments={mockAttachments} title="Files" />);
    // Verifies uppercase title string concatenation
    expect(screen.getByText('Files (2)')).toBeDefined();
  });

  it('renders all attachments with their names and sizes', () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(screen.getByText('document1.pdf')).toBeDefined();
    expect(screen.getByText('2 MB')).toBeDefined();
    expect(screen.getByText('image.png')).toBeDefined();
    expect(screen.getByText('500 KB')).toBeDefined();
  });

  it('triggers onDownload when an item is clicked and onDelete is NOT provided', () => {
    const onDownloadMock = vi.fn();
    render(<AttachmentList attachments={mockAttachments} onDownload={onDownloadMock} />);
    
    // Simulating a click on the parent card (triggering the fallback behavior)
    fireEvent.click(screen.getByText('document1.pdf'));
    expect(onDownloadMock).toHaveBeenCalledTimes(1);
    expect(onDownloadMock).toHaveBeenCalledWith(mockAttachments[0]);
    
    // Simulating a click on the explicit download icon button
    const buttons = document.querySelectorAll('md-icon-button');
    fireEvent.click(buttons[1]);
    expect(onDownloadMock).toHaveBeenCalledTimes(2);
    expect(onDownloadMock).toHaveBeenCalledWith(mockAttachments[1]);
  });

  it('prioritizes triggering onDelete when both are provided', () => {
    const onDeleteMock = vi.fn();
    const onDownloadMock = vi.fn();
    render(
      <AttachmentList 
        attachments={mockAttachments} 
        onDelete={onDeleteMock} 
        onDownload={onDownloadMock} 
      />
    );
    
    // Click on the second attachment card
    fireEvent.click(screen.getByText('image.png'));
    
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(mockAttachments[1]);
    // Verifies download logic was skipped
    expect(onDownloadMock).not.toHaveBeenCalled();
  });
});
