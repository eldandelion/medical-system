import * as React from 'react';
import { SecondaryButton, PrimaryButton } from '../common/Buttons';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { Student } from '../../types';
import { AttachmentList } from '../common/AttachmentList';

export function ReferralCreationForm({ onClose }: { onClose: () => void }) {
  const { viewState, setHeaderActions } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const isFullscreen = viewState === 'FULLSCREEN';

  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    studentId: '',
    title: '',
    reason: '',
    riskLevel: '',
    clinicalStatus: ['Current Medication', 'Prior Therapy'],
    severeRiskFactors: [] as string[],
    attachments: [
      { name: 'Patient_Intake_Scan_v2.pdf', size: '2.4 MB' },
      { name: 'Hospital_Release_Form.png', size: '1.1 MB' },
    ]
  });

  const handleSubmit = (actionType: 'draft' | 'submit') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      showSnackbar({
        message: actionType === 'draft' ? '草稿已保存' : '转诊申请已成功提交',
        duration: 4000
      });
    }, 1500);
  };

  React.useEffect(() => {
    const controller = new AbortController();
    fetch('/api/students', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch students:', err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  React.useEffect(() => {
    if (isFullscreen) {
      setHeaderActions(
        <div className="flex items-center gap-3 mr-4">
          <SecondaryButton label="保存草稿" onClick={() => handleSubmit('draft')} disabled={isSubmitting} />
          <PrimaryButton label={isSubmitting ? "提交中..." : "提交"} onClick={() => handleSubmit('submit')} disabled={isSubmitting} />
        </div>
      );
    } else {
      setHeaderActions(null);
    }
    return () => {
      setHeaderActions(null);
    };
  }, [isFullscreen, setHeaderActions, isSubmitting]);

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] relative">
      {isSubmitting && (
        <md-linear-progress indeterminate className="absolute top-0 left-0 right-0 w-full z-50"></md-linear-progress>
      )}
      <div className={`flex-1 overflow-y-auto p-6 ${isFullscreen ? 'pb-8' : 'pb-32'}`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-10">

          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person_search</span>
              转诊学生选择
            </h3>
            <div className="relative">
              <md-outlined-select
                label={loading ? '正在加载学生列表...' : '选择学生'}
                className="w-full relative"
                value={formData.studentId}
                onChange={(e: any) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                disabled={loading || students.length === 0 || isSubmitting}
              >
                {students.map((student) => {
                  return (
                    <md-select-option key={student.id} value={student.id}>
                      <div slot="headline">{student.name}</div>
                    </md-select-option>
                  );
                })}
              </md-outlined-select>
            </div>

            {selectedStudent && (
              <div className="border border-[var(--md-sys-color-outline-variant)] rounded-[12px] p-6 bg-[var(--md-sys-color-surface)]">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-6 items-center">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">学号</span>
                    <span className="text-[16px] leading-[24px] tracking-[0.5px] text-[var(--md-sys-color-on-surface)] mt-1">
                      {selectedStudent.demographics?.studentId || selectedStudent.id}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)]">专业</span>
                    <span className="text-[16px] leading-[24px] tracking-[0.5px] text-[var(--md-sys-color-on-surface)] mt-1">
                      {selectedStudent.major}
                    </span>
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <span className="text-[14px] font-medium tracking-[0.1px] text-[var(--md-sys-color-on-surface-variant)] mb-2">风险因素</span>
                    <div className={`px-3 py-1 rounded-full flex items-center gap-1 font-bold text-[12px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${selectedStudent.riskLevel === 'High'
                      ? 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]'
                      : 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]'
                      }`}>
                      <md-icon style={{ fontSize: '16px', width: '14px', height: '14px' }}>
                        {selectedStudent.riskLevel === 'High' ? 'warning' : 'info'}
                      </md-icon>
                      <span>
                        {selectedStudent.riskLevel === 'High' ? '高风险' : '中低风险'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
              临床背景
            </h3>
            <md-outlined-text-field
              label="标题"
              className="w-full"
              value={formData.title}
              onInput={(e: any) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              disabled={isSubmitting}
            >
            </md-outlined-text-field>
            <md-outlined-text-field
              type="textarea"
              rows={4}
              label="转诊原因"
              className="w-full"
              supporting-text={`* 字数限制: ${formData.reason.length}/500`}
              maxLength={500}
              value={formData.reason}
              onInput={(e: any) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              disabled={isSubmitting}
            >
            </md-outlined-text-field>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">medical_information</span>
              分诊评估分类
            </h3>
            <div className="flex flex-col gap-3">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">风险等级</span>
              <div className="flex border border-[var(--md-sys-color-outline)] rounded-full overflow-hidden w-fit">
                <button disabled={isSubmitting} className="px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline)] transition-colors">低风险</button>
                <button disabled={isSubmitting} className="px-6 py-2.5 text-[14px] font-medium hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)] border-r border-[var(--md-sys-color-outline)] transition-colors">中风险</button>
                <button disabled={isSubmitting} className="px-6 py-2.5 text-[14px] font-medium bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] transition-colors">高风险</button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">临床就诊状态</span>
              <md-chip-set>
                <md-filter-chip label="初诊" disabled={isSubmitting}></md-filter-chip>
                <md-filter-chip label="正在服药" selected disabled={isSubmitting}></md-filter-chip>
                <md-filter-chip label="既往心理治疗" selected disabled={isSubmitting}></md-filter-chip>
              </md-chip-set>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">严重风险因素</span>
              <md-chip-set>
                <md-filter-chip label="自杀意念" disabled={isSubmitting}></md-filter-chip>
                <md-filter-chip label="自杀企图" disabled={isSubmitting}></md-filter-chip>
                <md-filter-chip label="自残行为" disabled={isSubmitting}></md-filter-chip>
              </md-chip-set>
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">attachment</span>
              附件列表
            </h3>

            <div className="flex flex-col gap-4">
              <div>
                <md-filled-tonal-button className="[&::part(button)]:px-0" disabled={isSubmitting}>
                  <md-icon slot="icon" className="ml-4">upload</md-icon>
                  <span className="mr-4">上传附件</span>
                </md-filled-tonal-button>
              </div>
              <AttachmentList
                title="已上传文件"
                attachments={formData.attachments}
                onDelete={(file) => setFormData(prev => ({ 
                  ...prev, 
                  attachments: prev.attachments.filter(f => f.name !== file.name) 
                }))}
              />
            </div>
          </section>
        </div>
      </div>

      {!isFullscreen && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-end gap-4 w-full">
            <SecondaryButton label="保存草稿" onClick={() => handleSubmit('draft')} disabled={isSubmitting} />
            <PrimaryButton label={isSubmitting ? "提交中..." : "提交"} onClick={() => handleSubmit('submit')} disabled={isSubmitting} />
          </div>
        </div>
      )}
    </div>
  );
}
