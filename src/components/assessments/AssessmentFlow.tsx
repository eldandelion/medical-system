import * as React from 'react';
import { FullScreenView } from '../common/FullScreenView';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { GenericDialog } from '../common/GenericDialog';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../layout/Header';
import { useSnackbar } from '../../contexts/SnackbarContext';
import { AssessmentSection, Question } from './AssessmentData';

const DEFAULT_OPTIONS = [
  { value: 0, label: '完全不会' },
  { value: 1, label: '好几天' },
  { value: 2, label: '一半以上时间' },
  { value: 3, label: '几乎每天' }
];

interface AssessmentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentId?: string;
  assessmentTitle: string;
  assessmentSubtitle?: string;
  sections: AssessmentSection[];
}

type AppState = 'intro' | 'assessment' | 'outro';

export function AssessmentFlow({ isOpen, onClose, assessmentId, assessmentTitle, assessmentSubtitle, sections }: AssessmentFlowProps) {
  const { showSnackbar } = useSnackbar();
  const [appState, setAppState] = React.useState<AppState>('intro');
  const [currentSectionIdx, setCurrentSectionIdx] = React.useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [loadedSections, setLoadedSections] = React.useState<AssessmentSection[]>(sections);
  const [loading, setLoading] = React.useState(false);

  // Fetch sections from API dynamically if assessmentId is provided
  React.useEffect(() => {
    if (isOpen) {
      setAppState('intro');
      setCurrentSectionIdx(0);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setLoadedSections(sections);

      if (assessmentId) {
        setLoading(true);
        fetch(`${import.meta.env.BASE_URL}/api/assessments/${assessmentId}`.replace('//api', '/api'))
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch assessment');
            return res.json();
          })
          .then((data) => {
            if (data && data.sections) {
              setLoadedSections(data.sections);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error('Failed to fetch assessment sections:', err);
            setLoading(false);
          });
      }
    }
  }, [isOpen, assessmentId, sections]);

  const activeSections = loadedSections || [];

  const currentSection = activeSections[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];
  const questionKey = `${currentSection?.id}_${currentQuestionIdx}`;

  const questionText = typeof currentQuestion === 'string' ? currentQuestion : currentQuestion?.text;
  const questionOptions = typeof currentQuestion === 'string' ? DEFAULT_OPTIONS : currentQuestion?.options || DEFAULT_OPTIONS;

  const totalQuestions = activeSections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleSelect = (val: number) => {
    setAnswers(prev => ({ ...prev, [questionKey]: val }));
  };

  const handleNext = () => {
    if (!currentSection) return;
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSectionIdx < activeSections.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    } else {
      setAppState('outro');
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else if (currentSectionIdx > 0 && activeSections[currentSectionIdx - 1]) {
      setCurrentSectionIdx(prev => prev - 1);
      setCurrentQuestionIdx(activeSections[currentSectionIdx - 1].questions.length - 1);
    }
  };

  const startAssessment = () => {
    setAppState('assessment');
    setCurrentSectionIdx(0);
    setCurrentQuestionIdx(0);
  };

  const isCurrentQuestionAnswered = answers[questionKey] !== undefined;

  // Detailed sidebar content showing all sections and questions
  const sidebar = (
    <div className="flex flex-col py-6 gap-6">
      {sections.map((section, sIdx) => (
        <div key={section.id} className="flex flex-col gap-2 px-4">
          <h4 className="text-[11px] font-bold text-[var(--md-sys-color-primary)] uppercase tracking-[0.1em] px-4 mb-1">
            {section.subtitle}
          </h4>
          <div className="flex flex-col gap-1">
            {section.questions.map((q, qIdx) => {
              const qKey = `${section.id}_${qIdx}`;
              const isAnswered = answers[qKey] !== undefined;
              const isActive = currentSectionIdx === sIdx && currentQuestionIdx === qIdx;

              return (
                <button
                  key={qIdx}
                  onClick={() => {
                    setCurrentSectionIdx(sIdx);
                    setCurrentQuestionIdx(qIdx);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group ${isActive
                    ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium'
                    : 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }`}
                >
                  <span className={`truncate pr-4 flex-1 text-[13px] transition-opacity duration-200 ${isActive || isAnswered ? 'text-[var(--md-sys-color-on-surface)] opacity-100' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-60 group-hover:opacity-100'
                    }`}>
                    {qIdx + 1}. {typeof q === 'string' ? q : q.text}
                  </span>
                  <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${isActive ? 'bg-[var(--md-sys-color-primary)] ring-4 ring-[var(--md-sys-color-primary)] ring-opacity-20' :
                    isAnswered ? 'bg-[var(--md-sys-color-primary)]' :
                      'border border-[var(--md-sys-color-outline)]'
                    }`} />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Submit bypass button if completed */}
      {answeredCount === totalQuestions && (
        <div className="px-6 mt-4">
          <PrimaryButton
            onClick={() => setAppState('outro')}
            label="完成并提交"
            icon="done_all"
            className="w-full h-12"
            noCollapse
          />
        </div>
      )}
    </div>
  );

  // Pill-shaped indicator for the question counter
  const questionActions = (
    <div className="bg-transparent text-[var(--md-sys-color-primary)] px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border border-[var(--md-sys-color-outline-variant)] animate-in fade-in zoom-in duration-300">
      <md-icon style={{ fontSize: '18px' }}>list_alt</md-icon>
      <span>
        {sections.slice(0, currentSectionIdx).reduce((acc, section) => acc + section.questions.length, 0) + currentQuestionIdx + 1} / {totalQuestions}
      </span>
    </div>
  );

  const [isUIVisible, setIsUIVisible] = React.useState(false);
  const [showExitConfirm, setShowExitConfirm] = React.useState(false);

  // Reset UI visibility when returning to intro
  React.useEffect(() => {
    if (appState === 'intro') {
      setIsUIVisible(false);
    }
  }, [appState]);

  const handleCloseAttempt = () => {
    if (appState === 'assessment') {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const sectionsSummary = `本评估包括 ${sections.length} 个部分（${sections.map(s => s.subtitle || s.title).join(' 与 ')}），旨在全面了解您近期的健康状况。`;

  return (
    <>
      <FullScreenView
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title={appState === 'assessment' && isUIVisible ? (currentSection?.title || '') : assessmentTitle}
        subtitle={appState === 'assessment' && isUIVisible ? currentSection?.description : undefined}
        sidebar={appState === 'assessment' && isUIVisible ? sidebar : undefined}
        actions={appState === 'assessment' && isUIVisible ? questionActions : undefined}
        progress={appState === 'assessment' && isUIVisible ? (answeredCount / totalQuestions) : undefined}
        activeTab={currentSection?.id}
        onTabChange={(id) => {
          const idx = sections.findIndex(s => s.id === id);
          if (idx !== -1) {
            setCurrentSectionIdx(idx);
            setCurrentQuestionIdx(0);
          }
        }}
      >
        <div className="flex flex-col h-full relative">
          <div className="flex-1 flex flex-col items-center justify-center py-8">
            <AnimatePresence
              mode="wait"
              onExitComplete={() => {
                if (appState === 'assessment') {
                  setIsUIVisible(true);
                }
              }}
            >
              {appState === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-3xl text-center px-4"
                >
                  <div className="py-8">
                    <div className="mb-10">
                      <h2 className="text-3xl font-semibold text-[var(--md-sys-color-on-surface)] leading-tight">{assessmentTitle}</h2>
                      <p className="text-[var(--md-sys-color-on-surface-variant)] mt-3 text-lg opacity-80">
                        {assessmentSubtitle || '健康状况评估'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 mb-12 text-left">
                      {[
                        {
                          icon: 'assignment',
                          title: '评估内容',
                          description: sectionsSummary
                        },
                        {
                          icon: 'volunteer_activism',
                          title: '客观作答',
                          description: '所有问题的答案没有对错之分，您的第一反应往往最准确，请按照您的实际感受放心填写'
                        },
                        {
                          icon: 'lock',
                          title: '隐私保密',
                          description: '您的个人信息及答题数据将被严格保密，仅用于健康状况分析，请您安心作答'
                        }
                      ].map((info, idx) => (
                        <div key={idx} className="bg-[var(--md-sys-color-surface-container-low)] p-6 rounded-[24px] flex items-start gap-4">
                          <div className="text-[var(--md-sys-color-primary)] w-7 h-7 flex items-center justify-center shrink-0">
                            <md-icon style={{ fontSize: '26px' }}>{info.icon}</md-icon>
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] leading-7 tracking-[0.01em]">{info.title}</h3>
                            <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed text-[15px]">{info.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <PrimaryButton
                      onClick={startAssessment}
                      label="开始评估"
                      className="h-16 px-12 text-xl rounded-full"
                      noCollapse
                    />
                  </div>
                </motion.div>
              )}

              {appState === 'assessment' && (
                <motion.div
                  key={`${questionKey}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl px-4 flex flex-col h-full"
                >
                  <div className="flex flex-col flex-1">
                    <h3 className="text-2xl sm:text-3xl font-medium text-[var(--md-sys-color-on-surface)] mb-10 leading-snug">
                      {questionText}
                    </h3>

                    <div className="space-y-3 mb-12">
                      {questionOptions.map((option) => {
                        const isSelected = answers[questionKey] === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`w-full flex items-center justify-between p-5 rounded-lg border text-left transition-all duration-200 group ${isSelected
                              ? 'bg-[var(--md-sys-color-secondary-container)] border-[var(--md-sys-color-secondary)] border-opacity-50 text-[var(--md-sys-color-on-secondary-container)] shadow-sm'
                              : 'bg-transparent border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                              }`}
                          >
                            <span className={`text-lg font-medium ${isSelected ? 'text-[var(--md-sys-color-on-secondary-container)]' : ''}`}>{option.label}</span>

                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[var(--md-sys-color-secondary)]' : 'border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-on-surface-variant)]'
                              }`}>
                              {isSelected && <div className="w-3 h-3 bg-[var(--md-sys-color-secondary)] rounded-full animate-in zoom-in duration-200" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-auto">
                      <TertiaryButton
                        onClick={handleBack}
                        label="上一题"
                        icon="chevron_left"
                        className="h-12"
                        noCollapse
                        style={currentSectionIdx === 0 && currentQuestionIdx === 0 ? { opacity: 0.3, pointerEvents: 'none' } : {}}
                      />

                      <PrimaryButton
                        onClick={handleNext}
                        label={currentSectionIdx === activeSections.length - 1 && currentQuestionIdx === currentSection.questions.length - 1 ? '完成' : '下一题'}
                        icon={currentSectionIdx === activeSections.length - 1 && currentQuestionIdx === currentSection.questions.length - 1 ? 'check' : 'chevron_right'}
                        trailingIcon={true}
                        className="h-12 px-8"
                        noCollapse
                        style={!isCurrentQuestionAnswered ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {appState === 'outro' && (
                <motion.div
                  key="outro"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-2xl text-center px-4"
                >
                  <div className="bg-transparent p-8 sm:p-12 rounded-[32px]">
                    <div className="w-24 h-24 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full flex items-center justify-center mx-auto mb-8">
                      <md-icon style={{ '--md-icon-size': '36px' } as React.CSSProperties}>celebration</md-icon>
                    </div>
                    <h2 className="text-3xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">感谢您的参与</h2>
                    <div className="bg-[var(--md-sys-color-surface-container-low)] p-6 rounded-[24px] flex items-start gap-4 text-left max-w-xl mx-auto mb-10">
                      <div className="text-[var(--md-sys-color-primary)] w-7 h-7 flex items-center justify-center shrink-0">
                        <md-icon style={{ '--md-icon-size': '26px' } as React.CSSProperties}>task_alt</md-icon>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-medium text-[var(--md-sys-color-on-surface)] leading-7 tracking-[0.01em]">评估已完成</h3>
                        <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed text-[15px]">
                          您的评估已完成。这些信息将帮助我们更好地了解您的健康状况。您已完成 {totalQuestions} 项问题的回答。
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <PrimaryButton
                        onClick={onClose}
                        label="返回首页"
                        icon="home"
                        iconSize="22px"
                        className="h-14 px-10 text-lg w-full sm:w-auto"
                        noCollapse
                      />
                      <TertiaryButton
                        onClick={() => {
                          setAnswers({});
                          setAppState('intro');
                        }}
                        label="重新开始"
                        icon="refresh"
                        iconSize="22px"
                        className="h-14 px-8 text-lg w-full sm:w-auto"
                        noCollapse
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FullScreenView>

      <GenericDialog
        open={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        title="暂停评估？"
        actions={
          <>
            <TertiaryButton
              label="继续评估"
              onClick={() => setShowExitConfirm(false)}
            />
            <PrimaryButton
              label="保存并退出"
              onClick={() => {
                setShowExitConfirm(false);
                onClose();
                showSnackbar({
                  message: '评估进度已保存，您可以稍后继续',
                  actionLabel: '了解',
                  duration: 4000
                });
              }}
            />
          </>
        }
      >
        <p className="text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          您的答题进度将被自动保存，您可以随时返回继续完成评估
        </p>
      </GenericDialog>
    </>
  );
}
