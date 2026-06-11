import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SecondaryButton, PrimaryButton } from '../common/Buttons';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';
import { GenericDialog } from '../common/GenericDialog';
import { Student } from '../../types';
import { AttachmentList } from '../common/AttachmentList';

export function ReferralCreationForm({ onClose }: { onClose: () => void }) {
  const { viewState, setHeaderActions, setOnCloseInterceptor } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();
  const isFullscreen = viewState === 'FULLSCREEN';

  const [isCloseWarningOpen, setIsCloseWarningOpen] = React.useState(false);

  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    studentId: '',
    title: '',
    reason: '',
    riskLevel: 'Low',
    clinicalStatus: ['Current Medication', 'Prior Therapy'],
    severeRiskFactors: [] as string[],
    attachments: [
      { name: 'Patient_Intake_Scan_v2.pdf', size: '2.4 MB' },
      { name: 'Hospital_Release_Form.png', size: '1.1 MB' },
    ]
  });

  const [errors, setErrors] = React.useState({
    studentId: false,
    title: false,
    reason: false,
    riskLevel: false
  });

  const handleSubmit = async (actionType: 'draft' | 'submit') => {
    if (actionType === 'submit') {
      const newErrors = {
        studentId: !formData.studentId,
        title: !formData.title.trim(),
        reason: !formData.reason.trim(),
        riskLevel: !formData.riskLevel
      };

      setErrors(newErrors);

      if (Object.values(newErrors).some(isError => isError)) {
        showSnackbar({ message: '请填写所有必填字段', duration: 3000 });
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify({ ...formData, actionType })
      });

      setIsSubmitting(false);

      if (res.status === 403 || res.status === 401) {
        showSnackbar({ message: '权限不足', duration: 3000 });
        return;
      }

      if (!res.ok) {
        throw new Error('API Error');
      }

      onClose();
      showSnackbar({
        message: actionType === 'draft' ? '草稿已保存' : '转诊申请已成功提交',
        duration: 4000
      });
    } catch (error) {
      setIsSubmitting(false);
      showSnackbar({ message: '提交失败，请稍后重试', duration: 3000 });
    }
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
    setOnCloseInterceptor(() => () => {
      const isDirty = formData.studentId !== '' || formData.title.trim() !== '' || formData.reason.trim() !== '';
      if (isDirty) {
        setIsCloseWarningOpen(true);
        return false; // intercept close
      }
      return true; // allow close
    });
    return () => setOnCloseInterceptor(null);
  }, [formData, setOnCloseInterceptor]);

  React.useEffect(() => {
    if (isFullscreen) {
      setHeaderActions(
        <div className="flex items-center gap-3 mr-4">
          <SecondaryButton label="保存草稿" onClick={() => handleSubmit('draft')} disabled={isSubmitting} />
          <PrimaryButton label={isSubmitting ? "提交中" : "提交"} onClick={() => handleSubmit('submit')} disabled={isSubmitting} />
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

  const progressSlot = document.getElementById('creation-progress-slot');

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] relative">
        {isSubmitting && progressSlot && ReactDOM.createPortal(
        <md-linear-progress
          indeterminate
          className="w-full block"
        ></md-linear-progress>,
        progressSlot
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
                onChange={(e: any) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, studentId: val }));
                  if (errors.studentId) setErrors(prev => ({ ...prev, studentId: false }));
                }}
                disabled={loading || students.length === 0 || isSubmitting}
                error={errors.studentId || undefined}
                error-text="此项为必填项"
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
              onInput={(e: any) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, title: val }));
                if (errors.title) setErrors(prev => ({ ...prev, title: false }));
              }}
              disabled={isSubmitting}
              error={errors.title || undefined}
              error-text="此项为必填项"
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
              onInput={(e: any) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, reason: val }));
                if (errors.reason) setErrors(prev => ({ ...prev, reason: false }));
              }}
              disabled={isSubmitting}
              error={errors.reason || undefined}
              error-text="此项为必填项"
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
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, riskLevel: 'Low' }));
                    if (errors.riskLevel) setErrors(prev => ({ ...prev, riskLevel: false }));
                  }}
                  className={`px-6 py-2.5 text-[14px] font-medium transition-colors border-r border-[var(--md-sys-color-outline)] ${formData.riskLevel === 'Low' ? 'bg-[#f0fdf4] text-[#166534]' : 'hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]'}`}
                >低风险</button>
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, riskLevel: 'Medium' }));
                    if (errors.riskLevel) setErrors(prev => ({ ...prev, riskLevel: false }));
                  }}
                  className={`px-6 py-2.5 text-[14px] font-medium transition-colors border-r border-[var(--md-sys-color-outline)] ${formData.riskLevel === 'Medium' ? 'bg-[#fef9c3] text-[#854d0e]' : 'hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]'}`}
                >中风险</button>
                <button
                  disabled={isSubmitting}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, riskLevel: 'High' }));
                    if (errors.riskLevel) setErrors(prev => ({ ...prev, riskLevel: false }));
                  }}
                  className={`px-6 py-2.5 text-[14px] font-medium transition-colors ${formData.riskLevel === 'High' ? 'bg-[#fee2e2] text-[#991b1b]' : 'hover:bg-[var(--md-sys-color-surface-variant)] text-[var(--md-sys-color-on-surface)]'}`}
                >高风险</button>
              </div>
              {errors.riskLevel && <span className="text-[12px] text-[var(--md-sys-color-error)] mt-1">此项为必填项</span>}
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
    
    <GenericDialog
      open={isCloseWarningOpen}
      onClose={() => setIsCloseWarningOpen(false)}
      title="确认关闭？"
      actions={
        <>
          <SecondaryButton label="取消" onClick={() => setIsCloseWarningOpen(false)} />
          <PrimaryButton label="确认关闭" onClick={() => {
            setIsCloseWarningOpen(false);
            onClose();
          }} />
        </>
      }
    >
      <p className="text-[var(--md-sys-color-on-surface-variant)]">您有未保存的数据，关闭后将丢失。是否确认关闭？</p>
    </GenericDialog>
    </>
  );
}
