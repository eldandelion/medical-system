export type FileCategory = 'AVATAR' | 'REFERRAL_ATTACHMENT' | 'FEEDBACK_ATTACHMENT';

export interface UploadedAttachmentResult {
  fileId: number;
  name: string;
  size: string;
  sizeBytes: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export async function uploadFileDirect(
  file: File,
  category: FileCategory,
  token?: string
): Promise<UploadedAttachmentResult> {
  const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  // 1. Request Upload Intent
  const intentRes = await fetch(`${baseUrl}/api/files/upload-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    },
    body: JSON.stringify({
      filename: file.name,
      sizeBytes: file.size,
      mimeType,
      category
    })
  });

  if (!intentRes.ok) {
    const errorData = await intentRes.json().catch(() => ({}));
    throw new Error(errorData.error || '获取上传凭证失败');
  }

  const { fileId, presignedUploadUrl } = await intentRes.json();

  // 2. Direct Binary Upload to MinIO S3
  const uploadRes = await fetch(presignedUploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType
    },
    body: file
  });

  if (!uploadRes.ok) {
    throw new Error('文件直传存储服务失败');
  }

  // 3. Complete Handshake to verify magic bytes & activate
  const completeRes = await fetch(`${baseUrl}/api/files/${fileId}/complete`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!completeRes.ok) {
    const errorData = await completeRes.json().catch(() => ({}));
    throw new Error(errorData.error || '文件完整性校验未通过');
  }

  const completeData = await completeRes.json();
  if (completeData.status === 'REJECTED') {
    throw new Error('文件安全检测未通过，已自动清理');
  }

  return {
    fileId,
    name: file.name,
    size: formatFileSize(file.size),
    sizeBytes: file.size
  };
}

export async function getReferralAttachmentDownloadUrl(
  referralId: string | number,
  fileId: string | number,
  intent: 'PREVIEW' | 'DOWNLOAD' = 'DOWNLOAD',
  token?: string
): Promise<string> {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const res = await fetch(`${baseUrl}/api/referrals/${referralId}/attachments/${fileId}/download-url?intent=${intent}`, {
    headers: {
      'Authorization': `Bearer ${token || ''}`
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || '获取下载链接失败');
  }

  const data = await res.json();
  return data.downloadUrl;
}
