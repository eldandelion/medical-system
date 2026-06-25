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
    description: '此问卷是关于您的父亲对您的教养方式，请实事求是地回答。',
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
    description: '此问卷是关于您的母亲对您的教养方式，请实事求是地回答。',
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
    description: '请根据您的实际手机使用体验，选择最符合的同意程度。',
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
    description: '请根据您最近的网络游戏使用情况，客观地选择频率。',
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
    description: '请根据以下拖延描述和您实际情况的相符程度进行选择，答案无好坏对错之分。',
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
    description: '请根据您平常吃东西的实际情况，选择最适合的选项。',
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

export const PEER_RELATIONSHIP_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '比较不符合' },
  { value: 3, label: '不确定' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '完全符合' }
];

export const LONELINESS_OPTIONS = [
  { value: 1, label: '从不' },
  { value: 2, label: '有时' },
  { value: 3, label: '经常' },
  { value: 4, label: '总是' }
];

export const SOCIAL_SUPPORT_OPTIONS = [
  { value: 1, label: '完全不同意' },
  { value: 2, label: '大多不同意' },
  { value: 3, label: '少许不同意' },
  { value: 4, label: '中立' },
  { value: 5, label: '少许同意' },
  { value: 6, label: '大多同意' },
  { value: 7, label: '完全同意' }
];

export const SOCIAL_ENVIRONMENT_SUPPORT_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'peer_relationship',
    title: '社交环境评估 (同伴关系)',
    subtitle: '同伴关系量表',
    description: '下面描述的是您日常生活中与人交往的情况，请按照实际情况回答。',
    questions: [
      { text: '同学们都不喜欢我', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '在学校里，我很孤单', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '许多同学和我有矛盾', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '学校里，没有同学和我一起玩', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '在班上，我没有朋友可以交谈', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '同学们对我不好', options: PEER_RELATIONSHIP_OPTIONS }
    ]
  },
  {
    id: 'teacher_relationship',
    title: '社交环境评估 (师生关系)',
    subtitle: '师生关系量表',
    description: '下面描述的是您日常生活中与人交往的情况，请按照实际情况回答。',
    questions: [
      { text: '我认为老师从不真正理解我', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '即使我表现出色老师也视而不见', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '有时我觉得老师故意找我的麻烦', options: PEER_RELATIONSHIP_OPTIONS },
      { text: '老师对我很轻视', options: PEER_RELATIONSHIP_OPTIONS }
    ]
  },
  {
    id: 'loneliness',
    title: '心理感受评估 (孤独体验)',
    subtitle: '孤独感量表',
    description: '请根据您近期在人际交往中的主观感受，选择最符合的频率。',
    questions: [
      { text: '我感到自己缺少伙伴', options: LONELINESS_OPTIONS },
      { text: '当当我遇到困难时，周围没有人能帮助我', options: LONELINESS_OPTIONS },
      { text: '我是一个好相处的人', options: LONELINESS_OPTIONS },
      { text: '我感到被人忽视', options: LONELINESS_OPTIONS },
      { text: '我觉得自己与别人(同学、朋友)的关系不亲密', options: LONELINESS_OPTIONS },
      { text: '当当我愿意时就能找到伙伴', options: LONELINESS_OPTIONS },
      { text: '对于自己的离群（或孤独），我是不开心的', options: LONELINESS_OPTIONS },
      { text: '我感觉我周围的人不关心我', options: LONELINESS_OPTIONS }
    ]
  },
  {
    id: 'social_support',
    title: '支持系统评估 (社会支持)',
    subtitle: '社会支持量表',
    description: '下面的问题主要反映了您身边所能获得的支持，根据实际情况选择最相符的程度。',
    questions: [
      { text: '在我遇到问题时有些人（亲戚、老师、同学）会出现在我的身旁', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我能够与有些人（亲戚、老师、同学）分享快乐与忧伤', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我的家庭能够切实具体地给我帮助', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我能够从家庭中获得感情上帮助和支持', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '当我有困难时有些人（亲戚、老师、同学）是安慰我的真正源泉', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我的朋友们能真正的帮助我', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '在发生困难时我可以依靠我的朋友们', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我能与自己的家庭谈论我的难题', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我的朋友们能与我分享快乐与忧伤', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '有些人（老师同学）关心我情绪情感', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我的家庭能协助我作出各种决定', options: SOCIAL_SUPPORT_OPTIONS },
      { text: '我能与朋友们讨论自己的难题', options: SOCIAL_SUPPORT_OPTIONS }
    ]
  }
];

export const IMPULSIVITY_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '不符合' },
  { value: 3, label: '符合' },
  { value: 4, label: '完全符合' }
];

export const SELF_CONTROL_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '较少不符合' },
  { value: 3, label: '一般符合' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '完全符合' }
];

export const GRIT_OPTIONS = [
  { value: 1, label: '完全不像我' },
  { value: 2, label: '大部分不像我' },
  { value: 3, label: '有些像我' },
  { value: 4, label: '大部分像我' },
  { value: 5, label: '完全像我' }
];

export const EMOTION_REGULATION_OPTIONS = [
  { value: 1, label: '非常不符合' },
  { value: 2, label: '不符合' },
  { value: 3, label: '有点不符合' },
  { value: 4, label: '不确定' },
  { value: 5, label: '有点符合' },
  { value: 6, label: '符合' },
  { value: 7, label: '完全符合' }
];

export const SELF_REGULATION_PERSONALITY_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'impulsivity',
    title: '行为倾向评估 (冲动程度)',
    subtitle: '冲动量表',
    description: '下列是一些日常行为表现的描述，请仔细阅读每一条，然后尽可能根据自己的真实情况回答下列问题与你的符合程度。',
    questions: [
      { text: '我不专心', options: IMPULSIVITY_OPTIONS },
      { text: '我容易集中注意力', options: IMPULSIVITY_OPTIONS },
      { text: '我一时兴起而行事', options: IMPULSIVITY_OPTIONS },
      { text: '我做事不加考虑', options: IMPULSIVITY_OPTIONS },
      { text: '我是一个思考问题谨慎的人', options: IMPULSIVITY_OPTIONS },
      { text: '我仔细地计划任务', options: IMPULSIVITY_OPTIONS },
      { text: '我能够自我控制', options: IMPULSIVITY_OPTIONS },
      { text: '我说话不加思考', options: IMPULSIVITY_OPTIONS }
    ]
  },
  {
    id: 'self_control',
    title: '自我管理评估 (自制力状况)',
    subtitle: '自我控制量表',
    description: '下列是一些日常行为表现的描述，请仔细阅读每一条，然后尽可能根据自己的真实情况回答下列问题与你的符合程度。',
    questions: [
      { text: '我能很好地抵抗诱惑', options: SELF_CONTROL_OPTIONS },
      { text: '大家说我有钢铁般的自制力', options: SELF_CONTROL_OPTIONS },
      { text: '我能为了一个长远目标高效地工作', options: SELF_CONTROL_OPTIONS },
      { text: '我会做一些能给自己带来快乐但对自己有害的事', options: SELF_CONTROL_OPTIONS },
      { text: '有时我会被有趣的事情干扰而不能按时完成任务', options: SELF_CONTROL_OPTIONS },
      { text: '有时我会忍不住去做一些明明知道不对的事情', options: SELF_CONTROL_OPTIONS },
      { text: '我常常考虑不周就付诸行动', options: SELF_CONTROL_OPTIONS }
    ]
  },
  {
    id: 'grit',
    title: '意志毅力评估 (坚毅品质)',
    subtitle: '坚毅量表',
    description: '请根据您对以下描述的相符程度，选择最符合您的实际选项。',
    questions: [
      { text: '新的计划和想法有时候会让我想无法专心于现有的计划。', options: GRIT_OPTIONS },
      { text: '挫折不会使我气馁。', options: GRIT_OPTIONS },
      { text: '当我着迷于某件计划一阵子后，会失去兴趣。', options: GRIT_OPTIONS },
      { text: '我是个努力工作的人。', options: GRIT_OPTIONS },
      { text: '我时常立下一个目标，但一阵子过后又改追求别的目标。', options: GRIT_OPTIONS },
      { text: '我很难把我的注意力集中在一个要好几个月才能完成的计划上。', options: GRIT_OPTIONS },
      { text: '无论什么事情，我开了头就要完成它。', options: GRIT_OPTIONS },
      { text: '我很勤劳（我不轻言放弃）。', options: GRIT_OPTIONS }
    ]
  },
  {
    id: 'emotion_regulation',
    title: '情绪机制评估 (调节策略)',
    subtitle: '认知重评与表达抑制量表',
    description: '请根据您日常处理情绪时的真实表现，选择最相符的程度。',
    questions: [
      { text: '当我想让自己更快乐时，我改变些观念就能实现。', options: EMOTION_REGULATION_OPTIONS },
      { text: '我会控制自己的情绪', options: EMOTION_REGULATION_OPTIONS },
      { text: '当我想让自己少点消极情绪，我改变些想法就可实现', options: EMOTION_REGULATION_OPTIONS },
      { text: '我高兴时，我会压抑自己不把这种情绪外显', options: EMOTION_REGULATION_OPTIONS },
      { text: '面对压力，我会使用一些策略让自己保持冷静', options: EMOTION_REGULATION_OPTIONS },
      { text: '我通常采用压抑的方式来控制自己的情绪', options: EMOTION_REGULATION_OPTIONS },
      { text: '当我想让情绪更积极，我会换种方式看待糟糕的处境', options: EMOTION_REGULATION_OPTIONS },
      { text: '我会换种角度看待周边环境，以此达到控制情绪目的', options: EMOTION_REGULATION_OPTIONS },
      { text: '当我体验到消极情绪时，我会压抑这种情绪表现出来', options: EMOTION_REGULATION_OPTIONS },
      { text: '当想减少消极情绪，我会换种方式看待不利处境', options: EMOTION_REGULATION_OPTIONS }
    ]
  }
];

export const LIFE_EVENTS_OPTIONS = [
  { value: 0, label: '未发生' },
  { value: 1, label: '没有' },
  { value: 2, label: '轻度' },
  { value: 3, label: '中度' },
  { value: 4, label: '重度' },
  { value: 5, label: '极度' }
];

export const CHILDHOOD_SES_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '大多不符合' },
  { value: 3, label: '少许不符合' },
  { value: 4, label: '中立' },
  { value: 5, label: '少许符合' },
  { value: 6, label: '大多符合' },
  { value: 7, label: '完全符合' }
];

export const CHILDHOOD_TRAUMA_OPTIONS = [
  { value: 1, label: '没有' },
  { value: 2, label: '偶尔' },
  { value: 3, label: '有时' },
  { value: 4, label: '经常' },
  { value: 5, label: '总是' }
];

export const FAMILY_BACKGROUND_EARLY_EXPERIENCES_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'life_events',
    title: '家庭背景与环境评估 (生活事件)',
    subtitle: '一般生活事件量表',
    description: '下面想了解一下过去任何时候你经历过且近 12 个月内对你心理有不良影响的生活事件。若发生过，请填写对你心理不良影响的影响程度。',
    questions: [
      { text: '夫妻或恋人间发生矛盾', options: LIFE_EVENTS_OPTIONS },
      { text: '与生育有关的问题(流产、不孕不育等)', options: LIFE_EVENTS_OPTIONS },
      { text: '恋爱或结婚问题（失恋、离婚等）', options: LIFE_EVENTS_OPTIONS },
      { text: '与家庭其他成员发生矛盾', options: LIFE_EVENTS_OPTIONS },
      { text: '与其他人发生矛盾', options: LIFE_EVENTS_OPTIONS },
      { text: '家庭其他成员间发生矛盾', options: LIFE_EVENTS_OPTIONS },
      { text: '患急、重病或外伤', options: LIFE_EVENTS_OPTIONS },
      { text: '经济问题', options: LIFE_EVENTS_OPTIONS },
      { text: '工作或学习问题', options: LIFE_EVENTS_OPTIONS },
      { text: '亲友患重病或去世', options: LIFE_EVENTS_OPTIONS },
      { text: '被虐待', options: LIFE_EVENTS_OPTIONS },
      { text: '其它负性生活事件', options: LIFE_EVENTS_OPTIONS }
    ]
  },
  {
    id: 'childhood_ses',
    title: '早期经历与背景评估 (经济地位)',
    subtitle: '童年社会经济地位量表',
    description: '请根据您对童年成长时期家庭经济及社会层级的真实感受进行选择。',
    questions: [
      { text: '我童年时家庭有足够的钱来满足各种需求', options: CHILDHOOD_SES_OPTIONS },
      { text: '我童年时，父母在当地有较高的社会地位', options: CHILDHOOD_SES_OPTIONS },
      { text: '相比于童年的伙伴，我的生活更加富足', options: CHILDHOOD_SES_OPTIONS },
      { text: '我成长在一个富足稳定的小区环境', options: CHILDHOOD_SES_OPTIONS }
    ]
  },
  {
    id: 'childhood_trauma',
    title: '早期经历评估 (成长逆境)',
    subtitle: '儿童期虐待与忽视量表',
    description: '本问卷调查的是你儿童期（16岁以前）的成长经历。请根据你当时的体会选择最适合您情况的答案（在你16岁以前无出现以下情况及出现的频率）。',
    questions: [
      { text: '我无法获得足够的食物', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我知道有人照顾我和保护我', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里人喊我“笨蛋”、“懒虫”或“丑八怪”等', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我的父母因为喝酒太多或太贪玩而不能照顾家庭', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里有人使我感到自己是重要的或特别的', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我不得不穿脏衣服', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我感受到有人爱我', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得父母希望从来没有生下我', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里有人把我打得很重，不得不去医院就诊', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得家里的状况不需要改变', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里有人把我打得很重，使我皮肤青紫或留下伤痕', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人用皮带、绳子、木板或其它硬东西惩罚我', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里人彼此互相关心', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里有人说让我伤心或侮辱我的话', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得自己受到了躯体虐待', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '请在此题选择第三个选项', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得自己有一个完美的童年', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我被打得很惨，引起了老师、邻居或医生的注意', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得家里有人恨我', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家里人关系很亲密', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人以带有性色彩的方式触摸我或让我触摸他/她', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人通过威胁或欺骗的方式让我同他/她做与性有关的事', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我的家庭是世界上最好的', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人试图让我做与性有关的事或观看与性有关的内容', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人对我进行性骚扰', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得自己受到了情感虐待', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '有人在我生病时带我去看医生', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '我觉得自己受到了性虐待', options: CHILDHOOD_TRAUMA_OPTIONS },
      { text: '家是我获得力量和支持的源泉', options: CHILDHOOD_TRAUMA_OPTIONS }
    ]
  }
];

export const NSSI_OPTIONS = [
  { value: 1, label: '0次' },
  { value: 2, label: '1~2次' },
  { value: 3, label: '3~5次' },
  { value: 4, label: '6次及以上' }
];

export const PQ16_OPTIONS = [
  { value: 0, label: '否' },
  { value: 1, label: '是，无痛苦' },
  { value: 2, label: '是，轻度痛苦' },
  { value: 3, label: '是，中度痛苦' },
  { value: 4, label: '是，重度痛苦' }
];

export const ADHD_OPTIONS = [
  { value: 0, label: '从不' },
  { value: 1, label: '很少' },
  { value: 2, label: '有时' },
  { value: 3, label: '经常' },
  { value: 4, label: '非常频繁' }
];

export const BRIEF_A_OPTIONS = [
  { value: 1, label: '从不' },
  { value: 2, label: '偶尔' },
  { value: 3, label: '经常' }
];

export const CLINICAL_SCREENING_NEURODIVERGENCE_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'nssi',
    title: '高危筛查评估 (非自杀性自伤行为)',
    subtitle: '自伤量表',
    description: '请您选择在过去的一年内出现以下行为的次数。选择最适合的选项。',
    questions: [
      { text: '刻意用刀划自己', options: NSSI_OPTIONS },
      { text: '刻意用力咬自己', options: NSSI_OPTIONS },
      { text: '刻意用力抓破皮肤', options: NSSI_OPTIONS },
      { text: '刻意将物体刺入指甲或皮肤', options: NSSI_OPTIONS },
      { text: '刻意用拳头猛打自己', options: NSSI_OPTIONS }
    ]
  },
  {
    id: 'pq16',
    title: '临床筛查评估 (感知与思维模式)',
    subtitle: '超高危筛查量表',
    description: '在过去的一个月内，您的想法、情感或体验是否存在以下情况？（注：请勿将使用酒精或药物后的反应计算在内，若回答“是”，请评定其带来的痛苦程度）。',
    questions: [
      { text: '我对喜欢的事情不再有兴趣。', options: PQ16_OPTIONS },
      { text: '我经常经历一些似曾发生过的事情。', options: PQ16_OPTIONS },
      { text: '我有时可以闻到别人闻不到的气味，或尝到别人尝不到的味道。', options: PQ16_OPTIONS },
      { text: '我耳朵里经常出现一些不寻常的声音，如撞击声、破裂声、嘶嘶声、拍打声、铃声等。', options: PQ16_OPTIONS },
      { text: '我有时会对自己经历的事情是真实的还是想象的感到困惑。', options: PQ16_OPTIONS },
      { text: '当我注视他们或者镜子中的自己时，会发现面部在发生变化。', options: PQ16_OPTIONS },
      { text: '我与人首次见面时会非常不安。', options: PQ16_OPTIONS },
      { text: '我曾看到过别人无法看到的事物。', options: PQ16_OPTIONS },
      { text: '我的想法有时很强烈以至于我几乎都能听到。', options: PQ16_OPTIONS },
      { text: '我有时能从广告、商店橱窗或者周围事物的排列方式中发现特别的意义。', options: PQ16_OPTIONS },
      { text: '有时我觉得无法控制自己的思维或想法。', options: PQ16_OPTIONS },
      { text: '有时我会突然被远处一些平时没意识到的声音弄得分心。', options: PQ16_OPTIONS },
      { text: '我曾听到别人无法听到的声音，诸如窃窃私语或谈话声。', options: PQ16_OPTIONS },
      { text: '我经常感到别人在针对我。', options: PQ16_OPTIONS },
      { text: '我曾感到过有人或某种力量在我周围，虽然我看不见。', options: PQ16_OPTIONS },
      { text: '我感到身体的某些部位以某种方式发生了变化，或某些部位的功能与以往不同。', options: PQ16_OPTIONS }
    ]
  },
  {
    id: 'adhd',
    title: '神经多样性评估 (执行力与注意力)',
    subtitle: '成人 ADHD 自我报告量表 (ASRS)',
    description: '请根据您在过去六个月中的真实感受与行为表现，在右侧选择最相符的频率。',
    questions: [
      { text: '当必须进行一件枯燥或困难的计划时，你会多常粗心犯错？', options: ADHD_OPTIONS },
      { text: '当正在做枯燥或重复性的工作时，你多常有持续专注的困难？', options: ADHD_OPTIONS },
      { text: '即使有人直接对你说话，你会多常有困难专注于别人跟你讲话的内容？', options: ADHD_OPTIONS },
      { text: '一旦完成任何计划中最具挑战的部份之后，你多常有完成计划最后细节的困难？', options: ADHD_OPTIONS },
      { text: '当必须从事需要有组织规划性的任务时，你会多常有困难并然有序地去做？', options: ADHD_OPTIONS },
      { text: '当有一件需要多费心思考的工作时，你会多常逃避或是延后开始去做？', options: ADHD_OPTIONS },
      { text: '在家里或是在工作时，你会多常没有把东西放对地方或是找不到东西？', options: ADHD_OPTIONS },
      { text: '你会多常因身旁的活动或声音而分心？', options: ADHD_OPTIONS },
      { text: '你会多常有问题去记得约会或是必须要做的事？', options: ADHD_OPTIONS },
      { text: '当你必须长时间坐着时，你会多常坐不安稳或扭动手脚？', options: ADHD_OPTIONS },
      { text: '你会多常在开会时或在其他被期待坐好的场合中离开座位？', options: ADHD_OPTIONS },
      { text: '你会多常觉得静下来或烦躁不安？', options: ADHD_OPTIONS },
      { text: '当有自己独处的时间时，你会多常觉得有困难使自己平静和放松？', options: ADHD_OPTIONS },
      { text: '你会多常像被马达所驱动一样，觉得自己过度地活跃，不得不做事情？', options: ADHD_OPTIONS },
      { text: '在社交场合中，你会多常发现自己话讲得太多？', options: ADHD_OPTIONS },
      { text: '当与他人交谈时，你会多常在别人还没把话讲完前就插嘴或接话替对方把话讲完？', options: ADHD_OPTIONS },
      { text: '在需要轮流排队的场合时，你会多常有困难轮流等待？', options: ADHD_OPTIONS },
      { text: '你会多常在别人忙碌时打断别人？', options: ADHD_OPTIONS },
      { text: '小时候老师或家长多常会说你容易走神/坐不住/太好动？', options: ADHD_OPTIONS }
    ]
  },
  {
    id: 'brief_a',
    title: '神经多样性评估 (执行功能障碍)',
    subtitle: '行为评定量表 (Brief-A)',
    description: '请使用三个等级来评价以下描述和您实际情况的相符程度，答案无好坏对错之分。',
    questions: [
      { text: '我难以集中精力做事情（例如家务阅读或者工作）', options: BRIEF_A_OPTIONS },
      { text: '我难以完成包含多个步骤的工作或任务', options: BRIEF_A_OPTIONS },
      { text: '我做事中途忘记自己在干什么', options: BRIEF_A_OPTIONS },
      { text: '我交谈时难以保持在同一话题', options: BRIEF_A_OPTIONS },
      { text: '我注意力持续时间短', options: BRIEF_A_OPTIONS },
      { text: '我容易忘记指示', options: BRIEF_A_OPTIONS },
      { text: '即使只隔几分钟我也难以记住（方位，电话号码）之类的事情', options: BRIEF_A_OPTIONS },
      { text: '我难以同时做两件事情', options: BRIEF_A_OPTIONS },
      { text: '我承受不了大任务', options: BRIEF_A_OPTIONS },
      { text: '我难以区分活动的优先次序', options: BRIEF_A_OPTIONS },
      { text: '我没准备好恰当的材料就开始做事，如做饭，实施一项计划等', options: BRIEF_A_OPTIONS },
      { text: '我不为未来活动提前做计划', options: BRIEF_A_OPTIONS },
      { text: '我有不现实的计划', options: BRIEF_A_OPTIONS },
      { text: '我有好的想法但是难以使之成文', options: BRIEF_A_OPTIONS },
      { text: '我难以独自完成任务', options: BRIEF_A_OPTIONS },
      { text: '我不提前为需要完成的任务做计划', options: BRIEF_A_OPTIONS },
      { text: '我难以组织活动', options: BRIEF_A_OPTIONS },
      { text: '我难以组织工作', options: BRIEF_A_OPTIONS }
    ]
  }
];

export const AGGRESSION_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '较少不符合' },
  { value: 3, label: '一般符合' },
  { value: 4, label: '比较符合' },
  { value: 5, label: '完全符合' }
];

export const COPING_OPTIONS = [
  { value: 1, label: '不采取' },
  { value: 2, label: '偶尔采取' },
  { value: 3, label: '有时采取' },
  { value: 4, label: '经常采取' }
];

export const SWLS_OPTIONS = [
  { value: 1, label: '完全不同意' },
  { value: 2, label: '大多不同意' },
  { value: 3, label: '少许不同意' },
  { value: 4, label: '中立' },
  { value: 5, label: '少许同意' },
  { value: 6, label: '大多同意' },
  { value: 7, label: '完全同意' }
];

export const BIG_FIVE_OPTIONS = [
  { value: 1, label: '完全不符合' },
  { value: 2, label: '较不符合' },
  { value: 3, label: '有点不符合' },
  { value: 4, label: '有点符合' },
  { value: 5, label: '比较符合' },
  { value: 6, label: '完全符合' }
];

export const PERSONALITY_COPING_OUTLOOK_ASSESSMENT: AssessmentSection[] = [
  {
    id: 'aggression',
    title: '人格倾向评估 (情绪宣泄方式)',
    subtitle: '攻击量表',
    description: '下列是一些日常行为表现的描述，请仔细阅读每一条，然后尽可能根据自己的真实情况回答下列问题与你的符合程度。',
    questions: [
      { text: '当人们与我意见不和时，我会忍不住与他们争论', options: AGGRESSION_OPTIONS },
      { text: '不知道为什么有时我会对一些事情感到如此痛苦', options: AGGRESSION_OPTIONS },
      { text: '我曾威胁过我认识的人', options: AGGRESSION_OPTIONS },
      { text: '如果受到足够的刺激，我可能会揍另一个来出气', options: AGGRESSION_OPTIONS },
      { text: '有时候我觉得在生活中受到了不公平的待遇', options: AGGRESSION_OPTIONS },
      { text: '我难于控制自己的脾气', options: AGGRESSION_OPTIONS },
      { text: '我经常发现自己和人们意见不和', options: AGGRESSION_OPTIONS },
      { text: '有时，我感觉自己像一个随时要爆炸的火药筒一样', options: AGGRESSION_OPTIONS },
      { text: '别人似乎总能交好运', options: AGGRESSION_OPTIONS },
      { text: '如果有人很用力推我，我们就会打起来', options: AGGRESSION_OPTIONS },
      { text: '朋友们说我有点儿好与人争辩', options: AGGRESSION_OPTIONS },
      { text: '有时我会无缘无故地发火', options: AGGRESSION_OPTIONS },
      { text: '请在此题选择第一个选项', options: AGGRESSION_OPTIONS }
    ]
  },
  {
    id: 'coping_styles',
    title: '压力应对评估 (心理防卫机制)',
    subtitle: '应对方式量表',
    description: '以下列出的是当你在生活中收到挫折打击，或遇到困难时可能采取的态度和做法。请你仔细阅读每一项，选择最适合你的选项。',
    questions: [
      { text: '试图休息或放假，暂时把问题(烦恼)抛开', options: COPING_OPTIONS },
      { text: '通过吸烟、喝酒、服药和吃东西来解除烦恼', options: COPING_OPTIONS },
      { text: '认为时间会改变现状，唯一要做的是等待', options: COPING_OPTIONS },
      { text: '试图忘记整个事情', options: COPING_OPTIONS },
      { text: '依靠别人解决问题', options: COPING_OPTIONS },
      { text: '接受现实，因为没有其它办法', options: COPING_OPTIONS },
      { text: '幻想可能会发生某种奇迹改变现状', options: COPING_OPTIONS },
      { text: '自己安慰自己', options: COPING_OPTIONS }
    ]
  },
  {
    id: 'swls',
    title: '生活展望评估 (主观幸福感)',
    subtitle: '生活满意度量表',
    description: '请根据您对当前生活质量与状态的真实评价进行选择。',
    questions: [
      { text: '我现在的生活大致符合我的期待', options: SWLS_OPTIONS },
      { text: '我的生活状态非常幸福', options: SWLS_OPTIONS },
      { text: '我能得到我想要的重要东西', options: SWLS_OPTIONS },
      { text: '我满意自己的生活', options: SWLS_OPTIONS },
      { text: '如果回到过去我也不想改变什么', options: SWLS_OPTIONS }
    ]
  },
  {
    id: 'big_five',
    title: '核心特质评估 (基本人格特质)',
    subtitle: '大五人格量表',
    description: '请根据以下大五人格的相关描述与您自身情况的符合程度进行选择。',
    questions: [
      { text: '我觉得大部分人基本上是心怀善意的', options: BIG_FIVE_OPTIONS },
      { text: '请在这个选项中选择第二个选项', options: BIG_FIVE_OPTIONS },
      { text: '我对人多的聚会感到乏味', options: BIG_FIVE_OPTIONS },
      { text: '我是个勇于冒险，突破常规的人', options: BIG_FIVE_OPTIONS },
      { text: '我喜欢冒险', options: BIG_FIVE_OPTIONS },
      { text: '我尽量避免参加人多的聚会和去嘈杂的环境', options: BIG_FIVE_OPTIONS },
      { text: '我喜欢一开头就把事情计划好', options: BIG_FIVE_OPTIONS },
      { text: '我常担忧一些无关紧要的事情', options: BIG_FIVE_OPTIONS },
      { text: '我工作或学习很勤奋', options: BIG_FIVE_OPTIONS },
      { text: '虽然社会上有些骗子，但大部分人还是可信的', options: BIG_FIVE_OPTIONS },
      { text: '我身上具有别人没有的冒险精神', options: BIG_FIVE_OPTIONS },
      { text: '我常常感到内心不踏实', options: BIG_FIVE_OPTIONS },
      { text: '我常担心有什么不好 的事情要发生', options: BIG_FIVE_OPTIONS },
      { text: '尽管社会存在阴暗面，我仍坚信人性本善。', options: BIG_FIVE_OPTIONS },
      { text: '我喜欢参加社交与娱乐聚会', options: BIG_FIVE_OPTIONS },
      { text: '做事讲究逻辑和条理是我的一个特点', options: BIG_FIVE_OPTIONS }
    ]
  }
];
