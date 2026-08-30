import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSnackbar } from '../contexts/SnackbarContext';
import {
  downloadReferenceTemplate,
  previewReferenceImport,
  commitReferenceImport,
} from '../api/references';
import {
  ReferenceCategory,
  ReferenceImportPreviewDto,
  ReferenceImportResultDto,
  ReferenceImportRowDto,
} from '../types/references';

export function useReferenceBulkImport() {
  const { session } = useAuth();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [previewData, setPreviewData] = React.useState<ReferenceImportPreviewDto | null>(null);
  const [commitData, setCommitData] = React.useState<ReferenceImportResultDto | null>(null);

  const downloadTemplateMutation = useMutation<void, Error, ReferenceCategory>({
    mutationFn: (category) => downloadReferenceTemplate(category, session?.token),
    onError: (error) => {
      showSnackbar({ message: error.message || '下载导入模板失败' });
    },
  });

  const previewMutation = useMutation<
    ReferenceImportPreviewDto,
    Error,
    { category: ReferenceCategory; file: File }
  >({
    mutationFn: ({ category, file }) => previewReferenceImport(category, file, session?.token),
    onSuccess: (data) => {
      setPreviewData(data);
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '文件解析失败，请检查 CSV 格式' });
    },
  });

  const commitMutation = useMutation<
    ReferenceImportResultDto,
    Error,
    { category: ReferenceCategory; rows: ReferenceImportRowDto[]; overwriteDuplicates: boolean }
  >({
    mutationFn: ({ category, rows, overwriteDuplicates }) =>
      commitReferenceImport({ category, rows, overwriteDuplicates }, session?.token),
    onSuccess: (data, variables) => {
      setCommitData(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/references', variables.category] });
      showSnackbar({ message: `批量导入完成：成功新增 ${data.importedCount} 条，更新 ${data.updatedCount} 条` });
    },
    onError: (error) => {
      showSnackbar({ message: error.message || '导入提交失败，请重试' });
    },
  });

  const resetPreview = React.useCallback(() => {
    setPreviewData(null);
  }, []);

  const resetCommit = React.useCallback(() => {
    setCommitData(null);
  }, []);

  return {
    downloadTemplate: downloadTemplateMutation.mutateAsync,
    previewCsv: (category: ReferenceCategory, file: File) => previewMutation.mutateAsync({ category, file }),
    commitImport: (category: ReferenceCategory, rows: ReferenceImportRowDto[], overwriteDuplicates: boolean) =>
      commitMutation.mutateAsync({ category, rows, overwriteDuplicates }),
    isPreviewLoading: previewMutation.isPending,
    isCommitLoading: commitMutation.isPending,
    isDownloadingTemplate: downloadTemplateMutation.isPending,
    previewData,
    commitData,
    resetPreview,
    resetCommit,
  };
}
