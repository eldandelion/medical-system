# SMS Code Login for the Web App — Integration Plan (draft)

## Problem
Mobile intake already ships SMS code confirmation, and the backend side is merged:
send-code / verify-code / login-sms endpoints, the OTP engine, and SmsSender with
Mock + Aliyun implementations. The web app cannot use any of it: LoginOverlay is
password-only, there is no aliyun.sms.* config plumbing, and send-code has no
abuse protection, so real SMS is unreachable and unguarded.

## Scope
1. Web SMS login UI — a phone + 6-digit code flow in LoginOverlay, reusing the
   existing backend endpoints instead of a parallel API.
2. Config plumbing — aliyun.sms.* properties wired through env-driven
   configuration, with the mock sender as the default so dev/test need no
   credentials.
3. Abuse protection — per-IP rate limit plus a daily quota on the send-code
   endpoint.
4. Tests — controller tests covering rate limiting/quota and the SMS login flow.

A full implementation follows shortly; this branch is kept as a draft PR until
that lands.
