export interface QuestionOption {
  value: number;
  label: string;
}

export interface Question {
  text: string;
  options?: QuestionOption[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  questions: (string | Question)[];
}

export const APQ_OPTIONS: QuestionOption[] = [
  { value: 1, label: '从不发生' },
  { value: 2, label: '几乎没有' },
  { value: 3, label: '有时发生' },
  { value: 4, label: '经常发生' },
  { value: 5, label: '总是发生' }
];

export const MENTAL_HEALTH_ASSESSMENT: AssessmentSection[] = [
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
  },
  {
    id: 'apq9_father',
    title: '教养行为评估 (父亲篇)',
    subtitle: 'APQ-9 父亲',
    description: '指导语：此问卷是关于您的父亲对您的教养方式，请实事求是地回答。',
    questions: [
      { text: '当我很好地完成一项任务时，父亲会告诉我：“你做的很棒（或其他肯定的话）！”', options: APQ_OPTIONS },
      { text: '父亲会威胁要惩罚我，但是事实上并没有那么做', options: APQ_OPTIONS },
      { text: '我没有让父亲知道我将要去哪里', options: APQ_OPTIONS },
      { text: '做了错事后，我会和父亲理论以避免受到惩罚', options: APQ_OPTIONS },
      { text: '在晚上，过了规定的时间我仍然逗留在外', options: APQ_OPTIONS },
      { text: '当我做得好时父亲会称赞我', options: APQ_OPTIONS },
      { text: '如果我表现好父亲会表扬我', options: APQ_OPTIONS },
      { text: '父亲不知道我和谁一起出去玩耍', options: APQ_OPTIONS },
      { text: '父亲会提前结束对我的惩罚（如惩罚结束的时间比之前说得更早）', options: APQ_OPTIONS }
    ]
  },
  {
    id: 'apq9_mother',
    title: '教养行为评估 (母亲篇)',
    subtitle: 'APQ-9 母亲',
    description: '指导语：此问卷是关于您的母亲对您的教养方式，请实事求是地回答。',
    questions: [
      { text: '当我很好地完成一项任务时，母亲会告诉我：“你做的很棒（或其他肯定的话）！”', options: APQ_OPTIONS },
      { text: '母亲会威胁要惩罚我，但是事实上并没有那么做', options: APQ_OPTIONS },
      { text: '我没有让母亲知道我将要去哪里', options: APQ_OPTIONS },
      { text: '做了错事后，我会和母亲理论以避免受到惩罚', options: APQ_OPTIONS },
      { text: '在晚上，过了规定的时间我仍然逗留在外', options: APQ_OPTIONS },
      { text: '当我做得好时母亲会称赞我', options: APQ_OPTIONS },
      { text: '如果我表现好母亲会表扬我', options: APQ_OPTIONS },
      { text: '母亲不知道我和谁一起出去玩耍', options: APQ_OPTIONS },
      { text: '母亲会提前结束对我的惩罚（如惩罚结束的时间比之前说得更早）', options: APQ_OPTIONS }
    ]
  }
];

export const SLEEP_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'sleep',
    title: '睡眠状况评估',
    subtitle: '睡眠问卷',
    description: '下面是一些有关睡眠的问题。请根据最近1个月的情况填写。',
    questions: [
      {
        text: '你晚上一般睡几个小时？',
        options: [
          { value: 0, label: '少于4' },
          { value: 1, label: '4-6' },
          { value: 2, label: '7' },
          { value: 3, label: '8' },
          { value: 4, label: '9及以上' }
        ]
      },
      {
        text: '描述你当前(最近一个月)失眠问题的严重程度：入睡困难',
        options: [
          { value: 0, label: '无' },
          { value: 1, label: '轻度' },
          { value: 2, label: '中度' },
          { value: 3, label: '重度' },
          { value: 4, label: '极重度' }
        ]
      },
      {
        text: '描述你当前(最近一个月)失眠问题的严重程度：维持睡眠困难',
        options: [
          { value: 0, label: '无' },
          { value: 1, label: '轻度' },
          { value: 2, label: '中度' },
          { value: 3, label: '重度' },
          { value: 4, label: '极重度' }
        ]
      },
      {
        text: '描述你当前(最近一个月)失眠问题的严重程度：早醒',
        options: [
          { value: 0, label: '无' },
          { value: 1, label: '轻度' },
          { value: 2, label: '中度' },
          { value: 3, label: '重度' },
          { value: 4, label: '极重度' }
        ]
      },
      {
        text: '对自己当前睡眠情况的满意度',
        options: [
          { value: 0, label: '很不满意' },
          { value: 1, label: '不满意' },
          { value: 2, label: '一般' },
          { value: 3, label: '满意' },
          { value: 4, label: '很满意' }
        ]
      },
      {
        text: '你认为您的睡眠问题在多大程度上干扰了您的日间功能(如:日间疲劳、处理工作 and 日常事务的能力、注意力、记忆力、情绪等)？',
        options: [
          { value: 0, label: '没有干扰' },
          { value: 1, label: '轻微干扰' },
          { value: 2, label: '有些干扰' },
          { value: 3, label: '较多干扰' },
          { value: 4, label: '很多干扰' }
        ]
      },
      {
        text: '与其他人相比，你的失眠问题对您的生活质量有多大程度的影响或损害？',
        options: [
          { value: 0, label: '没有' },
          { value: 1, label: '一点' },
          { value: 2, label: '有些' },
          { value: 3, label: '较多' },
          { value: 4, label: '很多' }
        ]
      },
      {
        text: '你对自己当前睡眠问题有多大程度担忧或烦忧？',
        options: [
          { value: 0, label: '没有' },
          { value: 1, label: '一点' },
          { value: 2, label: '有些' },
          { value: 3, label: '较多' },
          { value: 4, label: '很多' }
        ]
      },
      {
        text: '你一般午休多久？',
        options: [
          { value: 0, label: '不午休' },
          { value: 1, label: '15-30分钟' },
          { value: 2, label: '30-45分钟' },
          { value: 3, label: '45-60分钟' },
          { value: 4, label: '超过60分钟' }
        ]
      },
      {
        text: '过去一个月，你服用助眠药物的情况',
        options: [
          { value: 0, label: '没有' },
          { value: 1, label: '少于1次/周' },
          { value: 2, label: '1-2次/周' },
          { value: 3, label: '3次及以上/周' }
        ]
      }
    ]
  }
];
