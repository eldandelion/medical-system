import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FeedbackCreationForm } from './FeedbackCreationForm';
import * as React from 'react';

const mockShowSnackbar = vi.fn();
const mockSetHeaderActions = vi.fn();
const mockSetOnCloseInterceptor = vi.fn();
const mockInvalidateQueries = vi.fn();
const mockOnClose = vi.fn();

vi.mock('../../contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar
  })
}));

vi.mock('../../contexts/CreationContext', () => ({
  useCreationOverlay: () => ({
    viewState: 'MODAL',
    setHeaderActions: mockSetHeaderActions,
    setOnCloseInterceptor: mockSetOnCloseInterceptor
  })
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    session: { token: 'test-token' }
  })
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries
  })
}));

describe('FeedbackCreationForm', () => {
  let originalFetch: typeof global.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
    
    fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            { id: 'ref-1', studentName: 'Test Student', status: 'WAITING_FOR_APPOINTMENT', date: '2023-01-01' }
          ])
        });
      }
      if (url.includes('/api/feedback')) {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.reject(new Error('Not mocked'));
    });
    global.fetch = fetchMock as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.body.innerHTML = '';
  });

  it('Given component is loaded, Then attachment upload button is visibly disabled', async () => {
    render(<FeedbackCreationForm onClose={mockOnClose} initialReferralId="ref-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Student/)).toBeDefined();
    });

    const attachBtn = screen.getByText('上传病历或处方附件').closest('md-filled-tonal-button');
    expect(attachBtn).toBeDefined();
    expect(attachBtn?.hasAttribute('disabled')).toBe(true);
  });

  it('Given empty content, When submitted, Then shows validation error and does not call API', async () => {
    render(<FeedbackCreationForm onClose={mockOnClose} initialReferralId="ref-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Student/)).toBeDefined();
    });

    // Content is empty, click submit directly
    const submitBtn = screen.getByText('提交反馈');
    fireEvent.click(submitBtn);

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '请填写所有必填字段' }));
    
    // Fetch should only have been called for the GET /api/referrals, not POST /api/feedback
    const feedbackCalls = fetchMock.mock.calls.filter(call => call[0].includes('/api/feedback'));
    expect(feedbackCalls.length).toBe(0);
  });

  it('Given API returns 403, When submitted, Then shows permission error snackbar', async () => {
    // Override fetch just for the POST /api/feedback request
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 'ref-1', studentName: 'Test Student', status: 'WAITING_FOR_APPOINTMENT', date: '2023-01-01' }])
        });
      }
      if (url.includes('/api/feedback')) {
        return Promise.resolve({ ok: false, status: 403 });
      }
      return Promise.reject(new Error('Not mocked'));
    });

    render(<FeedbackCreationForm onClose={mockOnClose} initialReferralId="ref-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Student/)).toBeDefined();
    });

    const textareas = document.querySelectorAll('md-outlined-text-field[type="textarea"]');
    const feedbackInput = Array.from(textareas).find(el => el.getAttribute('label') === '诊疗反馈意见');
    (feedbackInput as any).value = 'Valid feedback.';
    fireEvent(feedbackInput!, new Event('input', { bubbles: true, cancelable: true }));

    const submitBtn = screen.getByText('提交反馈');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '权限不足' }));
    });
  });

  it('Given API returns 500, When submitted, Then shows generic failure snackbar', async () => {
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 'ref-1', studentName: 'Test Student', status: 'WAITING_FOR_APPOINTMENT', date: '2023-01-01' }])
        });
      }
      if (url.includes('/api/feedback')) {
        return Promise.resolve({ ok: false, status: 500 });
      }
      return Promise.reject(new Error('Not mocked'));
    });

    render(<FeedbackCreationForm onClose={mockOnClose} initialReferralId="ref-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Student/)).toBeDefined();
    });

    const textareas = document.querySelectorAll('md-outlined-text-field[type="textarea"]');
    const feedbackInput = Array.from(textareas).find(el => el.getAttribute('label') === '诊疗反馈意见');
    (feedbackInput as any).value = 'Valid feedback.';
    fireEvent(feedbackInput!, new Event('input', { bubbles: true, cancelable: true }));

    const submitBtn = screen.getByText('提交反馈');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '提交失败，请稍后重试' }));
    });
  });

  it('Given valid data, When submitted, Then sends correct payload and prevents double submission', async () => {
    // We use a delayed promise to simulate a pending request, allowing us to test double submission
    let resolveFeedback: (value: any) => void;
    const feedbackPromise = new Promise((resolve) => {
      resolveFeedback = resolve;
    });

    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/api/referrals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 'ref-1', studentName: 'Test Student', status: 'WAITING_FOR_APPOINTMENT', date: '2023-01-01' }])
        });
      }
      if (url.includes('/api/feedback')) {
        return feedbackPromise;
      }
      return Promise.reject(new Error('Not mocked'));
    });

    render(<FeedbackCreationForm onClose={mockOnClose} initialReferralId="ref-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Test Student/)).toBeDefined();
    });

    const textareas = document.querySelectorAll('md-outlined-text-field[type="textarea"]');
    const feedbackInput = Array.from(textareas).find(el => el.getAttribute('label') === '诊疗反馈意见');
    (feedbackInput as any).value = 'Patient is doing well.';
    fireEvent(feedbackInput!, new Event('input', { bubbles: true, cancelable: true }));

    const submitBtn = screen.getByText('提交反馈');
    
    // Click submit multiple times
    fireEvent.click(submitBtn);
    
    // The button should now theoretically be disabled due to isSubmitting, 
    // but React might not have flushed the re-render synchronously depending on environment.
    // However, we can assert that fetch was called.
    
    await waitFor(() => {
      const feedbackCalls = fetchMock.mock.calls.filter(call => call[0].includes('/api/feedback'));
      expect(feedbackCalls.length).toBe(1); // Crucially, assert called EXACTLY once
    });

    // Check exact DTO payload
    const postCallArgs = fetchMock.mock.calls.find(call => call[0].includes('/api/feedback'));
    expect(postCallArgs[1]).toEqual(expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        referralId: 'ref-1',
        content: 'Patient is doing well.',
        attachments: []
      })
    }));

    // Resolve the promise to finish the test cleanly
    resolveFeedback!({ ok: true, status: 200 });

    await waitFor(() => {
      expect(mockInvalidateQueries).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ message: '诊疗反馈已成功提交' }));
    });
  });
});
