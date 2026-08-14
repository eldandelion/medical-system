import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import { getReferralAttachmentDownloadUrl } from '../api/files';
import { getFileCapability } from '../utils/fileType';

export interface AttachmentTarget {
  referralId: string | number;
  fileId: string | number;
  name: string;
}

export function useAttachmentActions() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [loadingFileId, setLoadingFileId] = useState<string | number | null>(null);

  const downloadAttachment = useCallback(async (target: AttachmentTarget) => {
    if (!target.fileId || !target.referralId) {
      showSnackbar({ message: '暂无可用下载文件', duration: 2000 });
      return;
    }

    setLoadingFileId(target.fileId);
    try {
      const downloadUrl = await getReferralAttachmentDownloadUrl(
        target.referralId,
        target.fileId,
        'DOWNLOAD',
        session?.token
      );

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = target.name;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
    } catch (err: any) {
      showSnackbar({ message: err.message || '下载失败', duration: 3000 });
    } finally {
      setLoadingFileId(null);
    }
  }, [session?.token, showSnackbar]);

  const previewAttachment = useCallback(async (target: AttachmentTarget) => {
    if (!target.fileId || !target.referralId) {
      showSnackbar({ message: '暂无可用预览文件', duration: 2000 });
      return;
    }

    const capability = getFileCapability(target.name);
    if (!capability.isPreviewable) {
      return downloadAttachment(target);
    }

    // Synchronously open blank window in user gesture tick to prevent popup blocker
    const win = window.open('about:blank', '_blank');
    if (!win) {
      showSnackbar({ message: '浏览器阻止了预览窗口，请允许弹出窗口后重试', duration: 4000 });
      return;
    }

    // Sever opener to eliminate reverse tab-nabbing vulnerability
    win.opener = null;

    // Inject immediate loading feedback into the new tab
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>正在加载: ${encodeURIComponent(target.name)}</title>
          <style>
            body { margin:0; font-family: system-ui, -apple-system, sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#f8fafc; color:#334155; }
            .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #0284c7; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
            @keyframes spin { to { transform: rotate(360deg); } }
            p { font-size: 14px; font-weight: 500; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <p>正在安全获取附件预览...</p>
        </body>
      </html>
    `);

    setLoadingFileId(target.fileId);
    try {
      const previewUrl = await getReferralAttachmentDownloadUrl(
        target.referralId,
        target.fileId,
        'PREVIEW',
        session?.token
      );
      win.location.replace(previewUrl);
    } catch (err: any) {
      win.document.body.innerHTML = `
        <div style="text-align:center; padding: 24px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="color:#ef4444; margin-bottom:8px;">预览加载失败</h3>
          <p style="color:#64748b;">${err.message || '无法获取附件访问凭证'}</p>
          <button onclick="window.close()" style="margin-top:16px; padding:8px 16px; border:none; background:#0284c7; color:white; border-radius:6px; cursor:pointer;">关闭窗口</button>
        </div>
      `;
      showSnackbar({ message: err.message || '预览加载失败', duration: 3000 });
    } finally {
      setLoadingFileId(null);
    }
  }, [session?.token, showSnackbar, downloadAttachment]);

  return {
    downloadAttachment,
    previewAttachment,
    loadingFileId,
  };
}
