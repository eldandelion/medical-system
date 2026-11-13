import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
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
  global.fetch = originalFetch;
  cleanup();
});

describe('SmsLoginForm Component', () => {
  it('renders phone field, code field, send button and back-to-password link', () => {
    renderForm();
    expect(document.querySelector(PHONE_FIELD)).toBeTruthy();
    expect(document.querySelector(CODE_FIELD)).toBeTruthy();
    expect(screen.getByTestId('sms-send-code-button').textContent).toContain('发送验证码');
    expect(screen.getByTestId('sms-back-to-password').textContent).toContain('使用密码登录');
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

  it('verifies then logs in via /api/auth/verify-code and /api/auth/login-sms', async () => {
    const onSuccess = vi.fn();
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      fetchCalls.push({ url, init });
      if (url.includes('/api/auth/verify-code')) {
        return jsonResponse(200, { valid: true });
      }
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
    expect(verifyCall).toBeTruthy();
    expect(JSON.parse(verifyCall!.init?.body as string)).toEqual({
      phone: '13800001234',
      code: '123456',
      purpose: 'LOGIN',
    });
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
});
