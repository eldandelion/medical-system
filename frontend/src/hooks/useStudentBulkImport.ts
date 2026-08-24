import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import {
  StudentImportPreview,
  StudentImportCommitRequest,
  StudentImportResult
} from '../types/studentImport';

export function useStudentBulkImport() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const downloadTemplate = async () => {
    try {
      const url = `${import.meta.env.BASE_URL}/api/students/import/template`.replace('//api', '/api');
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      if (!res.ok) {
        throw new Error('下载模板失败');
      }
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = '学生批量导入模板.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      showSnackbar({
        message: err.message || '下载模板失败，请检查网络连接',
        duration: 3000
      });
      throw err;
    }
  };

  const previewMutation = useMutation<StudentImportPreview, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const url = `${import.meta.env.BASE_URL}/api/students/import/preview`.replace('//api', '/api');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || '文件解析与预校验失败');
      }

      return res.json();
    },
    onError: (err: Error) => {
      showSnackbar({
        message: err.message || '预校验失败',
        duration: 4000
      });
    }
  });

  const commitMutation = useMutation<StudentImportResult, Error, StudentImportCommitRequest>({
    mutationFn: async (request: StudentImportCommitRequest) => {
      const url = `${import.meta.env.BASE_URL}/api/students/import/commit`.replace('//api', '/api');
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || '学生档案批量导入失败');
      }

      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/students'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/dashboard'] });
    },
    onError: (err: Error) => {
      showSnackbar({
        message: err.message || '导入提交失败',
        duration: 4000
      });
    }
  });

  return {
    downloadTemplate,
    previewCsv: previewMutation.mutateAsync,
    commitImport: commitMutation.mutateAsync,
    isPreviewLoading: previewMutation.isPending,
    isCommitLoading: commitMutation.isPending,
    previewData: previewMutation.data,
    commitData: commitMutation.data,
    resetPreview: previewMutation.reset,
    resetCommit: commitMutation.reset
  };
}
