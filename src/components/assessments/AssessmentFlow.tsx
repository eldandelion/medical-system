import * as React from 'react';
import { FullScreenView } from '../common/FullScreenView';
import { PrimaryButton, SecondaryButton, TertiaryButton } from '../common/Buttons';
import { motion, AnimatePresence } from 'motion/react';

interface AssessmentSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questions: string[];
}

const ASSESSMENTS: AssessmentSection[] = [
  {
    id: 'phq9',
    title: '情绪状况评估',
    subtitle: 'PHQ-9',
    description: '在过去的两周里，您有多少时间受到以下问题的困扰？',
    questions: [
      '做事时提不起劲或没有兴趣',
      '感到心情低落，沮丧或绝望',
      '入睡困难、睡不安稳或睡得太多',
      '感觉疲倦或没有活力',
      '食欲不振或吃太多',
      '觉得自己很糟或觉得自己很失败，或让自己、家人失望',
      '对事物专注有困难，例如看报纸或看电视时',
      '动作或说话速度缓慢到别人已经察觉，或正好相反，烦躁或坐立不安、动来动去的情况比平常更多',
      '有不如死掉或用某种方式伤害自己的念头'
    ]
  },
  {
    id: 'gad7',
    title: '焦虑状况评估',
    subtitle: 'GAD-7',
    description: '在过去的两周里，您有多少时间受到以下问题的困扰？',
    questions: [
      '感觉紧张，焦虑或急切',
      '不能够停止或控制担忧',
      '对各种各样的事情担忧过多',
      '很难放松下来',
      '由于不安而无法静坐',
      '变得容易烦恼或急躁',
      '感到似乎将有可怕的事情发生而害怕'
    ]
  }
];

const OPTIONS = [
  { value: 0, label: '完全不会' },
  { value: 1, label: '好几天' },
  { value: 2, label: '一半以上时间' },
  { value: 3, label: '几乎每天' }
];

interface AssessmentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentTitle: string;
}

type AppState = 'intro' | 'assessment' | 'outro';

export function AssessmentFlow({ isOpen, onClose, assessmentTitle }: AssessmentFlowProps) {
  const [appState, setAppState] = React.useState<AppState>('intro');
  const [currentSectionIdx, setCurrentSectionIdx] = React.useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});

  const currentSection = ASSESSMENTS[currentSectionIdx];
  const currentQuestion = currentSection?.questions[currentQuestionIdx];
  const questionKey = `${currentSection?.id}_${currentQuestionIdx}`;
  
  const totalQuestions = ASSESSMENTS.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleSelect = (val: number) => {
    setAnswers(prev => ({ ...prev, [questionKey]: val }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < currentSection.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else if (currentSectionIdx < ASSESSMENTS.length - 1) {
      setCurrentSectionIdx(prev => prev + 1);
      setCurrentQuestionIdx(0);
    } else {
      setAppState('outro');
    }
  };

  const handleBack = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    } else if (currentSectionIdx > 0) {
      setCurrentSectionIdx(prev => prev - 1);
      setCurrentQuestionIdx(ASSESSMENTS[currentSectionIdx - 1].questions.length - 1);
    } else {
      setAppState('intro');
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
      {ASSESSMENTS.map((section, sIdx) => (
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
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors flex items-center justify-between group ${
                    isActive 
                      ? 'bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium' 
                      : 'bg-transparent hover:bg-[var(--md-sys-color-surface-container-high)]'
                  }`}
                >
                  <span className={`truncate pr-4 flex-1 text-[13px] transition-opacity duration-200 ${
                    isActive || isAnswered ? 'text-[var(--md-sys-color-on-surface)] opacity-100' : 'text-[var(--md-sys-color-on-surface-variant)] opacity-60 group-hover:opacity-100'
                  }`}>
                    {qIdx + 1}. {q}
                  </span>
                  <div className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                    isActive ? 'bg-[var(--md-sys-color-primary)] ring-4 ring-[var(--md-sys-color-primary)] ring-opacity-20' :
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
        {ASSESSMENTS.slice(0, currentSectionIdx).reduce((acc, section) => acc + section.questions.length, 0) + currentQuestionIdx + 1} / {totalQuestions}
      </span>
    </div>
  );

  return (
    <FullScreenView
      isOpen={isOpen}
      onClose={onClose}
      title={appState === 'assessment' ? currentSection.title : assessmentTitle}
      subtitle={appState === 'assessment' ? currentSection.description : undefined}
      sidebar={appState === 'assessment' ? sidebar : undefined}
      actions={appState === 'assessment' ? questionActions : undefined}
      progress={appState === 'assessment' ? (answeredCount / totalQuestions) : undefined}
      activeTab={currentSection?.id}
      onTabChange={(id) => {
        const idx = ASSESSMENTS.findIndex(s => s.id === id);
        if (idx !== -1) {
          setCurrentSectionIdx(idx);
          setCurrentQuestionIdx(0);
        }
      }}
    >
      <div className="flex flex-col h-full relative">
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {appState === 'intro' && (
              <motion.div 
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl text-center px-4"
              >
                <div className="p-8 sm:p-12">
                  <div className="w-20 h-20 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full flex items-center justify-center mx-auto mb-8">
                    <md-icon style={{ fontSize: '40px' }}>shield_with_heart</md-icon>
                  </div>
                  <h2 className="text-3xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">{assessmentTitle}</h2>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-lg mb-10 leading-relaxed text-left sm:text-center">
                    本问卷包括两部分（PHQ-9 与 GAD-7），旨在了解您近期的情绪与心理健康状况。
                    <br/><br/>
                    所有问题的答案没有对错之分，请按照您的实际感受放心填写。您的信息将被严格保密。
                  </p>
                  <PrimaryButton 
                    onClick={startAssessment}
                    label="开始评估"
                    icon="arrow_forward"
                    trailingIcon
                    className="h-14 px-10 text-lg"
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
                    {currentQuestion}
                  </h3>
                  
                  <div className="space-y-3 mb-12">
                    {OPTIONS.map((option) => {
                      const isSelected = answers[questionKey] === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          className={`w-full flex items-center justify-between p-5 rounded-lg border text-left transition-all duration-200 group ${
                            isSelected 
                              ? 'bg-[var(--md-sys-color-secondary-container)] border-[var(--md-sys-color-secondary)] border-opacity-50 text-[var(--md-sys-color-on-secondary-container)] shadow-sm' 
                              : 'bg-transparent border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)] hover:bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]'
                          }`}
                        >
                          <span className={`text-lg font-medium ${isSelected ? 'text-[var(--md-sys-color-on-secondary-container)]' : ''}`}>{option.label}</span>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected ? 'border-[var(--md-sys-color-secondary)]' : 'border-[var(--md-sys-color-outline)] group-hover:border-[var(--md-sys-color-on-surface-variant)]'
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
                    />
                    
                    <PrimaryButton
                      onClick={handleNext}
                      label={currentSectionIdx === ASSESSMENTS.length - 1 && currentQuestionIdx === currentSection.questions.length - 1 ? '完成' : '下一题'}
                      icon={currentSectionIdx === ASSESSMENTS.length - 1 && currentQuestionIdx === currentSection.questions.length - 1 ? 'check' : 'chevron_right'}
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
                <div className="bg-[var(--md-sys-color-surface-container-low)] p-8 sm:p-12 rounded-[32px] border border-[var(--md-sys-color-outline-variant)] border-opacity-30 shadow-sm">
                  <div className="w-24 h-24 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full flex items-center justify-center mx-auto mb-8">
                    <md-icon style={{ fontSize: '48px' }}>celebration</md-icon>
                  </div>
                  <h2 className="text-3xl font-semibold mb-6 text-[var(--md-sys-color-on-surface)]">感谢您的参与</h2>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-lg mb-10 leading-relaxed">
                    您的评估已完成。这些信息将帮助我们更好地了解您的健康状况。
                  </p>
                  
                  <div className="bg-[var(--md-sys-color-surface-container-high)] p-5 rounded-2xl inline-flex items-center gap-3 text-sm text-[var(--md-sys-color-on-surface-variant)] mb-10">
                    <md-icon style={{ fontSize: '20px' }}>task_alt</md-icon>
                    已完成 {totalQuestions} 项问题的回答
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <PrimaryButton 
                      onClick={onClose}
                      label="返回首页"
                      icon="home"
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
                      className="h-14 px-8 w-full sm:w-auto"
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
  );
}
