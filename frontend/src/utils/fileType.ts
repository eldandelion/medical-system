export type FileCategoryType = 'pdf' | 'image' | 'document' | 'other';

export interface FileCapability {
  category: FileCategoryType;
  isPreviewable: boolean;
  iconName: string;
}

export function getFileCapability(filename: string, mimeType?: string): FileCapability {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    return { category: 'pdf', isPreviewable: true, iconName: 'picture_as_pdf' };
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) || mimeType?.startsWith('image/')) {
    return { category: 'image', isPreviewable: true, iconName: 'image' };
  }
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    return { category: 'document', isPreviewable: false, iconName: 'description' };
  }
  return { category: 'other', isPreviewable: false, iconName: 'attach_file' };
}
