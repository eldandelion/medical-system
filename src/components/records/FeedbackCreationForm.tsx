import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { SecondaryButton, PrimaryButton } from '../common/Buttons';
import { useCreationOverlay } from '../../contexts/CreationContext';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { useAuth } from '../../contexts/AuthContext';
import { GenericDialog } from '../common/GenericDialog';
import { AttachmentList } from '../common/AttachmentList';
import { Referral } from '../../types';

export function FeedbackCreationForm({ onClose }: { onClose: () => void }) {
  const { viewState, setHeaderActions, setOnCloseInterceptor } = useCreationOverlay();
  const { showSnackbar } = useSnackbar();
  const { session } = useAuth();
  const isFullscreen = viewState === 'FULLSCREEN';

  const [isCloseWarningOpen, setIsCloseWarningOpen] = React.useState(false);

  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    referralId: '',
    feedback: '',
    attachments: [] as { name: string; size: string }[]
  });

  const [errors, setErrors] = React.useState({
    referralId: false,
    feedback: false
  });

  const handleSubmit = async () => {
    const newErrors = {
      referralId: !formData.referralId,
      feedback: !formData.feedback.trim()
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(isError => isError)) {
      showSnackbar({ message: '请填写所有必填字段', duration: 3000 });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}/api/feedback`.replace('//api', '/api'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.token || ''}`
        },
        body: JSON.stringify(formData)
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
        message: '诊疗反馈已成功提交',
        duration: 4000
      });
    } catch (error) {
      setIsSubmitting(false);
      showSnackbar({ message: '提交失败，请稍后重试', duration: 3000 });
    }
  };

  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}/api/referrals`.replace('//api', '/api'), { 
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${session?.token || ''}`
      }
    })
      .then(res => res.json())
      .then((data: Referral[]) => {
        // Only show referrals that are active and need feedback (e.g. pending/approved)
        const activeReferrals = data.filter(r => r.status === 'Pending' || r.status === 'Approved');
        setReferrals(activeReferrals);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch referrals:', err);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [session?.token]);

  React.useEffect(() => {
    setOnCloseInterceptor(() => () => {
      const isDirty = formData.referralId !== '' || formData.feedback.trim() !== '' || formData.attachments.length > 0;
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
          <SecondaryButton label="取消" onClick={() => onClose()} disabled={isSubmitting} />
          <PrimaryButton label={isSubmitting ? "提交中" : "提交反馈"} onClick={handleSubmit} disabled={isSubmitting} />
        </div>
      );
    } else {
      setHeaderActions(null);
    }
    return () => {
      setHeaderActions(null);
    };
  }, [isFullscreen, setHeaderActions, isSubmitting, formData, onClose, handleSubmit]);

  const selectedReferral = referrals.find(r => r.id === formData.referralId);

  const progressSlot = document.getElementById('creation-progress-slot');

  return (
    <>
      <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] relative">
        {isSubmitting && progressSlot && ReactDOM.createPortal(
          /* @ts-ignore */
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
                <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
                选择转诊学生
              </h3>
              <div className="relative">
                
                <md-outlined-select
                  label={loading ? '正在加载转诊列表...' : '选择转诊记录'}
                  className="w-full relative"
                  value={formData.referralId}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    setFormData(prev => ({ ...prev, referralId: val }));
                    if (errors.referralId) setErrors(prev => ({ ...prev, referralId: false }));
                  }}
                  disabled={loading || referrals.length === 0 || isSubmitting}
                  error={errors.referralId || undefined}
                  error-text="此项为必填项"
                >
                  {referrals.map((referral) => (
                    
                    <md-select-option key={referral.id} value={referral.id}>
                      <div slot="headline">{referral.studentName}</div>
                      <div slot="supporting-text" className="text-[12px] opacity-70">
                        {referral.title} • {referral.date}
                      </div>
                    
                    </md-select-option>
                  ))}
                
                </md-outlined-select>
              </div>

              {selectedReferral && (
                <div className="border border-[var(--md-sys-color-outline-variant)] rounded-[12px] p-6 bg-[var(--md-sys-color-surface)] mt-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-[14px] font-medium text-[var(--md-sys-color-on-surface-variant)]">转诊原因</span>
                    <p className="text-[15px] text-[var(--md-sys-color-on-surface)] leading-relaxed">
                      {selectedReferral.description}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-6">
              <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                反馈内容
              </h3>
              
              <md-outlined-text-field
                type="textarea"
                rows={6}
                label="诊疗反馈意见"
                className="w-full"
                supporting-text={`* 请详细填写诊断情况、治疗建议及后续随访计划。`}
                value={formData.feedback}
                onInput={(e: any) => {
                  const val = e.target.value;
                  setFormData(prev => ({ ...prev, feedback: val }));
                  if (errors.feedback) setErrors(prev => ({ ...prev, feedback: false }));
                }}
                disabled={isSubmitting}
                error={errors.feedback || undefined}
                error-text="此项为必填项"
              >
              
              </md-outlined-text-field>
            </section>

            <section className="flex flex-col gap-6">
              <h3 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">attachment</span>
                附件上传
              </h3>

              <div className="flex flex-col gap-4">
                <div>
                  
                  <md-filled-tonal-button className="[&::part(button)]:px-0" disabled={isSubmitting}>
                    
                    <md-icon slot="icon" className="ml-4">upload</md-icon>
                    <span className="mr-4">上传病历或处方附件</span>
                  
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
              <SecondaryButton label="取消" onClick={() => onClose()} disabled={isSubmitting} />
              <PrimaryButton label={isSubmitting ? "提交中..." : "提交反馈"} onClick={handleSubmit} disabled={isSubmitting} />
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
            <SecondaryButton label="继续编辑" onClick={() => setIsCloseWarningOpen(false)} />
            <PrimaryButton label="确认关闭" onClick={() => {
              setIsCloseWarningOpen(false);
              onClose();
            }} />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)]">您有未保存的反馈数据，关闭后将丢失。是否确认关闭？</p>
      </GenericDialog>
    </>
  );
}
