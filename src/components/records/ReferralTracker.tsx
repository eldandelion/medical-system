import React from 'react';
import { 
  Check, 
  X, 
  Info,
  GraduationCap,
  Users,
  Building2,
  Stethoscope
} from 'lucide-react';

const referralSteps = [
  {
    id: 1,
    title: "发起转诊",
    subtitle: "教师：王老师。备注：表现出严重的学业倦怠。",
    time: "10月12日",
    status: "completed",
    icon: GraduationCap,
    iconColor: "text-[var(--md-sys-color-primary)]",
    iconBg: "bg-[var(--md-sys-color-primary-container)]"
  },
  {
    id: 2,
    title: "学校咨询师审核",
    subtitle: "已批准进行临床评估。优先级：高。",
    time: "10月14日",
    status: "completed",
    icon: Users,
    iconColor: "text-[var(--md-sys-color-secondary)]",
    iconBg: "bg-[var(--md-sys-color-secondary-container)]"
  },
  {
    id: 3,
    title: "医院分诊",
    subtitle: "等待签署家长知情同意书，随后分配医生。",
    time: "10月15日",
    status: "issue",
    icon: Building2,
    iconColor: "text-[var(--md-sys-color-error)]",
    iconBg: "bg-[var(--md-sys-color-error-container)]"
  },
  {
    id: 4,
    title: "精神科评估",
    subtitle: "医生将对学生进行临床评估并提交最终报告。",
    time: "待处理",
    status: "pending",
    icon: Stethoscope,
    iconColor: "text-[var(--md-sys-color-tertiary)]",
    iconBg: "bg-[var(--md-sys-color-tertiary-container)]"
  }
];

const getCardStyles = (status: string) => {
  switch (status) {
    case 'completed':
      return {
        bg: "bg-[var(--md-sys-color-surface-container)]",
        titleText: "text-[var(--md-sys-color-on-surface-variant)] line-through decoration-[var(--md-sys-color-on-surface-variant)]/40",
        subText: "text-[var(--md-sys-color-on-surface-variant)] opacity-70",
        timeText: "text-[var(--md-sys-color-on-surface-variant)] opacity-70"
      };
    case 'issue':
      return {
        bg: "bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)]/20",
        titleText: "text-[var(--md-sys-color-on-error-container)] line-through decoration-[var(--md-sys-color-on-error-container)]/40",
        subText: "text-[var(--md-sys-color-on-error-container)] opacity-80",
        timeText: "text-[var(--md-sys-color-on-error-container)] opacity-80"
      };
    case 'pending':
    default:
      return {
        bg: "bg-[var(--md-sys-color-surface)] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[var(--md-sys-color-outline-variant)]",
        titleText: "text-[var(--md-sys-color-on-surface)]",
        subText: "text-[var(--md-sys-color-on-surface-variant)]",
        timeText: "text-[var(--md-sys-color-on-surface)] font-medium"
      };
  }
};

export function ReferralTracker() {
  return (
    <div className="flex justify-center font-sans">
      <div className="w-full relative">
        <div className="flex flex-col gap-4 relative">
          {referralSteps.map((step, index) => {
            const isLast = index === referralSteps.length - 1;
            const styles = getCardStyles(step.status);
            const IconComponent = step.icon;
            
            // Determine the line color connecting to the NEXT node
            const nextStep = referralSteps[index + 1];
            let lineColor = "bg-[var(--md-sys-color-outline-variant)]"; // Default
            
            // Note: Use style prop for gradients with CSS variables if arbitrary values have parsing issues
            let customLineStyle = {};
            if (step.status === 'completed' && nextStep?.status === 'completed') {
              lineColor = "bg-[var(--md-sys-color-primary)]";
            } else if (step.status === 'completed' && nextStep?.status === 'issue') {
              lineColor = ""; // Will use inline style
              customLineStyle = { background: "linear-gradient(to bottom, var(--md-sys-color-primary), var(--md-sys-color-error))" };
            }

            return (
              <div key={step.id} className="flex items-stretch gap-6 relative group z-10">
                
                {/* Left Side: The Card */}
                <div className={`flex-1 rounded-[32px] p-5 pl-6 pr-5 flex items-start gap-4 transition-all duration-300 ${styles.bg}`}>
                  
                  {/* Card Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.iconBg}`}>
                    <IconComponent size={20} className={step.iconColor} />
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 pt-1.5">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-[17px] font-medium tracking-tight ${styles.titleText}`}>
                        {step.title}
                      </h3>
                      <span className={`text-[15px] whitespace-nowrap ${styles.timeText}`}>
                        {step.time}
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-1.5">
                      <Info size={14} className={`mt-0.5 shrink-0 ${styles.subText}`} />
                      <p className={`text-[13px] leading-relaxed ${styles.subText}`}>
                        {step.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Timeline Track & Indicator */}
                <div className="w-8 flex flex-col items-center pt-8 relative shrink-0">
                  
                  {/* Status Circle */}
                  <div className="relative z-10 flex items-center justify-center bg-[var(--md-sys-color-surface)]">
                    {step.status === 'completed' && (
                      <div className="w-[26px] h-[26px] rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] flex items-center justify-center shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                    {step.status === 'issue' && (
                      <div className="w-[26px] h-[26px] rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] flex items-center justify-center shadow-sm">
                        <X size={14} strokeWidth={3} />
                      </div>
                    )}
                    {step.status === 'pending' && (
                      <div className="w-[26px] h-[26px] rounded-full border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-center">
                        {/* Empty inner circle matching the UI */}
                      </div>
                    )}
                  </div>

                  {/* Connecting Line (drawn below the circle to the next item) */}
                  {!isLast && (
                    <div 
                      className={`absolute top-[44px] bottom-[-32px] left-1/2 -translate-x-1/2 w-[1.5px] z-0 ${lineColor}`} 
                      style={customLineStyle}
                    />
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
