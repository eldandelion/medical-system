import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { SmsLoginForm } from './SmsLoginForm';
import { AuthProvider } from '../../contexts/AuthContext';

let originalFetch: typeof global.fetch;
let fetchCalls: Array<{ url: string; init?: RequestInit }>;

const renderForm = (onLoginSuccess = vi.fn()) => {
  const onSuccess = onLoginSuccess;
  render(
    <AuthProvider>
      <SmsLoginForm onBackToPassword={() => {}} onLoginSuccess={onSuccess} />
    </AuthProvider>
  );
  return onSuccess;
};

function setMdInputValue(selector: string, value: string) {
  const field = document.querySelector(selector) as HTMLInputElement;
  field.value = value;
  fireEvent(field, new Event('input', { bubbles: true, cancelable: true }));
  return field;
}

const PHONE_FIELD = 'md-outlined-text-field[label="手机号"]';
const CODE_FIELD = 'md-outlined-text-field[label="验证码"]';

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status < 400,
    status,
    json: async () => body,
  }) as unknown as Response;

beforeEach(() => {
  originalFetch = global.fetch;
  fetchCalls = [];
});

afterEach(() => {
  vi.useRealTimers();
  global.fetch = originalFetch;
  cleanup();
});

describe('SmsLoginForm Component', () => {
  it('renders phone field, code field, MD3 send button and single back-to-password control', () => {
    const { container } = render(
      <AuthProvider>
        <SmsLoginForm onBackToPassword={() => {}} onLoginSuccess={() => {}} />
      </AuthProvider>
    );
    expect(document.querySelector(PHONE_FIELD)).toBeTruthy();
    expect(document.querySelector(CODE_FIELD)).toBeTruthy();

    const sendBtn = screen.getByTestId('sms-send-code-button');
    expect(sendBtn.tagName.toLowerCase()).toBe('md-outlined-button');
    expect(sendBtn.textContent).toContain('发送验证码');

    const backBtn = screen.getByTestId('sms-back-to-password');
    expect(backBtn.tagName.toLowerCase()).toBe('md-text-button');
    expect(backBtn.textContent).toContain('使用密码登录');
    expect(screen.queryByText('返回密码登录')).toBeNull();
    expect(container.querySelectorAll('input, textarea, select')).toHaveLength(0);
  });

  it('shows a validation error and does not call the API for an invalid phone', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => jsonResponse(200, {}));
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '12345');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('请输入正确的中国大陆手机号');
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the code via /api/auth/send-code with LOGIN purpose and starts the resend countdown', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      if (url.includes('/api/auth/send-code')) {
        return jsonResponse(200, { phone: '13800001234', devCode: '654321', expiresInSeconds: 300 });
      }
      return jsonResponse(200, {});
    });
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(screen.getByTestId('sms-info-message').textContent).toContain('5 分钟内有效');
    });
    const call = fetchCalls.find((c) => c.url.includes('/api/auth/send-code'));
    expect(call).toBeTruthy();
    expect(JSON.parse(call!.init?.body as string)).toEqual({ phone: '13800001234', purpose: 'LOGIN' });
    expect(screen.getByTestId('sms-send-code-button').textContent).toContain('后重发');
  });

  it('shows the mock devCode hint in dev builds when the backend returns one', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(200, { phone: '13800001234', devCode: '654321', expiresInSeconds: 300 })
    );
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(screen.getByTestId('sms-devcode-hint').textContent).toContain('654321');
    });
  });

  it('does NOT render the devCode hint when the backend returns none (real provider)', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(200, { phone: '13800001234', devCode: null, expiresInSeconds: 300 })
    );
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(screen.getByTestId('sms-info-message')).toBeTruthy();
    });
    expect(screen.queryByTestId('sms-devcode-hint')).toBeNull();
  });

  it('surfaces the rate-limit (429) message from the backend', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(429, { error: '发送过于频繁，请 42 秒后再试' })
    );
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('发送过于频繁');
    });
    // No countdown started when the send failed
    expect(screen.getByTestId('sms-send-code-button').textContent).not.toContain('后重发');
  });

  it('surfaces the daily-quota message from the backend', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(429, { error: '今日短信发送次数已达上限，请明天再试' })
    );
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('今日短信发送次数已达上限');
    });
  });

  it('surfaces the cooldown message from the backend', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse(400, { error: '短信发送过于频繁，请等待 58 秒后再试' })
    );
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByTestId('sms-send-code-button'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('请等待 58 秒');
    });
  });

  it('logs in directly via /api/auth/login-sms without calling /api/auth/verify-code', async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      if (url.includes('/api/auth/login-sms')) {
        return jsonResponse(200, {
          token: 'sms-jwt-token',
          role: 'STUDENT',
          name: '短信用户',
          student: { studentNumber: '13800001234', fullName: '短信用户', phone: '13800001234' },
        });
      }
      return jsonResponse(200, {});
    });
    global.fetch = fetchMock;

    renderForm(onSuccess);
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '123456');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
    const verifyCall = fetchCalls.find((c) => c.url.includes('/api/auth/verify-code'));
    const loginCall = fetchCalls.find((c) => c.url.includes('/api/auth/login-sms'));
    expect(verifyCall).toBeUndefined();
    expect(loginCall).toBeTruthy();
    expect(JSON.parse(loginCall!.init?.body as string)).toEqual({ phone: '13800001234', code: '123456' });
    expect(onSuccess.mock.calls[0][0]).toMatchObject({ token: 'sms-jwt-token', role: 'STUDENT' });
  });

  it('shows wrong-code and lockout errors from the backend without logging in', async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.fn(async () =>
      jsonResponse(400, { error: '验证码错误，还剩 2 次尝试机会' })
    );
    global.fetch = fetchMock;

    renderForm(onSuccess);
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '000000');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toContain('还剩 2 次');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('surfaces the lockout-invalidated message when the record was voided', async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.fn(async () =>
      jsonResponse(400, { error: '验证码错误次数过多，已被作废，请重新获取' })
    );
    global.fetch = fetchMock;

    renderForm(onSuccess);
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '000000');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toContain('次数过多');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('blocks login submit when the code field is empty', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      return jsonResponse(200, {});
    });
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toContain('请输入验证码');
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates 6-digit numeric OTP format before calling login-sms', async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200, {}));
    global.fetch = fetchMock;

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '12ab');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toContain('6 位数字验证码');
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('prevents duplicate login requests on rapid Enter presses while in flight', async () => {
    let resolveLogin!: (res: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        })
    );
    global.fetch = fetchMock;

    const onSuccess = vi.fn();
    renderForm(onSuccess);
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '123456');

    const formContainer = document.querySelector('.flex.flex-col.justify-between') as HTMLElement;
    fireEvent.keyDown(formContainer, { key: 'Enter' });
    fireEvent.keyDown(formContainer, { key: 'Enter' });

    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolveLogin(jsonResponse(200, { token: 'jwt-1', role: 'STUDENT' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  it('aborts in-flight login and ignores onLoginSuccess if unmounted before completion', async () => {
    let resolveLogin!: (res: Response) => void;
    let capturedSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
      capturedSignal = init?.signal ?? undefined;
      return new Promise<Response>((resolve) => {
        resolveLogin = resolve;
      });
    });
    global.fetch = fetchMock;

    const onSuccess = vi.fn();
    const { unmount } = render(
      <AuthProvider>
        <SmsLoginForm onBackToPassword={() => {}} onLoginSuccess={onSuccess} />
      </AuthProvider>
    );

    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '123456');
    fireEvent.click(screen.getByText('登录'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    unmount();
    expect(capturedSignal?.aborted).toBe(true);

    resolveLogin(jsonResponse(200, { token: 'jwt-stale', role: 'STUDENT' }));
    await Promise.resolve();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('routes 404 unregistered phone and 401 inactive account errors from login-sms to phoneError', async () => {
    global.fetch = vi.fn(async () =>
      jsonResponse(404, { error: '该手机号码尚未登记，请先创建账号' })
    );

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '123456');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('尚未登记');
    });
    expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toBeNull();

    cleanup();
    global.fetch = vi.fn(async () =>
      jsonResponse(401, { error: '账号尚未激活或已被禁用' })
    );
    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    setMdInputValue(CODE_FIELD, '123456');
    fireEvent.click(screen.getByText('登录'));

    await waitFor(() => {
      expect(document.querySelector(PHONE_FIELD)?.getAttribute('error-text')).toContain('已被禁用');
    });
    expect(document.querySelector(CODE_FIELD)?.getAttribute('error-text')).toBeNull();
  });

  it('ticks down resend countdown cleanly with fake timers', async () => {
    vi.useFakeTimers();
    global.fetch = vi.fn(async () =>
      jsonResponse(200, { phone: '13800001234', devCode: '654321', expiresInSeconds: 300 })
    );

    renderForm();
    setMdInputValue(PHONE_FIELD, '13800001234');
    await act(async () => {
      fireEvent.click(screen.getByTestId('sms-send-code-button'));
      await Promise.resolve();
    });

    expect(screen.getByTestId('sms-send-code-button').textContent).toContain('60s后重发');
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('sms-send-code-button').textContent).toContain('59s后重发');
  });
});
