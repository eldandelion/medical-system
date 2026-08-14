import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AttachmentList, Attachment } from './AttachmentList';

afterEach(() => {
  cleanup();
});

describe('AttachmentList Component', () => {
  const mockAttachments: Attachment[] = [
    { name: 'document1.pdf', size: '2 MB', fileId: 101 },
    { name: 'image.png', size: '500 KB', fileId: 102 },
    { name: 'archive.zip', size: '10 MB', fileId: 103 },
  ];

  it('renders nothing when the attachments array is empty', () => {
    const { container } = render(<AttachmentList attachments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the correct title and attachment count', () => {
    render(<AttachmentList attachments={mockAttachments} title="Files" />);
    expect(screen.getByText('Files (3)')).toBeDefined();
  });

  it('renders all attachments with their names and sizes', () => {
    render(<AttachmentList attachments={mockAttachments} />);
    expect(screen.getByText('document1.pdf')).toBeDefined();
    expect(screen.getByText(/2 MB/)).toBeDefined();
    expect(screen.getByText('image.png')).toBeDefined();
    expect(screen.getByText(/500 KB/)).toBeDefined();
  });

  it('triggers onPreview for previewable files and onDownload for non-previewable files when card is clicked', () => {
    const onPreviewMock = vi.fn();
    const onDownloadMock = vi.fn();
    render(
      <AttachmentList 
        attachments={mockAttachments} 
        onPreview={onPreviewMock}
        onDownload={onDownloadMock} 
      />
    );
    
    // PDF card click should trigger onPreview
    fireEvent.click(screen.getByText('document1.pdf'));
    expect(onPreviewMock).toHaveBeenCalledTimes(1);
    expect(onPreviewMock).toHaveBeenCalledWith(mockAttachments[0]);

    // ZIP card click should trigger onDownload
    fireEvent.click(screen.getByText('archive.zip'));
    expect(onDownloadMock).toHaveBeenCalledTimes(1);
    expect(onDownloadMock).toHaveBeenCalledWith(mockAttachments[2]);
    
    // Explicit download icon button should always trigger onDownload
    const buttons = document.querySelectorAll('md-icon-button');
    fireEvent.click(buttons[0]);
    expect(onDownloadMock).toHaveBeenCalledTimes(2);
    expect(onDownloadMock).toHaveBeenCalledWith(mockAttachments[0]);
  });

  it('prioritizes triggering onDelete when onDelete is provided', () => {
    const onDeleteMock = vi.fn();
    const onDownloadMock = vi.fn();
    const onPreviewMock = vi.fn();
    render(
      <AttachmentList 
        attachments={mockAttachments} 
        onDelete={onDeleteMock} 
        onDownload={onDownloadMock}
        onPreview={onPreviewMock}
      />
    );
    
    fireEvent.click(screen.getByText('image.png'));
    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(mockAttachments[1]);
    expect(onDownloadMock).not.toHaveBeenCalled();
    expect(onPreviewMock).not.toHaveBeenCalled();
  });

  it('shows progress spinner when loadingFileId matches', () => {
    render(
      <AttachmentList 
        attachments={mockAttachments} 
        loadingFileId={101}
      />
    );
    
    expect(screen.getByText('progress_activity')).toBeDefined();
  });
});
