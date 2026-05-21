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

export const MOBILE_ADDICTION_OPTIONS = [
  { value: 1, label: '完全不同意' },
  { value: 2, label: '基本不同意' },
  { value: 3, label: '有点不同意' },
  { value: 4, label: '有点同意' },
  { value: 5, label: '基本同意' },
  { value: 6, label: '完全同意' }
];

export const GAME_ADDICTION_OPTIONS = [
  { value: 1, label: '从不' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' }
];

export const PROCRASTINATION_OPTIONS = [
  { value: 1, label: '非常不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '一般符合' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '非常符合' }
];

export const EATING_HABITS_OPTIONS_1 = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '有点不符合' },
  { value: 3, label: '有点符合' },
  { value: 4, label: '完全符合' }
];

export const EATING_HABITS_Q14_OPTIONS = [
  { value: 1, label: '只有在吃饭时间' },
  { value: 2, label: '有时在两正餐之间' },
  { value: 3, label: '常常在两正餐之间' },
  { value: 4, label: '几乎随时' }
];

export const EATING_HABITS_Q15_OPTIONS = [
  { value: 1, label: '几乎没有' },
  { value: 2, label: '很少' },
  { value: 3, label: '经常' },
  { value: 4, label: '总是如此' }
];

export const EATING_HABITS_Q16_OPTIONS = [
  { value: 1, label: '不可能' },
  { value: 2, label: '有点不可能' },
  { value: 3, label: '可能' },
  { value: 4, label: '非常可能' }
];

export const EATING_HABITS_Q17_OPTIONS = [
  { value: 1, label: '从未' },
  { value: 2, label: '很少' },
  { value: 3, label: '有时' },
  { value: 4, label: '一周至少一次' }
];

export const EATING_HABITS_Q18_OPTIONS = [
  { value: 0, label: '你在想吃的时候，会去吃任何想吃的东西。' },
  { value: 1, label: '你在想吃的时候，通常会去吃任何想吃的东西。' },
  { value: 2, label: '你在想吃的时候，经常会去吃任何想吃的东西。' },
  { value: 3, label: '你经常会限制自己吃东西的量，但也经常会放弃。' },
  { value: 4, label: '你经常会限制自己吃东西的量，且很少会放弃。' },
  { value: 5, label: '你持续地限制自己吃东西的量，且从未放弃。' }
];

export const DIGITAL_HABITS_DAILY_BEHAVIORS_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'mobile_addiction',
    title: '数字化行为评估 (手机成瘾)',
    subtitle: '手机成瘾量表',
    description: '指导语：请根据您的实际手机使用体验，选择最符合的同意程度。',
    questions: [
      { text: '手机是我生命里最重要的东西', options: MOBILE_ADDICTION_OPTIONS },
      { text: '使用手机会使我和父母或家人之间出现冲突', options: MOBILE_ADDICTION_OPTIONS },
      { text: '当我心情不好时，使用手机使我变得开心，可以暂时逃避或摆脱所面临的烦恼', options: MOBILE_ADDICTION_OPTIONS },
      { text: '随着时间推移，我在手机上浪费了越来越多的时间', options: MOBILE_ADDICTION_OPTIONS },
      { text: '在我想要时，如果我不能使用或接触手机，我觉得难过，喜怒无常，或急躁易怒', options: MOBILE_ADDICTION_OPTIONS },
      { text: '当我试着减少使用手机的时间，我只能坚持一段时间，但最终我还是会像以前那样使用它，甚至使用的更多', options: MOBILE_ADDICTION_OPTIONS }
    ]
  },
  {
    id: 'game_addiction',
    title: '数字化行为评估 (网络游戏)',
    subtitle: '网络游戏成瘾量表',
    description: '指导语：请根据您最近的网络游戏使用情况，客观地选择频率。',
    questions: [
      { text: '你是否觉得对网络游戏过于关注（如放学后还想着刚才网络游戏中的场景、或计划下次再去玩；你是否认为游戏已经成为你日常生活中的主要活动？）？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否感觉需要不断增加网络游戏的时间才能得到满足？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否曾多次试图控制、减少或停止玩网络游戏的次数或时间，但没有成功？', options: GAME_ADDICTION_OPTIONS },
      { text: '当你试图减少或停止玩网络游戏时，你是否感到焦虑不安、沮丧或易激惹？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否明知游戏会给你和其他人之间带来麻烦，却仍然继续玩游戏？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否因为沉迷于游戏而对以前的爱好和其他娱乐活动失去了兴趣？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否因为你的游戏活动过多而欺骗了你的家人、老师或其他大？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否为了暂时逃避或缓解负面情绪（如无助、内疚、焦虑）而玩游戏？', options: GAME_ADDICTION_OPTIONS },
      { text: '你是否因为你的游戏活动而危及或失去了一段重要的关系、教育或职业机会？', options: GAME_ADDICTION_OPTIONS }
    ]
  },
  {
    id: 'procrastination',
    title: '自律与自控评估 (拖延倾向)',
    subtitle: '拖延量表',
    description: '指导语：请根据以下拖延描述和您实际情况的相符程度进行选择，答案无好坏对错之分。',
    questions: [
      { text: '我总是到拖得不能再拖时才做决定。', options: PROCRASTINATION_OPTIONS },
      { text: '即便我做好了决定，我仍迟迟不愿行动。', options: PROCRASTINATION_OPTIONS },
      { text: '我总是在琐事上花费很多时间才能做出最终决定。', options: PROCRASTINATION_OPTIONS },
      { text: '在截止日期之前，我经常浪费时间做其他的事情。', options: PROCRASTINATION_OPTIONS },
      { text: '即使这项任务只需要我坐下来去做就可以了，我也会推迟几天再做。', options: PROCRASTINATION_OPTIONS },
      { text: '我觉得我经常把今天的事情推到明天去干。', options: PROCRASTINATION_OPTIONS },
      { text: '我发现自己时间不够用了。', options: PROCRASTINATION_OPTIONS },
      { text: '我没按时完成课业或工作。', options: PROCRASTINATION_OPTIONS },
      { text: '我一般不能够在截止时间前完成必须做的事情。', options: PROCRASTINATION_OPTIONS },
      { text: '我曾经拖延工作，代价不菲。', options: PROCRASTINATION_OPTIONS }
    ]
  },
  {
    id: 'eating_habits',
    title: '日常生活评估 (饮食习惯)',
    subtitle: '饮食情况评估',
    description: '指导语：请根据您平常吃东西的实际情况，选择最适合的选项。',
    questions: [
      { text: '当我闻到或看到美味可口的食物，即使才刚吃完饭，我也很难克制自己不吃。', options: EATING_HABITS_OPTIONS_1 },
      { text: '我会刻意用取用小分量来控制体重。', options: EATING_HABITS_OPTIONS_1 },
      { text: '当我觉得焦虑不安时，我会吃东西。', options: EATING_HABITS_OPTIONS_1 },
      { text: '有时候，当我一开始吃就停不下来。', options: EATING_HABITS_OPTIONS_1 },
      { text: '和一个正在吃东西的人在一起时，会让我觉得饿也需要去吃东西。', options: EATING_HABITS_OPTIONS_1 },
      { text: '当我心情不好时，我常会吃得过多。', options: EATING_HABITS_OPTIONS_1 },
      { text: '当我看到好吃的东西时，常会感到很饿，所以必须立刻去吃掉它。', options: EATING_HABITS_OPTIONS_1 },
      { text: '我常会饿得要命，觉得自己的胃像无底洞。', options: EATING_HABITS_OPTIONS_1 },
      { text: '我总是感到饿，所以在桌上还有饭菜时就叫我停止吃是很困难的。', options: EATING_HABITS_OPTIONS_1 },
      { text: '当我感到寂寞时，我会以吃东西来安慰自己。', options: EATING_HABITS_OPTIONS_1 },
      { text: '为了不使体重增加，吃饭时我会刻意控制自己吃东西的量。', options: EATING_HABITS_OPTIONS_1 },
      { text: '我不吃会使我变胖的食物。', options: EATING_HABITS_OPTIONS_1 },
      { text: '我常饿到可以在任何时间吃东西。', options: EATING_HABITS_OPTIONS_1 },
      { text: '你常在何时感到饥饿？', options: EATING_HABITS_Q14_OPTIONS },
      { text: '你会克制自己，不要吃过多好吃的东西吗？', options: EATING_HABITS_Q15_OPTIONS },
      { text: '有可能刻意限制自己吃东西的量吗？', options: EATING_HABITS_Q16_OPTIONS },
      { text: '你曾在不饿时也拼命地大吃吗？', options: EATING_HABITS_Q17_OPTIONS },
      { text: '请从以下选项中勾选出一个最符合你自己吃东西情况的描述：', options: EATING_HABITS_Q18_OPTIONS }
    ]
  }
];
