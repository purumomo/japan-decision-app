'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

const translations = {
  zh: {
    langName: '中文',
    title: '日本生活去留决策器',
    subtitle: '通过分支问卷、权重配置、对比情景与风险约束，生成一份可执行的建议路径',
    badge: 'Prototype',
    workflow: '工作流',
    preview: '实时决策预览',
    jpPlan: '日本方案',
    cnPlan: '回国方案',
    diff: '差值',
    thirdPlan: '第三国方案',
    quickNote: '数值仅为快速预览，最终建议以评分规则计算结果为准。',
    next: '下一步',
    prev: '上一步',
    generate: '生成建议',
    generating: '生成中...',
    summary: '汇总与建议',
    actions: '行动清单',
    reasons: '关键理由',
    risks: '风险提醒',
    recommendation: '建议路径',
    weightsTotal: '当前权重总和',
    compareTitle: '可视化对比',
    pathTitle: '推荐路径',
    error: '请求失败',
    breakdownTitle: '评分拆解',
    breakdownNote: '以下为各维度对分数的贡献（已按权重折算）。',
    analysisTitle: '分析图表',
    analysisTendency: '综合倾向',
    analysisWeights: '权重分布',
    analysisDrivers: '关键驱动',
    analysisDriversNote: '按贡献度排序（绝对值）',
    analysisLegend: {
      japan: '日本',
      return: '回国',
      third: '第三国'
    },
    analysisLabels: {
      money: '收入/成本',
      growth: '职业成长',
      life: '生活质量',
      family: '家庭因素',
      identity: '身份/归属',
      risk: '风险偏好',
      industry: '行业前景',
      network: '行业人脉',
      options: '局势下选择空间',
      visa_type_bonus: '签证类型加分',
      location_bonus: '城市类型加分',
      iron_bowl_bonus: '铁饭碗加分',
      avg_base: '基础平均',
      risk_tolerance: '风险容忍度',
      consider_third: '第三国意愿',
      debt_penalty: '负债惩罚'
    },
    weightIntro: '请分配你在决策中最看重的因素。系统会按比例归一化，用于比较日本与回国方案。',
    fxRate: '实时汇率',
    fxLoading: '获取中...',
    fxFail: '获取失败，使用默认汇率',
    fxNote: '1 万日元 ≈ {value} 万人民币',
    steps: {
      intro: '起点与目标',
      profile: '个人画像',
      weights: '优先级权重',
      japan: '留在日本的表现评分',
      ret: '回国后的表现评分',
      constraints: '约束与风险',
      detour: '特殊分支',
      options: '策略与时间线',
      summary: '汇总与建议'
    },
    japanDesc: '请根据你在日本继续发展的现实情况给出评分（1-10），用于与回国/第三国对比。',
    returnDesc: '请根据你回国后的现实情况给出评分（1-10），用于与留日/第三国对比。',
    labels: {
      stage: '当前阶段',
      target: '决定窗口期（多久内要定去留）',
      yearsJapan: '在日年限',
      visaType: '签证类型',
      visaMonthsLeft: '签证剩余(月)',
      industry: '行业',
      japaneseLevel: '日语舒适度(1-10)',
      japaneseHelp: '1-3：日常沟通吃力，工作交流较困难；4-6：生活沟通基本没问题，工作中仍有压力；7-10：工作与社交都很顺畅，语言不再是主要阻力',
      languageHelp: '这里指“工作语境下的语言适配度”，比如会议、汇报、邮件、商务沟通的顺畅程度。',
      ageGroup: '年龄段',
      weightMoney: '收入/成本',
      weightGrowth: '职业成长',
      weightLife: '生活质量',
      weightFamily: '家庭因素',
      weightIdentity: '身份/归属',
      weightRisk: '风险偏好',
      weightIndustry: '行业前景',
      weightHelp: {
        money: '衡量收入增长与生活成本的净收益重要性。',
        growth: '衡量职业晋升、技能积累与长期竞争力的重要性。',
        life: '衡量工作生活平衡、压力与生活质量的重要性。',
        family: '衡量家庭支持、陪伴需求与家庭因素的重要性。',
        identity: '衡量文化认同、归属感与社会融入的重要性。',
        risk: '衡量对不确定性与风险容忍度的重要性。',
        industry: '衡量行业景气度、就业稳定性与未来空间的重要性。'
      },
      weightHint: {
        money: ['0=不看重收入与成本差异', '10=极看重净收益'],
        growth: ['0=对成长不敏感', '10=非常看重成长'],
        life: ['0=对生活质量不敏感', '10=非常看重生活质量'],
        family: ['0=家庭因素影响小', '10=家庭因素非常重要'],
        identity: ['0=身份/归属感影响小', '10=身份/归属感非常重要'],
        risk: ['0=非常保守', '10=非常愿意承担风险'],
        industry: ['0=对行业前景不敏感', '10=非常看重行业前景']
      },
      jpHint: {
        growth: ['1=成长空间很小', '10=成长空间很大'],
        wlb: ['1=非常忙/压力大', '10=非常平衡/轻松'],
        visa: ['1=非常不稳定', '10=非常稳定'],
        network: ['1=人脉很弱', '10=人脉很强'],
        language: ['1=沟通困难', '10=沟通非常顺畅'],
        env: ['1=适应感很差', '10=非常适应/舒适'],
        options: ['1=选择空间很小', '10=选择空间很大'],
        industry: ['1=行业低迷', '10=行业前景很好']
      },
      rtHint: {
        growth: ['1=成长空间很小', '10=成长空间很大'],
        family: ['1=家庭支持很少', '10=家庭支持很强'],
        stress: ['1=压力很小', '10=压力很大'],
        network: ['1=人脉很弱', '10=人脉很强'],
        industry: ['1=行业低迷', '10=行业前景很好']
      },
      jpSalary: '税前年薪(万日元)',
      jpCost: '年生活成本(万日元)',
      jpTenThousand: '万日元',
      jpGrowth: '职业成长(1-10)',
      jpWlb: '工作生活平衡(1-10)',
      jpVisa: '签证稳定性(1-10)',
      jpNetwork: '行业人脉(1-10)',
      jpLanguage: '语言舒适度(1-10)',
      jpEnvFit: '环境认同感(1-10)',
      jpOptions: '局势下选择空间(1-10)',
      jpIndustry: '行业前景(1-10)',
      rtSalary: '税前年薪(万人民币)',
      rtCost: '年生活成本(万人民币)',
      cnTenThousand: '万人民币',
      rtGrowth: '职业成长(1-10)',
      rtFamily: '家庭支持(1-10)',
      rtStress: '市场压力(1-10)',
      rtNetwork: '行业人脉(1-10)',
      rtIndustry: '行业前景(1-10)',
      rtLocation: '回国城市类型',
      rtIronBowl: '家庭能安排铁饭碗',
      familyUrgent: '家庭紧急需求',
      healthIssue: '健康因素',
      savingsMonths: '可支撑月数',
      savingsHint: '可动用存款 ÷ 每月支出 = 可支撑月数',
      debt: '负债压力(万)',
      resetCost: '回国职业重置成本(1-10)',
      resetCostHint: ['1=几乎无需重置', '10=需要大幅重置/转行'],
      unlimited: '无限期',
      thirdCountry: '是否考虑第三国',
      riskTolerance: '风险容忍度(1-10)',
      timeline: '时间线',
      planStudy: '是否准备技能升级',
      shortReturn: '是否需要短期回国处理',
      optionsHint: {
        thirdCountry: '是否有考虑过第三国方案（例如转去其他国家工作/读书）',
        riskTolerance: '你对不确定性与风险的接受程度',
        riskToleranceHint: ['1=非常保守', '10=非常激进'],
        timeline: '你希望在多久内做出最终决定',
        planStudy: '是否计划通过进修/转职提升竞争力',
        shortReturn: '是否需要短期回国处理家庭或事务'
      }
    },
    options: {
      stage: {
        student: '在日学生',
        working: '在日工作',
        hunting: '求职中'
      },
      visa: {
        work: '工签',
        student: '留学签',
        spouse: '配偶',
        permanent: '永住',
        spousePermanent: '配偶永住',
        highSkilled: '高度人才',
        businessManager: '经营管理',
        other: '其他'
      },
      industry: {
        tech: '科技/互联网',
        manufacturing: '制造业',
        finance: '金融',
        design: '设计/媒体',
        service: '服务业'
      },
      age: {
        a: '22-25',
        b: '26-30',
        c: '31-35',
        d: '36+'
      },
      timeline: {
        a: '0-6个月',
        b: '6-12个月',
        c: '12-24个月'
      },
      location: {
        coastal: '沿海城市',
        inland: '内陆城市'
      },
      yes: '是',
      no: '否'
    }
  },
  ja: {
    langName: '日本語',
    title: '日本生活の去留意思決定ツール',
    subtitle: '分岐型質問、重み付け、シナリオ比較、リスク制約で実行可能な提案を生成',
    badge: 'プロトタイプ',
    workflow: 'ワークフロー',
    preview: 'リアルタイム予測',
    jpPlan: '日本案',
    cnPlan: '帰国案',
    diff: '差分',
    thirdPlan: '第三国案',
    quickNote: '数値は簡易プレビュー。最終判断はスコアリング結果。',
    next: '次へ',
    prev: '戻る',
    generate: '提案を生成',
    generating: '生成中...',
    summary: 'まとめと提案',
    actions: 'アクション',
    reasons: '根拠',
    risks: 'リスク注意',
    recommendation: '推奨ルート',
    weightsTotal: '重み合計',
    compareTitle: '可視化比較',
    pathTitle: '推奨パス',
    error: 'リクエスト失敗',
    breakdownTitle: 'スコア内訳',
    breakdownNote: '各要素がスコアに与える寄与（重み込み）を表示。',
    analysisTitle: '分析チャート',
    analysisTendency: '総合傾向',
    analysisWeights: '重み分布',
    analysisDrivers: '主要ドライバー',
    analysisDriversNote: '寄与度の大きい順（絶対値）',
    analysisLegend: {
      japan: '日本',
      return: '帰国',
      third: '第三国'
    },
    analysisLabels: {
      money: '収入/コスト',
      growth: 'キャリア成長',
      life: '生活品質',
      family: '家庭要因',
      identity: '帰属意識',
      risk: 'リスク選好',
      industry: '業界見通し',
      network: '人脈',
      options: '選択肢の幅',
      visa_type_bonus: 'ビザ加点',
      location_bonus: '都市タイプ加点',
      iron_bowl_bonus: '安定職加点',
      avg_base: '基礎平均',
      risk_tolerance: 'リスク許容度',
      consider_third: '第三国志向',
      debt_penalty: '負債ペナルティ'
    },
    weightIntro: '意思決定で重視する要素の比重を設定してください。比率で正規化され、日本案と帰国案の比較に使われます。',
    fxRate: 'リアルタイム為替',
    fxLoading: '取得中...',
    fxFail: '取得失敗、デフォルト為替',
    fxNote: '1 万円 ≈ {value} 万元',
    steps: {
      intro: 'スタートと目的',
      profile: '個人プロフィール',
      weights: '優先度の重み',
      japan: '日本に残る場合の評価',
      ret: '帰国後の評価',
      constraints: '制約とリスク',
      detour: '特別分岐',
      options: '戦略とタイムライン',
      summary: 'まとめと提案'
    },
    japanDesc: '日本で継続する現状を1〜10で評価し、帰国/第三国と比較します。',
    returnDesc: '帰国後の現状を1〜10で評価し、留日/第三国と比較します。',
    labels: {
      stage: '現在の段階',
      target: '決定ウィンドウ（いつまでに去就を決めるか）',
      yearsJapan: '在日期間(年)',
      visaType: 'ビザ種別',
      visaMonthsLeft: 'ビザ残り(月)',
      industry: '業界',
      japaneseLevel: '日本語の快適度(1-10)',
      japaneseHelp: '1-3：日常会話が難しく、業務でも苦戦；4-6：生活会話は可能だが仕事で負担；7-10：仕事・社交ともにスムーズで言語が障壁にならない',
      languageHelp: 'ここは「仕事の文脈での言語適応度」。会議・報告・メール・業務コミュニケーションの滑らかさ。',
      ageGroup: '年齢帯',
      weightMoney: '収入/コスト',
      weightGrowth: 'キャリア成長',
      weightLife: '生活品質',
      weightFamily: '家庭要因',
      weightIdentity: '帰属意識',
      weightRisk: 'リスク選好',
      weightIndustry: '業界見通し',
      weightHelp: {
        money: '収入増と生活コストの差の重要度。',
        growth: '昇進・スキル蓄積・長期競争力の重要度。',
        life: 'ワークライフバランスやストレスの重要度。',
        family: '家族支援や同居・距離の重要度。',
        identity: '文化適応や帰属意識の重要度。',
        risk: '不確実性への許容度の重要度。',
        industry: '業界の景気と安定性の重要度。'
      },
      weightHint: {
        money: ['0=収入/コスト差を重視しない', '10=純利益を最重視'],
        growth: ['0=成長に敏感でない', '10=成長を最重視'],
        life: ['0=生活品質に敏感でない', '10=生活品質を最重視'],
        family: ['0=家族要因の影響が小さい', '10=家族要因が非常に重要'],
        identity: ['0=帰属意識の影響が小さい', '10=帰属意識が非常に重要'],
        risk: ['0=とても保守的', '10=リスクを取れる'],
        industry: ['0=業界見通しに敏感でない', '10=業界見通しを最重視']
      },
      jpHint: {
        growth: ['1=成長余地が小さい', '10=成長余地が大きい'],
        wlb: ['1=非常に忙しい/高ストレス', '10=とてもバランス良い'],
        visa: ['1=非常に不安定', '10=非常に安定'],
        network: ['1=人脈が弱い', '10=人脈が強い'],
        language: ['1=コミュニケーション困難', '10=非常にスムーズ'],
        env: ['1=適応感が低い', '10=非常に適応している'],
        options: ['1=選択肢が少ない', '10=選択肢が多い'],
        industry: ['1=業界が低迷', '10=業界見通しが良い']
      },
      rtHint: {
        growth: ['1=成長余地が小さい', '10=成長余地が大きい'],
        family: ['1=家族支援が少ない', '10=家族支援が強い'],
        stress: ['1=ストレスが低い', '10=ストレスが高い'],
        network: ['1=人脈が弱い', '10=人脈が強い'],
        industry: ['1=業界が低迷', '10=業界見通しが良い']
      },
      jpSalary: '年収(万円)',
      jpCost: '年間生活費(万円)',
      jpTenThousand: '万円',
      jpGrowth: '成長(1-10)',
      jpWlb: 'ワークライフ(1-10)',
      jpVisa: 'ビザ安定性(1-10)',
      jpNetwork: '人脈(1-10)',
      jpLanguage: '言語快適度(1-10)',
      jpEnvFit: '環境の一致度(1-10)',
      jpOptions: '情勢下の選択肢(1-10)',
      jpIndustry: '業界見通し(1-10)',
      rtSalary: '年収(万元)',
      rtCost: '年間生活費(万元)',
      cnTenThousand: '万元',
      rtGrowth: '成長(1-10)',
      rtFamily: '家庭支援(1-10)',
      rtStress: '市場ストレス(1-10)',
      rtNetwork: '人脈(1-10)',
      rtIndustry: '業界見通し(1-10)',
      rtLocation: '帰国都市タイプ',
      rtIronBowl: '家族で安定職を確保',
      familyUrgent: '家庭の緊急性',
      healthIssue: '健康要因',
      savingsMonths: '維持可能月数',
      savingsHint: '利用可能な貯蓄 ÷ 月間支出 = 維持可能月数',
      debt: '負債(万)',
      resetCost: 'キャリア再編コスト(1-10)',
      resetCostHint: ['1=ほぼ再編不要', '10=大幅な再編/転職が必要'],
      unlimited: '無期限',
      thirdCountry: '第三国を検討',
      riskTolerance: 'リスク許容(1-10)',
      timeline: 'タイムライン',
      planStudy: 'スキル強化',
      shortReturn: '短期帰国が必要',
      optionsHint: {
        thirdCountry: '第三国への移動（就職/留学）を検討しているか',
        riskTolerance: '不確実性への許容度',
        riskToleranceHint: ['1=とても保守的', '10=とても積極的'],
        timeline: 'いつまでに最終判断したいか',
        planStudy: '学習/転職で競争力を上げる計画があるか',
        shortReturn: '短期帰国で用事を済ませる必要があるか'
      }
    },
    options: {
      stage: {
        student: '留学生',
        working: '在日就業',
        hunting: '求職中'
      },
      visa: {
        work: '就労',
        student: '留学',
        spouse: '配偶者',
        permanent: '永住',
        spousePermanent: '配偶永住',
        highSkilled: '高度専門職',
        businessManager: '経営管理',
        other: 'その他'
      },
      industry: {
        tech: 'IT',
        manufacturing: '製造',
        finance: '金融',
        design: 'デザイン/メディア',
        service: 'サービス'
      },
      age: {
        a: '22-25',
        b: '26-30',
        c: '31-35',
        d: '36+'
      },
      timeline: {
        a: '0-6ヶ月',
        b: '6-12ヶ月',
        c: '12-24ヶ月'
      },
      location: {
        coastal: '沿海都市',
        inland: '内陸都市'
      },
      yes: 'はい',
      no: 'いいえ'
    }
  },
  en: {
    langName: 'English',
    title: 'Japan Stay-or-Return Decision Tool',
    subtitle: 'Branching questionnaire, weight tuning, scenario comparison, and risk constraints to generate an actionable path.',
    badge: 'Prototype',
    workflow: 'Workflow',
    preview: 'Live Preview',
    jpPlan: 'Japan Plan',
    cnPlan: 'Return Plan',
    diff: 'Delta',
    thirdPlan: 'Third Country',
    quickNote: 'Preview only. Final decision follows the scoring rules.',
    next: 'Next',
    prev: 'Back',
    generate: 'Generate',
    generating: 'Generating...',
    summary: 'Summary & Recommendation',
    actions: 'Actions',
    reasons: 'Reasons',
    risks: 'Risk Notes',
    recommendation: 'Recommendation Path',
    weightsTotal: 'Weight Total',
    compareTitle: 'Visual Comparison',
    pathTitle: 'Suggested Path',
    error: 'Request failed',
    breakdownTitle: 'Score Breakdown',
    breakdownNote: 'Contribution of each factor (weight-adjusted).',
    analysisTitle: 'Analysis Charts',
    analysisTendency: 'Overall Tilt',
    analysisWeights: 'Weight Mix',
    analysisDrivers: 'Key Drivers',
    analysisDriversNote: 'Sorted by contribution (absolute).',
    analysisLegend: {
      japan: 'Japan',
      return: 'Return',
      third: 'Third Country'
    },
    analysisLabels: {
      money: 'Income/Cost',
      growth: 'Career Growth',
      life: 'Quality of Life',
      family: 'Family',
      identity: 'Identity',
      risk: 'Risk',
      industry: 'Industry',
      network: 'Network',
      options: 'Options',
      visa_type_bonus: 'Visa Bonus',
      location_bonus: 'Location Bonus',
      iron_bowl_bonus: 'Iron Bowl Bonus',
      avg_base: 'Base Avg',
      risk_tolerance: 'Risk Tolerance',
      consider_third: 'Third Country Intent',
      debt_penalty: 'Debt Penalty'
    },
    weightIntro: 'Set the importance of each factor. We normalize by proportion and use it to compare Japan vs return plans.',
    fxRate: 'Live FX',
    fxLoading: 'Loading...',
    fxFail: 'Failed, using default rate',
    fxNote: '10k JPY ≈ {value} 10k CNY',
    steps: {
      intro: 'Start & Goal',
      profile: 'Profile',
      weights: 'Priority Weights',
      japan: 'Japan Stay Performance',
      ret: 'Return Performance',
      constraints: 'Constraints & Risks',
      detour: 'Special Branch',
      options: 'Strategy & Timeline',
      summary: 'Summary & Recommendation'
    },
    japanDesc: 'Rate how staying in Japan performs (1–10) based on your current reality, for comparison with return/third-country.',
    returnDesc: 'Rate how returning performs (1–10) based on your current reality, for comparison with Japan/third-country.',
    labels: {
      stage: 'Current Stage',
      target: 'Decision window (when to decide stay/return)',
      yearsJapan: 'Years in Japan',
      visaType: 'Visa Type',
      visaMonthsLeft: 'Visa Remaining (months)',
      industry: 'Industry',
      japaneseLevel: 'Japanese Comfort (1-10)',
      japaneseHelp: '1-3: daily conversation is hard; 4-6: daily OK but work still stressful; 7-10: smooth at work and social, language not a barrier',
      languageHelp: 'This refers to work-context language fit: meetings, reporting, emails, business communication.',
      ageGroup: 'Age Group',
      weightMoney: 'Income/Cost',
      weightGrowth: 'Career Growth',
      weightLife: 'Life Quality',
      weightFamily: 'Family Factors',
      weightIdentity: 'Identity/Belonging',
      weightRisk: 'Risk Preference',
      weightIndustry: 'Industry Outlook',
      weightHelp: {
        money: 'Importance of net income vs living costs.',
        growth: 'Importance of promotions, skills, long-term edge.',
        life: 'Importance of work-life balance and stress.',
        family: 'Importance of family support and proximity.',
        identity: 'Importance of cultural fit and belonging.',
        risk: 'Importance of uncertainty tolerance.',
        industry: 'Importance of industry outlook and stability.'
      },
      weightHint: {
        money: ['0=Not sensitive to income/cost gap', '10=Highly focused on net gain'],
        growth: ['0=Not sensitive to growth', '10=Very growth-driven'],
        life: ['0=Not sensitive to life quality', '10=Very life-quality driven'],
        family: ['0=Family factors matter little', '10=Family factors are critical'],
        identity: ['0=Identity matters little', '10=Identity is critical'],
        risk: ['0=Very risk-averse', '10=Very risk-tolerant'],
        industry: ['0=Not sensitive to industry outlook', '10=Very industry-focused']
      },
      jpHint: {
        growth: ['1=Little growth potential', '10=Very high growth potential'],
        wlb: ['1=Very busy/high stress', '10=Very balanced'],
        visa: ['1=Very unstable', '10=Very stable'],
        network: ['1=Weak network', '10=Strong network'],
        language: ['1=Communication is hard', '10=Very fluent'],
        env: ['1=Poor fit', '10=Excellent fit'],
        options: ['1=Few options', '10=Many options'],
        industry: ['1=Industry is weak', '10=Industry outlook is strong']
      },
      rtHint: {
        growth: ['1=Little growth potential', '10=Very high growth potential'],
        family: ['1=Low family support', '10=Strong family support'],
        stress: ['1=Low stress', '10=High stress'],
        network: ['1=Weak network', '10=Strong network'],
        industry: ['1=Industry is weak', '10=Industry outlook is strong']
      },
      jpSalary: 'Annual Salary (10k JPY)',
      jpCost: 'Annual Cost (10k JPY)',
      jpTenThousand: '10k JPY',
      jpGrowth: 'Growth (1-10)',
      jpWlb: 'Work-life (1-10)',
      jpVisa: 'Visa Stability (1-10)',
      jpNetwork: 'Network (1-10)',
      jpLanguage: 'Language Comfort (1-10)',
      jpEnvFit: 'Environment Fit (1-10)',
      jpOptions: 'Options under current climate (1-10)',
      jpIndustry: 'Industry Outlook (1-10)',
      rtSalary: 'Annual Salary (10k CNY)',
      rtCost: 'Annual Cost (10k CNY)',
      cnTenThousand: '10k CNY',
      rtGrowth: 'Growth (1-10)',
      rtFamily: 'Family Support (1-10)',
      rtStress: 'Market Stress (1-10)',
      rtNetwork: 'Network (1-10)',
      rtIndustry: 'Industry Outlook (1-10)',
      rtLocation: 'Return City Type',
      rtIronBowl: 'Family can secure stable job',
      familyUrgent: 'Family Urgency',
      healthIssue: 'Health Factors',
      savingsMonths: 'Runway (months)',
      savingsHint: 'Available savings ÷ monthly expenses = runway months',
      debt: 'Debt (10k)',
      resetCost: 'Career Reset Cost (1-10)',
      resetCostHint: ['1=Little reset needed', '10=Major reset/transition needed'],
      unlimited: 'Unlimited',
      thirdCountry: 'Consider Third Country',
      riskTolerance: 'Risk Tolerance (1-10)',
      timeline: 'Timeline',
      planStudy: 'Skill Upgrade Plan',
      shortReturn: 'Need Short Return',
      optionsHint: {
        thirdCountry: 'Whether you are considering a third-country route (work/study)',
        riskTolerance: 'Your tolerance for uncertainty and risk',
        riskToleranceHint: ['1=Very conservative', '10=Very aggressive'],
        timeline: 'When you want to make the final decision',
        planStudy: 'Whether you plan to upskill or pivot',
        shortReturn: 'Need a short return to handle affairs'
      }
    },
    options: {
      stage: {
        student: 'Student',
        working: 'Working',
        hunting: 'Job Hunting'
      },
      visa: {
        work: 'Work',
        student: 'Student',
        spouse: 'Spouse',
        permanent: 'Permanent',
        spousePermanent: 'Spouse Permanent',
        highSkilled: 'High-skilled',
        businessManager: 'Business Manager',
        other: 'Other'
      },
      industry: {
        tech: 'Tech',
        manufacturing: 'Manufacturing',
        finance: 'Finance',
        design: 'Design/Media',
        service: 'Service'
      },
      age: {
        a: '22-25',
        b: '26-30',
        c: '31-35',
        d: '36+'
      },
      timeline: {
        a: '0-6 months',
        b: '6-12 months',
        c: '12-24 months'
      },
      location: {
        coastal: 'Coastal City',
        inland: 'Inland City'
      },
      yes: 'Yes',
      no: 'No'
    }
  }
};

const defaultData = {
  profile: {
    stage: 'working',
    yearsJapan: 2,
    visaType: 'work',
    visaMonthsLeft: 18,
    industry: 'tech',
    japaneseLevel: 3,
    ageGroup: '26-30'
  },
  weights: {
    money: 7,
    growth: 8,
    life: 6,
    family: 5,
    identity: 4,
    risk: 5,
    industry: 5
  },
  japan: {
    salary: 320,
    cost: 180,
    growth: 6,
    wlb: 6,
    visaStability: 6,
    network: 5,
    languageComfort: 5,
    environmentFit: 6,
    globalOptions: 6,
    industryOutlook: 6
  },
  return: {
    salary: 38,
    cost: 22,
    growth: 7,
    familySupport: 7,
    marketStress: 6,
    network: 6,
    industryOutlook: 6,
    locationType: 'coastal',
    familyHelpIronBowl: false
  },
  constraints: {
    familyUrgent: false,
    healthIssue: false,
    savingsMonths: 6,
    debt: 0,
    careerResetCost: 4
  },
  options: {
    considerThirdCountry: false,
    riskTolerance: 5,
    timeline: '6-12',
    planStudy: false
  }
};

export default function Home() {
  const [lang, setLang] = useState('zh');
  const [data, setData] = useState(defaultData);
  const [activeStep, setActiveStep] = useState(0);
  const panelRef = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fxRate, setFxRate] = useState(0.05);
  const [fxStatus, setFxStatus] = useState('loading');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    let active = true;
    const fetchRate = async () => {
      setFxStatus('loading');
      try {
        const res = await fetch(`${API_BASE}/api/fx`);
        if (!res.ok) throw new Error('fx');
        const data = await res.json();
        const rate = data?.rate;
        if (active && rate) {
          setFxRate(rate);
          setFxStatus('ok');
        } else if (active) {
          setFxStatus('fail');
        }
      } catch (err) {
        if (active) setFxStatus('fail');
      }
    };
    fetchRate();
    return () => {
      active = false;
    };
  }, []);

  const t = translations[lang];

  const visaUnlimitedTypes = ['permanent', 'spouse-permanent'];
  const visaUnlimited = visaUnlimitedTypes.includes(data.profile.visaType);
  const includeDetour = data.constraints.familyUrgent || (!visaUnlimited && data.profile.visaMonthsLeft < 12);

  const steps = useMemo(() => {
    const list = ['intro', 'profile', 'weights', 'japan', 'ret', 'constraints'];
    if (includeDetour) list.push('detour');
    list.push('options', 'summary');
    return list;
  }, [includeDetour]);

  const stepKey = steps[activeStep];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth > 800) return;
    if (stepKey !== 'summary') return;
    if (!panelRef.current) return;
    panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeStep, stepKey]);

  const update = (section, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value }
    }));
  };

  const weightTotal = Object.values(data.weights).reduce((sum, v) => sum + Number(v || 0), 0);

  const normalizedWeights = useMemo(() => {
    const total = weightTotal || 1;
    const w = data.weights;
    return {
      money: w.money / total,
      growth: w.growth / total,
      life: w.life / total,
      family: w.family / total,
      identity: w.identity / total,
      risk: w.risk / total,
      industry: w.industry / total
    };
  }, [weightTotal, data.weights]);

  const quickScore = useMemo(() => {
    const w = normalizedWeights;
    const jp = data.japan;
    const rt = data.return;
    const c = data.constraints;

    const jpScore =
      w.money * (jp.salary - jp.cost) / 100 +
      w.growth * jp.growth +
      w.life * jp.wlb +
      w.family * (10 - (c.familyUrgent ? 6 : 2)) +
      w.identity * (jp.languageComfort + jp.environmentFit) / 2 +
      w.risk * jp.visaStability +
      w.industry * jp.industryOutlook +
      0.3 * jp.globalOptions;

    const rtScore =
      w.money * (rt.salary - rt.cost) / 100 +
      w.growth * rt.growth +
      w.life * (10 - rt.marketStress) +
      w.family * rt.familySupport +
      w.identity * 6 +
      w.risk * (10 - c.careerResetCost) +
      w.industry * rt.industryOutlook +
      (rt.locationType === 'coastal' ? 1.2 : 0.2) +
      (rt.familyHelpIronBowl ? 5 : 0);

    const diff = jpScore - rtScore;

    return {
      jpScore: Math.round(jpScore * 10) / 10,
      rtScore: Math.round(rtScore * 10) / 10,
      diff: Math.round(diff * 10) / 10
    };
  }, [data, normalizedWeights]);

  const scoreChart = useMemo(() => {
    if (!result?.scores) return null;
    const values = [
      { key: 'japan', value: result.scores.japan },
      { key: 'return', value: result.scores.return },
      { key: 'third', value: result.scores.third }
    ];
    const min = Math.min(...values.map((v) => v.value));
    const adjusted = values.map((v) => ({ ...v, adj: v.value - min + 1 }));
    const total = adjusted.reduce((sum, v) => sum + v.adj, 0) || 1;
    return adjusted.map((v) => ({
      ...v,
      percent: Math.round((v.adj / total) * 100)
    }));
  }, [result]);

  const driverChart = useMemo(() => {
    if (!result?.scores || !result?.breakdown) return null;
    const sortedScores = Object.entries(result.scores).sort((a, b) => b[1] - a[1]);
    const topKey = sortedScores[0]?.[0] || 'japan';
    const breakdown = result.breakdown[topKey] || {};
    const items = Object.entries(breakdown)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 6);
    const maxAbs = Math.max(...items.map((item) => Math.abs(item.value)), 1);
    return {
      topKey,
      maxAbs,
      items
    };
  }, [result]);

  const canNext = () => activeStep < steps.length - 1;
  const canPrev = () => activeStep > 0;

  const goNext = () => {
    if (canNext()) setActiveStep((s) => s + 1);
  };

  const goPrev = () => {
    if (canPrev()) setActiveStep((s) => s - 1);
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lang
        })
      });
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const payload = await res.json();
      setResult(payload);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <div>
          <div className="top-row">
            <p className="badge">{t.badge}</p>
            <div className="lang-switch">
              {Object.entries(translations).map(([key, value]) => (
                <button
                  key={key}
                  className={lang === key ? 'lang active' : 'lang'}
                  onClick={() => setLang(key)}
                >
                  {value.langName}
                </button>
              ))}
            </div>
          </div>
          <h1>{t.title}</h1>
          <p className="sub">{t.subtitle}</p>
        </div>
        <div className="hero-card">
          <div className="hero-title">{t.preview}</div>
          <div className="score-grid">
            <div>
              <div className="score-label">{t.jpPlan}</div>
              <div className="score-value">{quickScore.jpScore}</div>
            </div>
            <div>
              <div className="score-label">{t.cnPlan}</div>
              <div className="score-value">{quickScore.rtScore}</div>
            </div>
            <div>
              <div className="score-label">{t.diff}</div>
              <div className={quickScore.diff >= 0 ? 'score-diff positive' : 'score-diff negative'}>
                {quickScore.diff >= 0 ? '+' : ''}{quickScore.diff}
              </div>
            </div>
          </div>
          <div className="mini-note">{t.quickNote}</div>
        </div>
      </header>

      <section className="workflow">
        <aside className="stepper">
          <div className="stepper-title">{t.workflow}</div>
          {steps.map((key, idx) => (
            <button
              key={key}
              className={`step ${idx === activeStep ? 'active' : ''}`}
              onClick={() => setActiveStep(idx)}
            >
              <span className="step-index">{idx + 1}</span>
              <span>{t.steps[key]}</span>
            </button>
          ))}
          <div className="progress">
            <div className="progress-bar" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
          </div>
        </aside>

        <div className="panel" ref={panelRef}>
          <div className="mobile-stepper">
            <div className="mobile-stepper-head">
              <span className="mobile-stepper-title">{t.workflow}</span>
              <span className="mobile-stepper-current">
                {activeStep + 1}/{steps.length} · {t.steps[stepKey]}
              </span>
            </div>
            <div className="mobile-stepper-dots">
              {steps.map((key, idx) => (
                <button
                  key={key}
                  className={`mobile-dot ${idx === activeStep ? 'active' : ''}`}
                  onClick={() => setActiveStep(idx)}
                  aria-label={`${t.workflow} ${idx + 1}`}
                />
              ))}
            </div>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          {stepKey === 'intro' && (
            <div className="card">
              <h2>{t.steps.intro}</h2>
              <p>{t.labels.weightIntro}</p>
              <div className="grid-2">
                <div className="input-block">
                  <label>{t.labels.stage}</label>
                  <select value={data.profile.stage} onChange={(e) => update('profile', 'stage', e.target.value)}>
                    <option value="student">{t.options.stage.student}</option>
                    <option value="working">{t.options.stage.working}</option>
                    <option value="job-hunting">{t.options.stage.hunting}</option>
                  </select>
                </div>
                <div className="input-block">
                  <label>{t.labels.target}</label>
                  <select value={data.options.timeline} onChange={(e) => update('options', 'timeline', e.target.value)}>
                    <option value="0-6">{t.options.timeline.a}</option>
                    <option value="6-12">{t.options.timeline.b}</option>
                    <option value="12-24">{t.options.timeline.c}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {stepKey === 'profile' && (
            <div className="card">
              <h2>{t.steps.profile}</h2>
              <div className="grid-3">
                <div className="input-block">
                  <label>{t.labels.yearsJapan}</label>
                  <input type="number" min="0" max="15" value={data.profile.yearsJapan} onChange={(e) => update('profile', 'yearsJapan', Number(e.target.value))} />
                </div>
                <div className="input-block">
                  <label>{t.labels.visaType}</label>
                  <select value={data.profile.visaType} onChange={(e) => update('profile', 'visaType', e.target.value)}>
                    <option value="work">{t.options.visa.work}</option>
                    <option value="student">{t.options.visa.student}</option>
                    <option value="spouse">{t.options.visa.spouse}</option>
                    <option value="permanent">{t.options.visa.permanent}</option>
                    <option value="spouse-permanent">{t.options.visa.spousePermanent}</option>
                    <option value="high-skilled">{t.options.visa.highSkilled}</option>
                    <option value="business-manager">{t.options.visa.businessManager}</option>
                    <option value="other">{t.options.visa.other}</option>
                  </select>
                </div>
                <div className="input-block">
                  <label>{t.labels.visaMonthsLeft}</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={visaUnlimited ? 0 : data.profile.visaMonthsLeft}
                    disabled={visaUnlimited}
                    onChange={(e) => update('profile', 'visaMonthsLeft', Number(e.target.value))}
                  />
                  {visaUnlimited && <div className="range-value">{t.labels.unlimited}</div>}
                </div>
              </div>
              <div className="grid-3">
                <div className="input-block">
                  <label>{t.labels.industry}</label>
                  <select value={data.profile.industry} onChange={(e) => update('profile', 'industry', e.target.value)}>
                    <option value="tech">{t.options.industry.tech}</option>
                    <option value="manufacturing">{t.options.industry.manufacturing}</option>
                    <option value="finance">{t.options.industry.finance}</option>
                    <option value="design">{t.options.industry.design}</option>
                    <option value="service">{t.options.industry.service}</option>
                  </select>
                </div>
                <div className="input-block">
                  <label className="label-with-help">
                    {t.labels.japaneseLevel}
                    <span className="help" aria-label={t.labels.japaneseHelp}>
                      ?
                      <span className="tooltip">{t.labels.japaneseHelp}</span>
                    </span>
                  </label>
                  <input type="range" min="1" max="10" value={data.profile.japaneseLevel} onChange={(e) => update('profile', 'japaneseLevel', Number(e.target.value))} />
                  <div className="range-value">{data.profile.japaneseLevel}</div>
                </div>
                <div className="input-block">
                  <label>{t.labels.ageGroup}</label>
                  <select value={data.profile.ageGroup} onChange={(e) => update('profile', 'ageGroup', e.target.value)}>
                    <option value="22-25">{t.options.age.a}</option>
                    <option value="26-30">{t.options.age.b}</option>
                    <option value="31-35">{t.options.age.c}</option>
                    <option value="36+">{t.options.age.d}</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {stepKey === 'weights' && (
            <div className="card">
              <h2>{t.steps.weights}</h2>
              <p>{t.weightIntro}</p>
              <div className="grid-2">
                <WeightItem label={t.labels.weightMoney} help={t.labels.weightHelp.money} hint={t.labels.weightHint.money} value={data.weights.money} onChange={(v) => update('weights', 'money', v)} />
                <WeightItem label={t.labels.weightGrowth} help={t.labels.weightHelp.growth} hint={t.labels.weightHint.growth} value={data.weights.growth} onChange={(v) => update('weights', 'growth', v)} />
                <WeightItem label={t.labels.weightLife} help={t.labels.weightHelp.life} hint={t.labels.weightHint.life} value={data.weights.life} onChange={(v) => update('weights', 'life', v)} />
                <WeightItem label={t.labels.weightFamily} help={t.labels.weightHelp.family} hint={t.labels.weightHint.family} value={data.weights.family} onChange={(v) => update('weights', 'family', v)} />
                <WeightItem label={t.labels.weightIdentity} help={t.labels.weightHelp.identity} hint={t.labels.weightHint.identity} value={data.weights.identity} onChange={(v) => update('weights', 'identity', v)} />
                <WeightItem label={t.labels.weightRisk} help={t.labels.weightHelp.risk} hint={t.labels.weightHint.risk} value={data.weights.risk} onChange={(v) => update('weights', 'risk', v)} />
                <WeightItem label={t.labels.weightIndustry} help={t.labels.weightHelp.industry} hint={t.labels.weightHint.industry} value={data.weights.industry} onChange={(v) => update('weights', 'industry', v)} />
              </div>
              <div className="note">{t.weightsTotal}：{weightTotal}</div>
            </div>
          )}

          {stepKey === 'japan' && (
            <div className="card">
              <h2>{t.steps.japan}</h2>
              <p className="note">{t.japanDesc}</p>
              <div className="fx-row">
                <span className="fx-label">{t.fxRate}</span>
                <span className="fx-value">
                  {fxStatus === 'loading' && t.fxLoading}
                  {fxStatus === 'fail' && t.fxFail}
                  {fxStatus === 'ok' && t.fxNote.replace('{value}', fxRate.toFixed(4))}
                </span>
              </div>
              <div className="grid-3">
                <InputNumber label={t.labels.jpSalary} value={data.japan.salary} max={3000} step={1} onChange={(v) => update('japan', 'salary', v)} hint={`${formatNum(data.japan.salary * fxRate)} ${t.labels.cnTenThousand}`} />
                <InputNumber label={t.labels.jpCost} value={data.japan.cost} max={2000} step={1} onChange={(v) => update('japan', 'cost', v)} hint={`${formatNum(data.japan.cost * fxRate)} ${t.labels.cnTenThousand}`} />
                <RangeInput label={t.labels.jpGrowth} hint={t.labels.jpHint.growth} value={data.japan.growth} onChange={(v) => update('japan', 'growth', v)} />
              </div>
              <div className="grid-3">
                <RangeInput label={t.labels.jpWlb} hint={t.labels.jpHint.wlb} value={data.japan.wlb} onChange={(v) => update('japan', 'wlb', v)} />
                <RangeInput label={t.labels.jpVisa} hint={t.labels.jpHint.visa} value={data.japan.visaStability} onChange={(v) => update('japan', 'visaStability', v)} />
                <RangeInput label={t.labels.jpNetwork} hint={t.labels.jpHint.network} value={data.japan.network} onChange={(v) => update('japan', 'network', v)} />
              </div>
              <div className="grid-3">
                <RangeInput label={t.labels.jpLanguage} help={t.labels.languageHelp} hint={t.labels.jpHint.language} value={data.japan.languageComfort} onChange={(v) => update('japan', 'languageComfort', v)} />
                <RangeInput label={t.labels.jpEnvFit} hint={t.labels.jpHint.env} value={data.japan.environmentFit} onChange={(v) => update('japan', 'environmentFit', v)} />
                <RangeInput label={t.labels.jpOptions} hint={t.labels.jpHint.options} value={data.japan.globalOptions} onChange={(v) => update('japan', 'globalOptions', v)} />
              </div>
              <div className="grid-2">
                <RangeInput label={t.labels.jpIndustry} hint={t.labels.jpHint.industry} value={data.japan.industryOutlook} onChange={(v) => update('japan', 'industryOutlook', v)} />
                <SelectYesNo label={t.labels.planStudy} value={data.options.planStudy} onChange={(v) => update('options', 'planStudy', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
              </div>
            </div>
          )}

          {stepKey === 'ret' && (
            <div className="card">
              <h2>{t.steps.ret}</h2>
              <p className="note">{t.returnDesc}</p>
              <div className="fx-row">
                <span className="fx-label">{t.fxRate}</span>
                <span className="fx-value">
                  {fxStatus === 'loading' && t.fxLoading}
                  {fxStatus === 'fail' && t.fxFail}
                  {fxStatus === 'ok' && t.fxNote.replace('{value}', fxRate.toFixed(4))}
                </span>
              </div>
              <div className="grid-3">
                <InputNumber label={t.labels.rtSalary} value={data.return.salary} onChange={(v) => update('return', 'salary', v)} hint={`${formatNum(data.return.salary / fxRate)} ${t.labels.jpTenThousand}`} />
                <InputNumber label={t.labels.rtCost} value={data.return.cost} onChange={(v) => update('return', 'cost', v)} hint={`${formatNum(data.return.cost / fxRate)} ${t.labels.jpTenThousand}`} />
                <RangeInput label={t.labels.rtGrowth} hint={t.labels.rtHint.growth} value={data.return.growth} onChange={(v) => update('return', 'growth', v)} />
              </div>
              <div className="grid-3">
                <RangeInput label={t.labels.rtFamily} hint={t.labels.rtHint.family} value={data.return.familySupport} onChange={(v) => update('return', 'familySupport', v)} />
                <RangeInput label={t.labels.rtStress} hint={t.labels.rtHint.stress} value={data.return.marketStress} onChange={(v) => update('return', 'marketStress', v)} />
                <RangeInput label={t.labels.rtNetwork} hint={t.labels.rtHint.network} value={data.return.network} onChange={(v) => update('return', 'network', v)} />
              </div>
              <div className="grid-3">
                <RangeInput label={t.labels.rtIndustry} hint={t.labels.rtHint.industry} value={data.return.industryOutlook} onChange={(v) => update('return', 'industryOutlook', v)} />
                <div className="input-block">
                  <label>{t.labels.rtLocation}</label>
                  <select value={data.return.locationType} onChange={(e) => update('return', 'locationType', e.target.value)}>
                    <option value="coastal">{t.options.location.coastal}</option>
                    <option value="inland">{t.options.location.inland}</option>
                  </select>
                </div>
                <SelectYesNo label={t.labels.rtIronBowl} value={data.return.familyHelpIronBowl} onChange={(v) => update('return', 'familyHelpIronBowl', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
              </div>
            </div>
          )}

          {stepKey === 'constraints' && (
            <div className="card">
              <h2>{t.steps.constraints}</h2>
              <div className="grid-3">
                <SelectYesNo label={t.labels.familyUrgent} value={data.constraints.familyUrgent} onChange={(v) => update('constraints', 'familyUrgent', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                <SelectYesNo label={t.labels.healthIssue} value={data.constraints.healthIssue} onChange={(v) => update('constraints', 'healthIssue', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                <InputNumber label={t.labels.savingsMonths} hint={t.labels.savingsHint} value={data.constraints.savingsMonths} onChange={(v) => update('constraints', 'savingsMonths', v)} />
              </div>
              <div className="grid-2">
                <InputNumber label={t.labels.debt} value={data.constraints.debt} onChange={(v) => update('constraints', 'debt', v)} />
                <RangeInput label={t.labels.resetCost} hint={t.labels.resetCostHint} value={data.constraints.careerResetCost} onChange={(v) => update('constraints', 'careerResetCost', v)} />
              </div>
            </div>
          )}

          {stepKey === 'detour' && (
            <div className="card">
              <h2>{t.steps.detour}</h2>
              <p>{t.quickNote}</p>
              <div className="grid-2">
                <SelectYesNo label={t.labels.thirdCountry} value={data.options.considerThirdCountry} onChange={(v) => update('options', 'considerThirdCountry', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                <RangeInput label={t.labels.riskTolerance} value={data.options.riskTolerance} onChange={(v) => update('options', 'riskTolerance', v)} />
              </div>
            </div>
          )}

          {stepKey === 'options' && (
            <div className="card">
              <h2>{t.steps.options}</h2>
              <div className="grid-3">
                <div className="input-block">
                  <SelectYesNo label={t.labels.thirdCountry} value={data.options.considerThirdCountry} onChange={(v) => update('options', 'considerThirdCountry', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                  <div className="field-note">{t.labels.optionsHint.thirdCountry}</div>
                </div>
                <RangeInput label={t.labels.riskTolerance} hint={t.labels.optionsHint.riskToleranceHint} value={data.options.riskTolerance} onChange={(v) => update('options', 'riskTolerance', v)} />
                <div className="input-block">
                  <label>{t.labels.timeline}</label>
                  <select value={data.options.timeline} onChange={(e) => update('options', 'timeline', e.target.value)}>
                    <option value="0-6">{t.options.timeline.a}</option>
                    <option value="6-12">{t.options.timeline.b}</option>
                    <option value="12-24">{t.options.timeline.c}</option>
                  </select>
                  <div className="field-note">{t.labels.optionsHint.timeline}</div>
                </div>
              </div>
              <div className="grid-2">
                <div className="input-block">
                  <SelectYesNo label={t.labels.planStudy} value={data.options.planStudy} onChange={(v) => update('options', 'planStudy', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                  <div className="field-note">{t.labels.optionsHint.planStudy}</div>
                </div>
                <div className="input-block">
                  <SelectYesNo label={t.labels.shortReturn} value={data.constraints.familyUrgent} onChange={(v) => update('constraints', 'familyUrgent', v)} yesLabel={t.options.yes} noLabel={t.options.no} />
                  <div className="field-note">{t.labels.optionsHint.shortReturn}</div>
                </div>
              </div>
            </div>
          )}

          {stepKey === 'summary' && (
            <div className="card">
              <h2>{t.steps.summary}</h2>
              <div className="summary-grid">
                <div>
                  <div className="summary-title">{t.weightsTotal}</div>
                  <SummaryList weights={normalizedWeights} t={t} />
                </div>
                <div>
                  <div className="summary-title">{t.preview}</div>
                  <p>
                    {quickScore.diff >= 0
                      ? `${t.jpPlan} ${t.recommendation} ${t.preview}`
                      : `${t.cnPlan} ${t.recommendation} ${t.preview}`}
                  </p>
                  <p>{t.quickNote}</p>
                </div>
              </div>

              <div className="actions">
                <button className="primary" onClick={submit} disabled={loading}>
                  {loading ? t.generating : t.generate}
                </button>
                {error && <div className="error">{error}</div>}
              </div>

              <div className="visuals">
                <h3>{t.compareTitle}</h3>
                <ScoreBars scores={result?.scores} quick={quickScore} t={t} />
              </div>

              {result && (
                <div className="result">
                  <h3>{t.recommendation}：{result.recommendation.title}</h3>
                  <p>{result.recommendation.summary}</p>
                  {scoreChart && driverChart && (
                    <div className="analysis">
                      <div className="summary-title">{t.analysisTitle}</div>
                      <div className="analysis-grid">
                        <div className="analysis-card">
                          <div className="analysis-title">{t.analysisTendency}</div>
                          <div
                            className="ring"
                            style={{
                              '--p1': String(scoreChart[0].percent),
                              '--p2': String(scoreChart[1].percent),
                              '--p3': String(scoreChart[2].percent)
                            }}
                          />
                          <div className="analysis-legend">
                            <span className="legend-dot japan" />
                            <span>{t.analysisLegend.japan}: {result.scores.japan.toFixed(1)}</span>
                            <span className="legend-dot return" />
                            <span>{t.analysisLegend.return}: {result.scores.return.toFixed(1)}</span>
                            <span className="legend-dot third" />
                            <span>{t.analysisLegend.third}: {result.scores.third.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="analysis-card">
                          <div className="analysis-title">{t.analysisDrivers}</div>
                          <div className="analysis-note">{t.analysisDriversNote}</div>
                          <div className="driver-list">
                            {driverChart.items.map((item) => (
                              <div key={item.key} className="driver-row">
                                <span className="driver-label">{getAnalysisLabel(item.key, t)}</span>
                                <div className="driver-track">
                                  <div
                                    className={`driver-fill ${item.value >= 0 ? 'positive' : 'negative'}`}
                                    style={{ width: `${(Math.abs(item.value) / driverChart.maxAbs) * 100}%` }}
                                  />
                                </div>
                                <span className="driver-value">{item.value.toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="analysis-card">
                          <div className="analysis-title">{t.analysisWeights}</div>
                          <div className="driver-list">
                            {getTopWeights(normalizedWeights, t).map((item) => (
                              <div key={item.label} className="driver-row">
                                <span className="driver-label">{item.label}</span>
                                <div className="driver-track">
                                  <div
                                    className="driver-fill neutral"
                                    style={{ width: `${item.value * 100}%` }}
                                  />
                                </div>
                                <span className="driver-value">{Math.round(item.value * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="result-grid">
                    <div>
                      <div className="summary-title">{t.actions}</div>
                      <ul>
                        {result.recommendation.actions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="summary-title">{t.reasons}</div>
                      <ul>
                        {result.recommendation.reasons.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="summary-title">{t.risks}</div>
                      <ul>
                        {result.recommendation.risks.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {result.recommendation.path && (
                    <div className="path">
                      <div className="summary-title">{t.pathTitle}</div>
                      <div className="path-grid">
                        {result.recommendation.path.map((item, idx) => (
                          <div key={item} className="path-node">
                            <span className="path-index">{idx + 1}</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.breakdown && (
                    <div className="breakdown">
                      <div className="summary-title">{t.breakdownTitle}</div>
                      <div className="note">{t.breakdownNote}</div>
                      <BreakdownRadar breakdown={result.breakdown} t={t} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="nav">
            <button className="ghost" onClick={goPrev} disabled={!canPrev()}>
              {t.prev}
            </button>
            <button className="ghost" onClick={goNext} disabled={!canNext()}>
              {t.next}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function WeightItem({ label, help, hint, value, onChange }) {
  return (
    <div className="input-block">
      <label className="label-with-help">
        {label}
        {help && (
          <span className="help" aria-label={help}>
            ?
            <span className="tooltip">{help}</span>
          </span>
        )}
      </label>
      <div className="range-hint">
        <span>{hint?.[0] || '0'}</span>
        <span>{hint?.[1] || '10'}</span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="range-value">{value}</div>
    </div>
  );
}

function RangeInput({ label, help, hint, value, onChange }) {
  return (
    <div className="input-block">
      <label className="label-with-help">
        {label}
        {help && (
          <span className="help" aria-label={help}>
            ?
            <span className="tooltip">{help}</span>
          </span>
        )}
      </label>
      {hint && (
        <div className="range-hint">
          <span>{hint[0]}</span>
          <span>{hint[1]}</span>
        </div>
      )}
      <input type="range" min="1" max="10" value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="range-value">{value}</div>
    </div>
  );
}

function InputNumber({ label, value, onChange, max = 200, step = 1, hint }) {
  return (
    <div className="input-block">
      <label>{label}</label>
      <input
        type="number"
        min="0"
        max={max}
        step={step}
        value={value}
        onFocus={(e) => e.target.select()}
        onMouseUp={(e) => e.preventDefault()}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <div className="range-value">{hint}</div>}
    </div>
  );
}

function formatNum(value) {
  if (!Number.isFinite(value)) return '-';
  return Number(value).toFixed(2);
}

function SelectYesNo({ label, value, onChange, yesLabel, noLabel }) {
  return (
    <div className="input-block">
      <label>{label}</label>
      <select value={value ? 'yes' : 'no'} onChange={(e) => onChange(e.target.value === 'yes')}>
        <option value="no">{noLabel}</option>
        <option value="yes">{yesLabel}</option>
      </select>
    </div>
  );
}

function SummaryList({ weights, t }) {
  const entries = [
    [t.labels.weightMoney, weights.money],
    [t.labels.weightGrowth, weights.growth],
    [t.labels.weightLife, weights.life],
    [t.labels.weightFamily, weights.family],
    [t.labels.weightIdentity, weights.identity],
    [t.labels.weightRisk, weights.risk],
    [t.labels.weightIndustry, weights.industry]
  ];
  return (
    <div className="summary-list">
      {entries.map(([label, value]) => (
        <div key={label} className="summary-item">
          <span>{label}</span>
          <span>{(value * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

function getTopWeights(weights, t) {
  const items = [
    { label: t.labels.weightMoney, value: weights.money },
    { label: t.labels.weightGrowth, value: weights.growth },
    { label: t.labels.weightLife, value: weights.life },
    { label: t.labels.weightFamily, value: weights.family },
    { label: t.labels.weightIdentity, value: weights.identity },
    { label: t.labels.weightRisk, value: weights.risk },
    { label: t.labels.weightIndustry, value: weights.industry }
  ];
  return items.sort((a, b) => b.value - a.value).slice(0, 5);
}

function getAnalysisLabel(key, t) {
  return t.analysisLabels?.[key] || key;
}

function ScoreBars({ scores, quick, t }) {
  const jp = scores?.japan ?? quick.jpScore;
  const rt = scores?.return ?? quick.rtScore;
  const third = scores?.third ?? Math.round((jp + rt) / 2 * 10) / 10;
  const max = Math.max(jp, rt, third, 1);
  const toWidth = (val) => `${Math.round((val / max) * 100)}%`;

  return (
    <div className="bars">
      <Bar label={t.jpPlan} value={jp} width={toWidth(jp)} tone="jp" />
      <Bar label={t.cnPlan} value={rt} width={toWidth(rt)} tone="rt" />
      <Bar label={t.thirdPlan} value={third} width={toWidth(third)} tone="third" />
    </div>
  );
}

function Bar({ label, value, width, tone }) {
  return (
    <div className="bar-row">
      <div className="bar-label">{label}</div>
      <div className="bar-track">
        <div className={`bar-fill ${tone}`} style={{ width }} />
      </div>
      <div className="bar-value">{value}</div>
    </div>
  );
}

function BreakdownRadar({ breakdown, t }) {
  const jp = breakdown.japan || {};
  const rt = breakdown.return || {};
  const third = breakdown.third || {};
  const keys = Array.from(
    new Set([...Object.keys(jp), ...Object.keys(rt), ...Object.keys(third)])
  );
  const ranked = keys
    .map((key) => ({
      key,
      score: Math.max(Math.abs(jp[key] ?? 0), Math.abs(rt[key] ?? 0), Math.abs(third[key] ?? 0))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 7)
    .map((item) => item.key);
  const axes = ranked.length >= 3 ? ranked : keys;
  const size = 320;
  const center = size / 2;
  const radius = 120;
  const levels = 4;

  const maxByKey = axes.reduce((acc, key) => {
    acc[key] = Math.max(
      1,
      Math.abs(jp[key] ?? 0),
      Math.abs(rt[key] ?? 0),
      Math.abs(third[key] ?? 0)
    );
    return acc;
  }, {});

  const buildPoints = (series) =>
    axes
      .map((key, idx) => {
        const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
        const value = Math.abs(series[key] ?? 0);
        const r = (value / maxByKey[key]) * radius;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(' ');

  const labelPositions = axes.map((key, idx) => {
    const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
    const x = center + (radius + 24) * Math.cos(angle);
    const y = center + (radius + 24) * Math.sin(angle);
    return { key, x, y };
  });

  return (
    <div className="radar-wrap">
      <div className="radar-legend">
        <span className="legend-dot japan" />
        <span>{t.analysisLegend.japan}</span>
        <span className="legend-dot return" />
        <span>{t.analysisLegend.return}</span>
        <span className="legend-dot third" />
        <span>{t.analysisLegend.third}</span>
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} className="radar">
        {[...Array(levels)].map((_, i) => {
          const r = ((i + 1) / levels) * radius;
          const points = axes
            .map((_, idx) => {
              const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
              const x = center + r * Math.cos(angle);
              const y = center + r * Math.sin(angle);
              return `${x},${y}`;
            })
            .join(' ');
          return <polygon key={r} points={points} className="radar-grid" />;
        })}
        {axes.map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / axes.length - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          return <line key={idx} x1={center} y1={center} x2={x} y2={y} className="radar-axis" />;
        })}
        <polygon points={buildPoints(jp)} className="radar-shape japan" />
        <polygon points={buildPoints(rt)} className="radar-shape return" />
        <polygon points={buildPoints(third)} className="radar-shape third" />
        {labelPositions.map((label) => (
          <text key={label.key} x={label.x} y={label.y} className="radar-label">
            {getAnalysisLabel(label.key, t)}
          </text>
        ))}
      </svg>
    </div>
  );
}
