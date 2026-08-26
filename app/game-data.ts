export type Difficulty = "elementary" | "middle" | "high";
export type ScenarioId = "kitchen" | "restaurant" | "camping" | "laboratory" | "boiler";
export type ScenarioChoice = ScenarioId | "random";
export type Screen = "title" | "briefing" | "game" | "story" | "result" | "review";
export type StationId = "valve" | "vent" | "report";
export type LoreId = "flame" | "camp" | "butane" | "soapcheck" | "reignite";
export type InteractableId = StationId | LoreId;

export type Enemy = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  kind: "wisp" | "crawler" | "boss";
  phase: number;
  hitWait: number;
  spawnX: number;
  spawnY: number;
  respawnWait: number;
  respawnable: boolean;
};

export type RunState = {
  difficulty: Difficulty;
  player: { x:number; y:number; hp:number; maxHp:number; facingX:number; facingY:number; moving:boolean };
  enemies: Enemy[];
  completed: Set<StationId>;
  knowledge: Set<LoreId>;
  caches: Set<string>;
  rescued: Set<string>;
  score: number;
  seconds: number;
  pulseWait: number;
  pulseAge: number;
  medkits: number;
  defeated: number;
  bossSpawned: boolean;
  finished: boolean;
  hitFlash: number;
  trapWait: number;
  bossPhase2: boolean;
  respawned: number;
  scenarioId: ScenarioId;
  detectedLeak: boolean;
  gasLevel: number;
  pulseCount: number;
  wrongChoices: number;
  sparkHits: number;
  gasExposure: number;
  sparkBurst: number;
  lastMistake: string;
  guidePath: {x:number;y:number}[];
  guideAge: number;
  alertWait: number;
  droneWait: number;
  droneAge: number;
  shieldWait: number;
  shieldAge: number;
  ventWait: number;
  ventAge: number;
  eventTriggered: boolean;
  eventTimer: number;
  eventType: "none"|"sensor"|"block"|"shift"|"spark"|"rift";
  eventLabel: string;
  coopActions: number;
  overheat: number;
  bossPatternWait: number;
  rescueMarkerAge: number;
  eventCount: number;
  nextEventAt: number;
  evidence: Set<string>;
  safeChain: number;
  maxSafeChain: number;
  bossBreak: number;
  crisisActive: boolean;
  crisisTimer: number;
  crisisSuccess: boolean;
  crisisHandled: boolean;
  actionLog: ActionLog[];
  shake: number;
  particles: Particle[];
};

export type Particle = { x:number; y:number; vx:number; vy:number; life:number; maxLife:number; color:string; size:number };

export type Hud = {
  hp:number; maxHp:number; score:number; seconds:number; seals:number; medkits:number;
  defeated:number; objective:string; pulseReady:number; bossHp:number; bossMax:number;
  knowledge:number; rescued:number; sensorLevel:number;
  respawned:number; living:number;
  gasLevel:number; detectedLeak:boolean; bossShielded:boolean; nearbyLabel:string; canInteract:boolean;
  guideAge:number; droneReady:number; droneActive:boolean; shieldReady:number; shieldActive:boolean;
  ventReady:number; ventActive:boolean; eventLabel:string; eventTimer:number; coopActions:number;
  evidence:number; evidenceNeeded:number; safeChain:number; maxSafeChain:number; bossBreak:number;
  crisisActive:boolean; crisisTimer:number;
};

export type ResultData = {
  victory:boolean; score:number; timeUsed:number; hp:number; seals:number; defeated:number; knowledge:number; rescued:number;
  scenarioId:ScenarioId; difficulty:Difficulty; safetyJudgment:number; goldenTime:number; rescueScore:number; knowledgeScore:number;
  safetyIndex:number; wrongChoices:number; sparkHits:number; gasExposure:number; pulseCount:number; lastMistake:string;
  coopActions:number; createdAt?:string;
  timeline?:ActionLog[]; maxCombo?:number; evidenceCount?:number; crisisSuccess?:boolean; crisisHandled?:boolean;
};

export type RewindInfo = { choice:string; cause:string; result:string; hazard:"spark"|"exposure"|"heat" };
export type DashboardReport = ResultData & { id?:number; createdAt?:string };
export type ProgressProfile = { xp:number; streak:number; missions:number; bestIndex:number; badges:string[]; sensorLevel:number; suitTier:number };

export type QuestionChoice = { id:string; label:string; feedback:string; correct:boolean; slot:number; hazard?:"spark"|"exposure"|"heat" };
export type Question = { id:InteractableId; title:string; prompt:string; correctNote:string; choices:QuestionChoice[]; cue?:string };
export type ActionLog = { icon:string; label:string; detail:string; outcome:"safe"|"danger"|"clue"; at:number };
export type DeductionChoice = { id:string; label:string; correct:boolean; feedback:string };
export type CrisisChoice = { id:string; label:string; correct:boolean; feedback:string; hazard:"spark"|"exposure"|"heat" };

export const DIFFICULTIES = {
  elementary: { label:"초등학생", short:"초등", icon:"🌱", tag:"안전 탐험", threat:"EASY", pips:1, time:180, hp:130, enemies:5, enemyHp:34, enemySpeed:35, damage:42, touchDamage:5, options:2, wrongDamage:4, bossHp:145, cooldown:.45, respawn:10, medkits:3, playerSpeed:202, pulseRange:158, gasGrowth:.016, trapTempo:1.18, trapWindow:.58, trapRadius:42, aggro:205, events:1, eventStart:55, eventGap:45, bossCadence:7.2, bossSummons:1, pathSeconds:999, evidenceNeeded:1 },
  middle: { label:"중학생", short:"중등", icon:"🛡️", tag:"현장 실전", threat:"NORMAL", pips:2, time:165, hp:105, enemies:8, enemyHp:50, enemySpeed:51, damage:29, touchDamage:9, options:3, wrongDamage:10, bossHp:250, cooldown:.64, respawn:5.5, medkits:2, playerSpeed:186, pulseRange:137, gasGrowth:.027, trapTempo:1.7, trapWindow:.82, trapRadius:47, aggro:260, events:2, eventStart:38, eventGap:43, bossCadence:5.3, bossSummons:2, pathSeconds:3, evidenceNeeded:2 },
  high: { label:"고등학생", short:"고등", icon:"⚡", tag:"재난 지휘", threat:"HARD", pips:3, time:145, hp:86, enemies:12, enemyHp:67, enemySpeed:67, damage:24, touchDamage:14, options:4, wrongDamage:18, bossHp:390, cooldown:.84, respawn:3.6, medkits:1, playerSpeed:172, pulseRange:116, gasGrowth:.044, trapTempo:2.15, trapWindow:1.08, trapRadius:54, aggro:335, events:3, eventStart:24, eventGap:31, bossCadence:3.7, bossSummons:3, pathSeconds:1.5, evidenceNeeded:3 },
} as const;

export const SCENARIOS:Record<ScenarioId,{title:string;place:string;gas:string;icon:string;clue:string;sensor:string;color:string;leak:{x:number;y:number};poolIndices:number[];mechanic:string;boss:string;bossColor:string;eventLabel:string}> = {
  kitchen:{title:"푸른 불꽃이 사라진 주방",place:"학교 급식실",gas:"도시가스(LNG)",icon:"🍳",clue:"조리대 주변에서 강한 부취제 냄새가 감지됩니다.",sensor:"상부 센서 18% LEL · 농도 상승",color:"#59d9b0",leak:{x:245,y:790},poolIndices:[0,1,3],mechanic:"세 밸브 중 실제 누출 배관만 펄스에 붉게 반응합니다.",boss:"역화의 조리장",bossColor:"#e35c4b",eventLabel:"주방 후드 센서 단선"},
  restaurant:{title:"닫힌 식당의 경보음",place:"지하 음식점",gas:"액화석유가스(LPG)",icon:"🏪",clue:"바닥 가까이에서 경보 수치가 빠르게 올라갑니다.",sensor:"하부 센서 22% LEL · 바닥 체류",color:"#8ee16a",leak:{x:225,y:740},poolIndices:[0,2,4],mechanic:"LPG가 바닥을 따라 퍼집니다. 초록 안개 구역에서는 이동이 느려집니다.",boss:"저류층의 포식자",bossColor:"#70b957",eventLabel:"가스가 낮은 통로로 이동"},
  camping:{title:"과열된 부탄캔",place:"실내 캠핑 체험장",gas:"부탄가스",icon:"⛺",clue:"과대불판 아래 부탄캔이 뜨겁고 가스 냄새가 납니다.",sensor:"용기 표면 54℃ · 가연성 가스 감지",color:"#dfb04f",leak:{x:292,y:820},poolIndices:[1,3,4],mechanic:"용기 온도가 계속 오릅니다. 학생 대피와 열원 차단을 우선하세요.",boss:"과열 폭군 블레이즈",bossColor:"#f08a32",eventLabel:"부탄캔 온도 급상승"},
  laboratory:{title:"실험실 배관 균열",place:"과학실 가스배관",gas:"실험용 연료가스",icon:"🧪",clue:"배관 연결부에서 간헐적인 누출음이 들립니다.",sensor:"배관 구역 20% LEL · 누출음 감지",color:"#69b8e8",leak:{x:175,y:755},poolIndices:[0,2,3],mechanic:"센서 번호와 배관 압력을 비교해 고장 센서를 걸러내야 합니다.",boss:"오류코드 키메라",bossColor:"#8a78e6",eventLabel:"센서 03번 통신 두절"},
  boiler:{title:"무색무취의 위험 신호",place:"가정집 보일러실",gas:"일산화탄소(CO)",icon:"🏠",clue:"냄새는 없지만 CO 경보기가 울리고 가족이 두통을 호소합니다.",sensor:"CO 경보기 42ppm · 계속 상승",color:"#d8735c",leak:{x:260,y:760},poolIndices:[1,2,4],mechanic:"일산화탄소는 무색무취라 냄새로 알 수 없습니다. CO 경보기 수치와 두통·어지럼 증상으로만 판단하세요.",boss:"잠식하는 침묵",bossColor:"#a85a7a",eventLabel:"보일러 배기통 막힘 감지"},
};

export const LEVEL_GUIDES = {
  elementary:{label:"그림 판단",copy:"그림과 짧은 문장을 보고 가장 안전한 행동을 고르세요.",badge:"2지선다·음성 안내"},
  middle:{label:"행동 순서",copy:"지금 단계에서 먼저 해야 할 행동과 위험한 행동을 구분하세요.",badge:"3지선다·원인 피드백"},
  high:{label:"현장 분석",copy:"센서 수치와 가스 특성을 근거로 가장 적절한 조치를 선택하세요.",badge:"4지선다·센서 데이터"},
} as const;

export const LEVEL_STATS = {
  elementary:{summary:"180초 · 위험체 5 · 안내 상시",guide:"안전경로가 계속 보이고 회복키트 3개로 시작합니다.",accent:"관찰과 안전 순서 연습"},
  middle:{summary:"165초 · 위험체 8 · 돌발 2회",guide:"안전경로는 3초만 표시되고 함정 주기가 빨라집니다.",accent:"우선순위와 원인 판단"},
  high:{summary:"145초 · 위험체 12 · 돌발 3회",guide:"적 추적·가스 확산·보스 연속 패턴이 가장 강합니다.",accent:"센서 근거 기반 재난 지휘"},
} as const;

export const EVIDENCE:Record<ScenarioId,{id:string;x:number;y:number;icon:string;label:string;value:string}[]> = {
  kitchen:[
    {id:"odor",x:118,y:842,icon:"👃",label:"부취제 냄새",value:"B 배관 주변에서 냄새가 가장 강함"},
    {id:"sound",x:300,y:704,icon:"〽",label:"누출음",value:"B 연결부에서 ‘쉬익’ 소리가 반복됨"},
    {id:"upper",x:235,y:458,icon:"📈",label:"상부 센서",value:"상부 센서 18% LEL · 계속 상승"},
  ],
  restaurant:[
    {id:"low",x:118,y:842,icon:"⬇",label:"하부 경보",value:"하부 센서가 상부보다 12%p 높음"},
    {id:"pool",x:300,y:704,icon:"🌫",label:"바닥 저류",value:"가스가 계단 아래쪽으로 이동함"},
    {id:"lpg",x:235,y:458,icon:"L",label:"용기 표식",value:"연료 표식 LPG · 공기보다 무거움"},
  ],
  camping:[
    {id:"heat",x:118,y:842,icon:"🌡",label:"용기 온도",value:"부탄캔 표면 54℃ · 빠르게 상승"},
    {id:"plate",x:300,y:704,icon:"🍳",label:"과대불판",value:"불판이 용기 덮개 위까지 돌출됨"},
    {id:"dizzy",x:235,y:458,icon:"😵",label:"인체 증상",value:"학생이 두통과 어지럼을 호소함"},
  ],
  laboratory:[
    {id:"sound04",x:118,y:842,icon:"👂",label:"04번 누출음",value:"04번 연결부에서 간헐적 누출음"},
    {id:"pressure",x:300,y:704,icon:"↘",label:"압력 저하",value:"04번 배관 압력이 18% 감소"},
    {id:"sensor03",x:235,y:458,icon:"⚠",label:"센서 불일치",value:"03번 센서만 압력 변화 없이 경보"},
  ],
  boiler:[
    {id:"alarm",x:118,y:842,icon:"🔔",label:"CO 경보기",value:"CO 경보기 42ppm · 계속 상승"},
    {id:"headache",x:300,y:704,icon:"🤕",label:"가족의 두통 증상",value:"온 가족이 두통·메스꺼움을 호소함"},
    {id:"flue",x:235,y:458,icon:"🌀",label:"배기통 상태",value:"보일러 배기통 연결부가 헐거워짐"},
  ],
};

export const DEDUCTIONS:Record<ScenarioId,{prompt:string;cue:string;choices:DeductionChoice[]}> = {
  kitchen:{prompt:"수집한 단서가 가리키는 실제 누출원은 어디일까요?",cue:"냄새 강도·누출음·상부 센서를 함께 비교하세요.",choices:[{id:"b",label:"B 배관 연결부",correct:true,feedback:"세 단서가 모두 B 배관을 가리킵니다."},{id:"hood",label:"전기 환풍기 모터",correct:false,feedback:"환풍기는 점화원이 될 수 있지만 현재 누출원 단서는 아닙니다."},{id:"drain",label:"바닥 배수구",correct:false,feedback:"LNG는 공기보다 가벼워 바닥 배수구 저류와 맞지 않습니다."},{id:"lamp",label:"천장 조명 스위치",correct:false,feedback:"스위치는 위험한 점화원이지만 누출 배관은 아닙니다."}]},
  restaurant:{prompt:"하부 경보와 바닥 저류를 만든 누출원을 판정하세요.",cue:"가스 종류와 공기 대비 무게를 근거로 판단하세요.",choices:[{id:"lpg",label:"바닥 가까운 LPG 공급관",correct:true,feedback:"공기보다 무거운 LPG의 저류 특성과 일치합니다."},{id:"ceiling",label:"천장 조명 배선",correct:false,feedback:"배선은 점화원이 될 수 있으나 가스 공급원은 아닙니다."},{id:"upper",label:"천장 상부 LNG 배관",correct:false,feedback:"현재 용기 표식과 하부 농도는 LPG를 가리킵니다."},{id:"door",label:"출입문 자동모터",correct:false,feedback:"자동모터 조작은 피해야 하지만 누출원 판정과 다릅니다."}]},
  camping:{prompt:"온도와 설비 상태를 종합해 가장 긴급한 위험원을 찾으세요.",cue:"과대불판이 열을 어디로 전달하는지 확인하세요.",choices:[{id:"can",label:"과대불판 아래 과열된 부탄캔",correct:true,feedback:"복사열이 부탄캔 압력을 높여 파열 위험을 만듭니다."},{id:"tent",label:"텐트 지퍼",correct:false,feedback:"밀폐는 중독 위험을 높이지만 급격한 용기 온도 상승의 직접 원인은 아닙니다."},{id:"light",label:"캠핑 조명",correct:false,feedback:"전기 조작은 피해야 하지만 현재 핵심 위험원은 과열 용기입니다."},{id:"table",label:"접이식 테이블",correct:false,feedback:"테이블보다 열원과 부탄캔의 배치가 핵심 단서입니다."}]},
  laboratory:{prompt:"센서값과 실제 배관 상태를 비교해 누출 지점을 판정하세요.",cue:"압력 저하와 누출음이 동시에 나타난 번호를 찾으세요.",choices:[{id:"pipe04",label:"04번 배관 연결부",correct:true,feedback:"누출음과 압력 저하가 동시에 나타난 04번이 실제 누출 지점입니다."},{id:"sensor03",label:"03번 센서 위치",correct:false,feedback:"03번은 압력 변화가 없어 센서 오류 가능성이 큽니다."},{id:"main",label:"정상 압력 메인 배관",correct:false,feedback:"압력이 유지되는 배관은 현재 누출 단서와 맞지 않습니다."},{id:"console",label:"전기 제어 콘솔",correct:false,feedback:"콘솔은 조작하면 안 되는 점화원이지만 누출 지점은 아닙니다."}]},
  boiler:{prompt:"수집한 단서가 가리키는 실제 위험 원인은 무엇일까요?",cue:"CO 경보기 수치·증상·배기통 상태를 함께 비교하세요.",choices:[{id:"flue",label:"헐거워진 배기통으로 인한 불완전연소",correct:true,feedback:"배기통 이상으로 불완전연소 가스가 실내로 역류하고 있습니다."},{id:"stove",label:"주방 가스레인지 밸브",correct:false,feedback:"현재 단서는 보일러실 배기통을 가리키고 있습니다."},{id:"window",label:"창문 틈새 바람",correct:false,feedback:"바람은 CO 상승의 원인이 아닙니다."},{id:"battery",label:"경보기 배터리 방전",correct:false,feedback:"경보기는 오히려 정상적으로 상승 신호를 보내고 있습니다."}]},
};

export const CRISIS_ACTIONS:Record<ScenarioId,{title:string;prompt:string;choices:CrisisChoice[]}> = {
  kitchen:{title:"전등 스위치 접근",prompt:"학생이 가스 냄새가 나는 급식실 전등을 켜려 합니다. 5초 안에 행동하세요.",choices:[{id:"stop",label:"손을 멈추게 하고 밖으로 대피시킨다",correct:true,feedback:"전기 스파크를 차단하고 사람을 안전구역으로 이동시켰습니다.",hazard:"spark"},{id:"on",label:"빨리 켜서 누출 위치를 찾는다",correct:false,feedback:"스위치 접점의 스파크가 점화원이 될 수 있습니다.",hazard:"spark"},{id:"plug",label:"주변 플러그부터 뽑는다",correct:false,feedback:"플러그 분리 과정에서도 스파크가 발생할 수 있습니다.",hazard:"spark"},{id:"smell",label:"배관 가까이 가서 다시 냄새를 맡는다",correct:false,feedback:"누출원에 가까이 접근하면 가스를 흡입할 수 있습니다.",hazard:"exposure"}]},
  restaurant:{title:"LPG 저류층 이동",prompt:"가스가 지하 계단 아래로 퍼지고 있습니다. 5초 안에 안전 방향을 선택하세요.",choices:[{id:"up",label:"사람을 높은 출구 방향으로 대피시킨다",correct:true,feedback:"바닥에 모이는 LPG를 피해 높은 출구로 이동했습니다.",hazard:"exposure"},{id:"down",label:"계단 아래로 내려가 밸브를 찾는다",correct:false,feedback:"낮은 곳에는 LPG가 더 많이 모일 수 있습니다.",hazard:"exposure"},{id:"fan",label:"선풍기를 켜 가스를 밀어낸다",correct:false,feedback:"전기 모터가 점화원이 될 수 있습니다.",hazard:"spark"},{id:"phone",label:"실내에서 휴대전화로 바로 신고한다",correct:false,feedback:"통신은 가스가 없는 안전한 장소에서 해야 합니다.",hazard:"spark"}]},
  camping:{title:"부탄캔 과열 경보",prompt:"부탄캔 온도가 급상승하고 있습니다. 5초 안에 우선 행동을 선택하세요.",choices:[{id:"evacuate",label:"사용을 멈추고 모두 멀리 대피시킨다",correct:true,feedback:"열원 사용을 중지하고 파열 위험 거리 밖으로 대피했습니다.",hazard:"heat"},{id:"touch",label:"뜨거운 캔을 손으로 바로 분리한다",correct:false,feedback:"과열 용기를 만지면 화상과 파열 위험이 있습니다.",hazard:"heat"},{id:"water",label:"사용 중인 기구에 찬물을 붓는다",correct:false,feedback:"급격한 냉각과 기구 전도로 위험이 커질 수 있습니다.",hazard:"heat"},{id:"finish",label:"요리를 마친 뒤 식힌다",correct:false,feedback:"과열 징후가 있으면 즉시 사용을 중지해야 합니다.",hazard:"heat"}]},
  laboratory:{title:"센서 통신 두절",prompt:"03번 센서가 끊겼지만 04번 압력이 계속 낮아집니다. 5초 안에 판단하세요.",choices:[{id:"field",label:"04번 현장 표지와 압력계로 판단한다",correct:true,feedback:"단일 고장 센서 대신 독립된 현장 단서를 교차 확인했습니다.",hazard:"exposure"},{id:"reset",label:"센서 전원을 껐다 켠다",correct:false,feedback:"누출 환경에서 전기 조작은 점화 위험을 만듭니다.",hazard:"spark"},{id:"ignore",label:"센서가 꺼졌으므로 경보를 무시한다",correct:false,feedback:"압력 저하와 누출음은 여전히 유효한 위험 신호입니다.",hazard:"exposure"},{id:"console",label:"제어 콘솔에서 강제 보정한다",correct:false,feedback:"전기 콘솔 조작보다 현장 대피와 공급 차단이 우선입니다.",hazard:"spark"}]},
  boiler:{title:"두통을 호소하는 가족",prompt:"동생이 갑자기 심한 두통과 어지럼을 호소하며 주저앉습니다. 5초 안에 행동하세요.",choices:[{id:"outside",label:"즉시 창문을 열고 밖으로 데리고 나간다",correct:true,feedback:"신선한 공기가 있는 곳으로 이동시켜 CO 노출을 줄였습니다.",hazard:"exposure"},{id:"boiler-off",label:"보일러 전원 버튼부터 직접 끈다",correct:false,feedback:"전기 조작보다 사람을 먼저 안전한 곳으로 이동시켜야 합니다.",hazard:"spark"},{id:"rest",label:"일단 눕혀서 쉬게 한다",correct:false,feedback:"CO가 있는 공간에 계속 머무르면 증상이 악화됩니다.",hazard:"exposure"},{id:"call-inside",label:"실내에서 바로 119에 신고한다",correct:false,feedback:"신고는 가스가 없는 안전한 장소로 이동한 뒤 해야 합니다.",hazard:"exposure"}]},
};

export const SAFE_CHAIN_STEPS=[{icon:"◉",label:"추리"},{icon:"V",label:"차단"},{icon:"💨",label:"환기"},{icon:"🧑",label:"대피"},{icon:"119",label:"신고"}] as const;

export const QUESTIONS:Record<InteractableId,Question> = {
  valve: {
    id:"valve", title:"첫 번째 안전인장 · 차단", prompt:"지하 배관실에서 강한 가스 냄새가 난다. 가장 먼저 선택할 행동은?", correctNote:"가능한 경우 가스 공급을 차단하고 전기·화기 조작을 피해야 합니다.",
    choices:[
      { id:"switch", label:"전등을 켜 누출 위치를 찾는다", feedback:"전기 스위치의 작은 스파크가 점화원이 될 수 있습니다.", correct:false, slot:1 },
      { id:"close", label:"전기기구를 만지지 않고 밸브를 잠근다", feedback:"가스 공급을 안전하게 차단했습니다.", correct:true, slot:2 },
      { id:"lighter", label:"라이터 불꽃으로 배관을 확인한다", feedback:"화기로 누출을 확인하면 폭발 위험이 매우 커집니다.", correct:false, slot:3 },
      { id:"plug", label:"주변 전기 플러그부터 뽑는다", feedback:"플러그를 뽑는 과정에서도 스파크가 생길 수 있습니다.", correct:false, slot:4 },
    ],
  },
  vent: {
    id:"vent", title:"두 번째 안전인장 · 환기", prompt:"밸브를 잠갔지만 방 안에 가스가 남아 있다. 안전한 환기 방법은?", correctNote:"창문과 출입문을 열어 전기를 사용하지 않는 자연 환기를 해야 합니다.",
    choices:[
      { id:"fan", label:"환풍기를 가장 강하게 켠다", feedback:"환풍기의 전기 모터가 점화원이 될 수 있습니다.", correct:false, slot:1 },
      { id:"natural", label:"창문과 출입문을 열어 자연 환기한다", feedback:"전기 조작 없이 남은 가스를 밖으로 배출했습니다.", correct:true, slot:2 },
      { id:"aircon", label:"에어컨을 켜고 창문을 닫는다", feedback:"전기기구를 조작하면 안 되며 자연 환기가 필요합니다.", correct:false, slot:3 },
      { id:"spray", label:"방향제를 뿌려 냄새를 없앤다", feedback:"냄새를 가려도 누출 가스는 사라지지 않습니다.", correct:false, slot:4 },
    ],
  },
  report: {
    id:"report", title:"세 번째 안전인장 · 신고", prompt:"차단과 자연 환기를 마쳤다. 현장을 안전하게 인계하는 방법은?", correctNote:"가스가 없는 안전한 장소에서 119 또는 가스공급자에게 신고하고 점검을 기다립니다.",
    choices:[
      { id:"outside", label:"밖으로 이동해 119·가스공급자에게 신고한다", feedback:"안전한 장소에서 전문가에게 현장을 인계했습니다.", correct:true, slot:1 },
      { id:"return", label:"냄새가 약해졌으니 혼자 다시 들어간다", feedback:"전문가가 확인하기 전 재진입하면 남은 가스에 노출될 수 있습니다.", correct:false, slot:2 },
      { id:"indoor", label:"실내에서 휴대전화로 신고한다", feedback:"신고는 누출 가스가 없는 안전한 장소에서 해야 합니다.", correct:false, slot:3 },
      { id:"finish", label:"환기했으므로 신고 없이 상황을 끝낸다", feedback:"누출 원인을 점검하지 않으면 같은 사고가 다시 발생할 수 있습니다.", correct:false, slot:4 },
    ],
  },
  flame: {
    id:"flame", title:"지식석판 · 불꽃의 경고", prompt:"가스레인지 불꽃이 계속 노란색이고 냄비에 그을음이 생긴다. 올바른 판단은?", correctNote:"지속되는 황색·적색 불꽃은 불완전연소 신호일 수 있으므로 사용을 멈추고 환기한 뒤 점검받습니다.",
    choices:[
      {id:"higher",label:"화력을 더 높여 파란색으로 만든다",feedback:"화력을 무리하게 높이면 위험이 커질 수 있습니다.",correct:false,slot:1},
      {id:"stop",label:"사용을 멈추고 환기한 뒤 점검받는다",feedback:"불완전연소와 일산화탄소 위험에 대응했습니다.",correct:true,slot:2},
      {id:"finish",label:"조리를 끝낸 다음 확인한다",feedback:"황색 불꽃이 계속되면 즉시 사용을 중지해야 합니다.",correct:false,slot:3},
      {id:"touch",label:"불이 켜진 채 버너를 분해한다",feedback:"뜨거운 연소기를 임의로 분해하면 매우 위험합니다.",correct:false,slot:4},
    ],
  },
  camp: {
    id:"camp", title:"지식석판 · 캠핑의 함정", prompt:"비가 오는 날 밀폐된 텐트 안에서 큰 불판을 휴대용 가스레인지에 올렸다. 안전한 행동은?", correctNote:"밀폐된 텐트에서는 화재·일산화탄소 중독 위험이 크고, 과대불판은 부탄캔 과열을 일으킬 수 있습니다.",
    choices:[
      {id:"zip",label:"지퍼만 조금 열고 계속 사용한다",feedback:"밀폐 공간과 과대불판의 위험이 그대로 남습니다.",correct:false,slot:1},
      {id:"outside",label:"불을 끄고 기기를 야외로 옮겨 식힌다",feedback:"밀폐 공간 사용과 부탄캔 과열 위험을 함께 제거했습니다.",correct:true,slot:2},
      {id:"double",label:"버너 두 대를 붙여 가열한다",feedback:"부탄캔 두 개가 동시에 과열될 수 있습니다.",correct:false,slot:3},
      {id:"foil",label:"불판 아래를 포일로 감싼다",feedback:"열이 갇혀 부탄캔으로 전달되면 더 위험합니다.",correct:false,slot:4},
    ],
  },
  butane: {
    id:"butane", title:"지식석판 · 부탄캔 보관", prompt:"여분의 부탄캔을 햇빛이 드는 자동차 안에 두었다. 어디로 옮겨야 할까?", correctNote:"부탄캔은 차량 내부·직사광선·화기를 피하고 서늘하고 건조한 곳에 보관합니다.",
    choices:[
      {id:"trunk",label:"보이지 않게 트렁크 깊숙이 넣는다",feedback:"밀폐된 차량 내부는 매우 뜨거워질 수 있습니다.",correct:false,slot:1},
      {id:"stove",label:"필요할 때 쓰도록 버너 옆에 둔다",feedback:"부탄캔은 화기와 열원에서 떨어뜨려야 합니다.",correct:false,slot:2},
      {id:"shade",label:"차에서 꺼내 서늘한 그늘에 보관한다",feedback:"고온과 직사광선에 의한 압력 상승을 막았습니다.",correct:true,slot:3},
      {id:"water",label:"얼음물에 완전히 담가 둔다",feedback:"표시사항에 따라 서늘하고 건조한 장소에 보관하는 것이 안전합니다.",correct:false,slot:4},
    ],
  },
  soapcheck: {
    id:"soapcheck", title:"지식석판 · 비눗물 점검법", prompt:"가스를 사용하기 전, 호스 연결부에서 누출이 있는지 확인하고 싶다. 한국가스안전공사가 안내하는 올바른 점검 방법은?", correctNote:"비눗물이나 점검액(주방용 액체세제와 물을 1:1로 섞은 용액)을 연결부에 발라 기포가 생기는지 확인합니다. 기포가 생기면 밸브를 잠그고 판매점에 연락해 수리를 요청합니다.",
    choices:[
      {id:"lighter",label:"라이터 불꽃을 가까이 대어 확인한다",feedback:"화기로 누출을 확인하면 즉시 불이 붙을 수 있어 매우 위험합니다.",correct:false,slot:1},
      {id:"soap",label:"비눗물(또는 주방세제 희석액)을 발라 기포를 확인한다",feedback:"기포가 생기면 그 지점에서 누출이 있다는 뜻입니다. 안전하게 확인했습니다.",correct:true,slot:2},
      {id:"smell",label:"연결부에 코를 바짝 대고 깊게 숨을 들이쉰다",feedback:"가스를 직접 흡입하면 건강에 위험할 수 있습니다.",correct:false,slot:3},
      {id:"ignore",label:"눈으로만 보고 이상 없으면 넘어간다",feedback:"작은 누출은 눈으로 확인되지 않을 수 있어 점검액 확인이 필요합니다.",correct:false,slot:4},
    ],
  },
  reignite: {
    id:"reignite", title:"지식석판 · 불이 꺼졌을 때", prompt:"요리 중 갑자기 가스레인지 불이 꺼졌다. 다시 불을 붙이기 전에 가장 먼저 해야 할 행동은?", correctNote:"불이 꺼지면 즉시 콕과 밸브를 잠그고, 선풍기 등 전기제품을 사용하지 않는 자연 환기로 남은 가스를 완전히 배출한 뒤에만 재점화해야 합니다.",
    choices:[
      {id:"relight",label:"바로 다시 점화 버튼을 누른다",feedback:"꺼진 동안 새어 나온 가스에 불이 붙어 화재·폭발이 발생할 수 있습니다.",correct:false,slot:1},
      {id:"close-vent",label:"콕을 잠그고 자연 환기로 남은 가스를 배출한 뒤 재점화한다",feedback:"누출된 가스를 안전하게 제거한 뒤 점화했습니다.",correct:true,slot:2},
      {id:"fanout",label:"선풍기를 틀어 가스를 빨리 내보낸다",feedback:"선풍기 모터의 스파크가 점화원이 될 수 있어 사용하면 안 됩니다.",correct:false,slot:3},
      {id:"leave",label:"환기 없이 잠시 기다렸다가 다시 켠다",feedback:"환기 없이는 가스가 실내에 남아있을 수 있습니다.",correct:false,slot:4},
    ],
  },
};

export const VALVE_ACTIONS:Record<Difficulty,Record<ScenarioId,Question>>={
  elementary:{
    kitchen:{id:"valve",title:"🍳 냄새가 나는 급식실",prompt:"가스 냄새가 나고 B 배관에서 ‘쉬익’ 소리가 나요. 어떻게 해야 할까요?",cue:"👃 가스 냄새 · 👂 B 배관 누출음",correctNote:"전기 스위치나 불꽃을 사용하지 않고, 안전하게 할 수 있을 때 가스 밸브를 잠가요.",choices:[{id:"e-k-switch",label:"💡 전등을 켜서 살펴본다",feedback:"전등 스위치에서 작은 불꽃이 생길 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-k-close",label:"🙅 전기를 만지지 않고 B 밸브를 잠근다",feedback:"불꽃이 생길 행동을 피하고 가스 공급을 멈췄어요!",correct:true,slot:2},{id:"e-k-smell",label:"👃 얼굴을 가까이 대고 냄새를 맡는다",feedback:"가스를 마실 수 있으니 누출 배관에 가까이 가지 않아요.",correct:false,slot:3,hazard:"exposure"},{id:"e-k-fire",label:"🔥 불을 가까이 대어 확인한다",feedback:"불꽃은 가스에 불을 붙일 수 있어 매우 위험해요.",correct:false,slot:4,hazard:"spark"}]},
    restaurant:{id:"valve",title:"🏪 바닥에 모인 가스",prompt:"식당 바닥 가까이에서 가스 경보가 울려요. 가장 안전한 행동은 무엇일까요?",cue:"⬇️ LPG는 낮은 곳에 모일 수 있어요",correctNote:"낮은 곳에 머물지 말고 전기기구를 만지지 않으며, 안전하게 가능한 경우 공급 밸브를 잠가요.",choices:[{id:"e-r-fan",label:"🌀 선풍기를 켜서 가스를 날린다",feedback:"선풍기를 켤 때 스파크가 생길 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-r-close",label:"🚶 바닥에서 떨어져 이동하고 공급 밸브를 잠근다",feedback:"가스가 모인 낮은 곳을 피하고 공급을 멈췄어요!",correct:true,slot:2},{id:"e-r-down",label:"🔎 바닥에 엎드려 냄새를 찾는다",feedback:"바닥에는 LPG가 모일 수 있어 엎드리면 더 위험해요.",correct:false,slot:3,hazard:"exposure"},{id:"e-r-match",label:"🔥 성냥불로 가스가 있는지 본다",feedback:"불꽃을 사용하면 화재나 폭발이 일어날 수 있어요.",correct:false,slot:4,hazard:"spark"}]},
    camping:{id:"valve",title:"⛺ 뜨거워진 부탄캔",prompt:"가스레인지의 부탄캔이 뜨겁고 친구가 어지럽다고 해요. 먼저 무엇을 해야 할까요?",cue:"🌡️ 뜨거운 부탄캔 · 😵 어지러운 친구",correctNote:"사람을 먼저 안전한 곳으로 대피시키고, 안전하게 가능할 때 불을 끈 뒤 뜨거운 용기에서 멀어져요.",choices:[{id:"e-c-touch",label:"✋ 뜨거운 부탄캔을 바로 꺼낸다",feedback:"뜨거운 캔은 화상을 입거나 터질 수 있어 만지면 안 돼요.",correct:false,slot:1,hazard:"heat"},{id:"e-c-close",label:"🧑‍🤝‍🧑 친구를 대피시키고 불을 끈 뒤 멀어진다",feedback:"친구를 먼저 보호하고 열원도 안전하게 차단했어요!",correct:true,slot:2},{id:"e-c-water",label:"💧 사용 중인 기구에 찬물을 붓는다",feedback:"기구가 넘어지거나 뜨거운 가스가 퍼질 수 있어요.",correct:false,slot:3,hazard:"heat"},{id:"e-c-finish",label:"🍳 요리를 끝낼 때까지 기다린다",feedback:"과열되면 기다리지 말고 즉시 사용을 멈춰야 해요.",correct:false,slot:4,hazard:"heat"}]},
    laboratory:{id:"valve",title:"🧪 과학실 배관의 이상",prompt:"04번 배관에서 ‘쉬익’ 소리가 나고 경보기 숫자가 계속 올라가요. 어떻게 할까요?",cue:"📈 04번 숫자 상승 · 👂 누출음",correctNote:"선생님께 즉시 알리고 전기기구를 만지지 않으며, 안전하게 가능한 경우 메인 밸브를 잠가요.",choices:[{id:"e-l-reset",label:"🔌 센서 전원을 껐다 켠다",feedback:"전기 스위치를 만지면 스파크가 생길 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-l-close",label:"🙋 선생님께 알리고 메인 밸브를 잠근다",feedback:"현장 징후를 알리고 가스 공급을 안전하게 멈췄어요!",correct:true,slot:2},{id:"e-l-near",label:"👂 배관 가까이 얼굴을 대고 듣는다",feedback:"누출 가스를 마실 수 있으니 가까이 가지 않아요.",correct:false,slot:3,hazard:"exposure"},{id:"e-l-wait",label:"⏳ 경보가 멈출 때까지 기다린다",feedback:"숫자가 오르면 즉시 안전 행동을 해야 해요.",correct:false,slot:4,hazard:"exposure"}]},
    boiler:{id:"valve",title:"🏠 두통이 나는 우리 집",prompt:"보일러실에서 경보음이 울리고 가족이 머리가 아프대요. 무엇을 먼저 해야 할까요?",cue:"🔔 CO 경보음 · 🤕 가족의 두통",correctNote:"전기 스위치를 만지지 않고, 창문을 열어 신선한 공기가 있는 밖으로 가족을 먼저 대피시켜요.",choices:[{id:"e-b-switch",label:"💡 불을 켜서 보일러를 살펴본다",feedback:"전등 스위치에서 작은 불꽃이 생길 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-b-out",label:"🪟 창문을 열고 가족과 함께 밖으로 나간다",feedback:"신선한 공기가 있는 곳으로 안전하게 대피했어요!",correct:true,slot:2},{id:"e-b-sleep",label:"🛌 어지러운 가족을 눕혀서 쉬게 한다",feedback:"위험한 공간에 계속 있으면 증상이 더 심해져요.",correct:false,slot:3,hazard:"exposure"},{id:"e-b-touch",label:"🔧 보일러를 직접 만져서 고쳐본다",feedback:"원인을 모른 채 만지면 더 위험해질 수 있어요.",correct:false,slot:4,hazard:"exposure"}]},
  },
  middle:{
    kitchen:{id:"valve",title:"급식실 누출 대응 순서",prompt:"B 배관의 가스 농도가 상승하고 누출음이 들린다. 가장 적절한 초기 대응은?",cue:"B 배관 농도 상승 → 전기 조작 금지 → 공급 차단",correctNote:"누출 징후를 확인한 뒤 전기·화기 조작을 피하고, 안전하게 접근 가능한 공급 밸브를 차단합니다.",choices:[{id:"m-k-switch",label:"조명을 켜고 B 배관의 균열을 찾는다",feedback:"스위치 접점의 스파크가 점화원이 될 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"m-k-close",label:"주변에 알리고 전기를 조작하지 않은 채 B 밸브를 잠근다",feedback:"경고 공유와 점화원 통제, 공급 차단을 올바른 순서로 수행했습니다.",correct:true,slot:2},{id:"m-k-plug",label:"가까운 전기 플러그부터 뽑는다",feedback:"플러그를 뽑을 때도 전기 스파크가 생길 수 있습니다.",correct:false,slot:3,hazard:"spark"},{id:"m-k-smell",label:"배관마다 냄새를 직접 맡아 비교한다",feedback:"누출원에 얼굴을 가까이 대면 가스를 흡입할 수 있습니다.",correct:false,slot:4,hazard:"exposure"}]},
    restaurant:{id:"valve",title:"LPG 저류 구역 판단",prompt:"하부 경보가 상부보다 높고 바닥에 가스가 머문다. 올바른 대응 순서는?",cue:"하부 농도 높음 → 낮은 곳 회피 → 전기 조작 금지 → 차단",correctNote:"LPG는 공기보다 무거워 낮은 곳에 모일 수 있으므로 낮은 자세를 피하고 안전하게 공급을 차단합니다.",choices:[{id:"m-r-fan",label:"바닥 선풍기를 켜고 출입문을 연다",feedback:"선풍기 모터가 점화원이 될 수 있어 먼저 켜면 안 됩니다.",correct:false,slot:1,hazard:"spark"},{id:"m-r-close",label:"사람을 낮은 구역에서 이동시키고 전기 조작 없이 공급을 차단한다",feedback:"LPG 특성에 맞게 대피와 공급 차단을 수행했습니다.",correct:true,slot:2},{id:"m-r-down",label:"바닥에 엎드려 누출 방향을 확인한 뒤 밸브를 찾는다",feedback:"가스가 모인 낮은 공간에 머무르면 노출 위험이 커집니다.",correct:false,slot:3,hazard:"exposure"},{id:"m-r-drain",label:"배수구에 물을 부어 가스를 흘려보낸다",feedback:"가스는 물로 씻어낼 수 없으며 안전한 환기가 필요합니다.",correct:false,slot:4,hazard:"exposure"}]},
    camping:{id:"valve",title:"과열 사고 역할 분담",prompt:"부탄캔이 과열되고 학생이 어지러움을 호소한다. 두 사람이 해야 할 역할 분담은?",cue:"인명 대피 우선 + 안전하게 가능한 열원 차단",correctNote:"한 명은 학생을 신선한 공기가 있는 곳으로 대피시키고, 다른 한 명은 안전하게 가능한 범위에서 사용을 중지한 뒤 거리를 둡니다.",choices:[{id:"m-c-touch",label:"한 명이 캔을 빼고 다른 한 명이 찬물을 뿌린다",feedback:"과열 용기를 직접 만지거나 급격히 식히면 파열 위험이 있습니다.",correct:false,slot:1,hazard:"heat"},{id:"m-c-close",label:"학생을 대피시키고 안전하게 불을 끈 뒤 모두 거리를 둔다",feedback:"인명 보호와 열원 차단의 우선순위를 지켰습니다.",correct:true,slot:2},{id:"m-c-finish",label:"조리를 마친 뒤 학생 상태와 캔 온도를 확인한다",feedback:"과열과 건강 이상이 나타나면 즉시 사용을 중지해야 합니다.",correct:false,slot:3,hazard:"heat"},{id:"m-c-window",label:"학생은 그대로 두고 텐트 입구만 조금 연다",feedback:"증상이 있는 사람을 먼저 신선한 공기가 있는 곳으로 이동시켜야 합니다.",correct:false,slot:4,hazard:"exposure"}]},
    laboratory:{id:"valve",title:"센서 오류와 실제 누출 구분",prompt:"03번은 통신 오류, 04번은 농도 상승과 누출음이 동시에 나타난다. 우선 판단은?",cue:"센서 고장 ≠ 누출 확정 · 정상 데이터와 현장 징후 교차 확인",correctNote:"오류 표시만으로 누출원을 단정하지 않고, 정상 작동 센서의 상승 추세와 누출음을 함께 확인합니다.",choices:[{id:"m-l-error",label:"오류가 표시된 03번을 누출 배관으로 단정한다",feedback:"통신 오류는 센서 고장일 수 있어 누출 증거와 구분해야 합니다.",correct:false,slot:1},{id:"m-l-close",label:"04번을 의심하고 전기 조작 없이 메인 공급을 차단한다",feedback:"정상 센서 데이터와 현장 징후를 교차해 판단했습니다.",correct:true,slot:2},{id:"m-l-reset",label:"실내에서 03번 센서의 전원을 재부팅한다",feedback:"누출 가능 구역에서 전기 장치를 조작하면 위험합니다.",correct:false,slot:3,hazard:"spark"},{id:"m-l-ignore",label:"모든 센서가 정상으로 돌아올 때까지 기다린다",feedback:"04번의 상승 신호와 누출음이 있으므로 조치를 미루면 안 됩니다.",correct:false,slot:4,hazard:"exposure"}]},
    boiler:{id:"valve",title:"CO 경보 초기 대응",prompt:"CO 경보기가 울리고 가족 중 한 명이 어지럼을 호소한다. 가장 적절한 초기 대응은?",cue:"CO 경보 상승 → 인명 대피 우선 → 전기 조작 금지",correctNote:"전기·화기를 조작하지 않고 창문을 열어 환기하며 가족을 신선한 공기가 있는 곳으로 먼저 대피시킵니다.",choices:[{id:"m-b-switch",label:"환풍기를 켜고 원인을 찾는다",feedback:"환풍기 스위치의 스파크가 위험할 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"m-b-out",label:"창문을 열어 환기하며 가족을 밖으로 대피시킨다",feedback:"환기와 대피를 동시에 안전하게 수행했습니다.",correct:true,slot:2},{id:"m-b-check",label:"보일러 버튼을 직접 조작해 재가동해 본다",feedback:"원인 파악 전 재가동은 상황을 악화시킬 수 있습니다.",correct:false,slot:3,hazard:"exposure"},{id:"m-b-wait",label:"두통이 가라앉을 때까지 지켜본다",feedback:"CO 노출 증상은 즉시 대피로 대응해야 합니다.",correct:false,slot:4,hazard:"exposure"}]},
  },
  high:{
    kitchen:{id:"valve",title:"LNG 배관 추세 분석",prompt:"A 8% LEL 안정, B 18→24% LEL 상승+누출음, C 10% LEL 안정이다. 가장 타당한 조치는?",cue:"B 배관: 18→24% LEL · 상승 추세 · 누출음",correctNote:"단일 측정값보다 농도 상승 추세와 현장 징후를 교차 확인하고, 점화원을 통제한 상태에서 공급을 차단합니다.",choices:[{id:"h-k-switch",label:"조명을 켜 B 배관의 균열 위치를 육안 확인한다",feedback:"가연성 분위기에서 스위치 접점은 점화원이 될 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"h-k-close",label:"B 배관 누출로 판단해 전기 조작 없이 상위 공급 밸브를 차단한다",feedback:"상승 추세와 누출음을 근거로 공급 계통을 안전하게 격리했습니다.",correct:true,slot:2},{id:"h-k-average",label:"세 센서 평균이 낮으므로 경보를 해제하고 관찰한다",feedback:"국부 누출의 상승 추세를 평균값으로 희석하면 위험을 놓칠 수 있습니다.",correct:false,slot:3,hazard:"exposure"},{id:"h-k-fire",label:"검지액 대신 소형 불꽃으로 B 연결부를 확인한다",feedback:"누출 확인에 화기를 사용하면 즉시 점화될 수 있습니다.",correct:false,slot:4,hazard:"spark"}]},
    restaurant:{id:"valve",title:"LPG 수직 농도 분석",prompt:"하부 22% LEL·상승, 상부 7% LEL·안정이다. 가스 특성과 수치를 반영한 조치는?",cue:"하부 22% LEL ↑ / 상부 7% LEL → LPG 바닥 저류",correctNote:"LPG의 높은 증기밀도와 하부 상승 추세를 근거로 낮은 구역을 통제하고 전기 조작 없이 공급을 차단합니다.",choices:[{id:"h-r-fan",label:"하부 농도를 낮추기 위해 바닥 송풍기를 즉시 가동한다",feedback:"비방폭 모터의 전기 스파크가 점화원이 될 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"h-r-close",label:"낮은 구역을 통제하고 접근 가능한 상위 공급 밸브를 차단한다",feedback:"LPG 저류 특성과 점화원 통제를 모두 반영했습니다.",correct:true,slot:2},{id:"h-r-down",label:"하부 센서 근처에서 휴대용 검지기로 누출 방향을 추적한다",feedback:"고농도 저지대에 진입하기보다 먼저 대피와 공급 차단을 판단해야 합니다.",correct:false,slot:3,hazard:"exposure"},{id:"h-r-ignore",label:"상부가 10% LEL 미만이므로 전체 공간은 안전하다고 판단한다",feedback:"LPG는 하부에 국부적으로 축적될 수 있어 상부 수치만으로 판단할 수 없습니다.",correct:false,slot:4,hazard:"exposure"}]},
    camping:{id:"valve",title:"부탄캔 과열 위험 분석",prompt:"용기 표면 54℃, 압력 상승 경고, 학생 어지럼 증상이 동시에 확인된다. 최우선 대응은?",cue:"54℃ · 압력 상승 · 인명 이상 → 대피 우선",correctNote:"인명 대피를 최우선으로 하고, 안전하게 가능한 범위에서 열원을 차단한 뒤 과열 용기에 접근하지 않습니다.",choices:[{id:"h-c-touch",label:"열장갑으로 용기를 분리해 즉시 냉수에 담근다",feedback:"가열·가압된 용기의 직접 취급과 급랭은 위험합니다.",correct:false,slot:1,hazard:"heat"},{id:"h-c-close",label:"학생을 신선한 공기로 대피시키고 열원을 차단한 뒤 접근을 통제한다",feedback:"인명 보호, 에너지원 차단, 위험구역 통제를 순서대로 수행했습니다.",correct:true,slot:2},{id:"h-c-vent",label:"텐트 환풍기를 가동한 뒤 용기 온도 변화를 관찰한다",feedback:"비방폭 전기기구 가동은 점화 위험을 만들 수 있습니다.",correct:false,slot:3,hazard:"spark"},{id:"h-c-finish",label:"용기 허용온도를 확인할 때까지 조리를 계속한다",feedback:"과열과 이상 증상이 동시에 나타나면 즉시 사용을 중지해야 합니다.",correct:false,slot:4,hazard:"heat"}]},
    laboratory:{id:"valve",title:"배관·센서 교차 분석",prompt:"01번 8% 안정, 02번 11% 안정, 03번 통신 오류, 04번 24% 상승+누출음이다. 타당한 판단은?",cue:"03 통신 오류 / 04 24% LEL ↑ + 누출음",correctNote:"고장 센서 하나만 보지 말고 정상 센서의 농도 추세와 현장 누출음을 교차 확인해 실제 누출 계통을 판단합니다.",choices:[{id:"h-l-error",label:"통신 오류인 03번 배관이 누출원이라고 단정한다",feedback:"센서 통신 오류와 실제 가스 누출은 구분해야 합니다.",correct:false,slot:1},{id:"h-l-close",label:"04번 누출을 의심해 메인 공급을 격리하고 전문 점검을 요청한다",feedback:"정상 센서의 상승 추세와 현장 징후를 근거로 판단했습니다.",correct:true,slot:2},{id:"h-l-reset",label:"실험실 안에서 전체 센서 전원을 재기동해 비교한다",feedback:"가연성 분위기에서 전기 장치를 조작하면 점화 위험이 있습니다.",correct:false,slot:3,hazard:"spark"},{id:"h-l-wait",label:"03번 통신이 복구될 때까지 04번 경보를 보류한다",feedback:"명확한 상승 신호와 누출음이 있으므로 안전 조치를 지연하면 안 됩니다.",correct:false,slot:4,hazard:"exposure"}]},
    boiler:{id:"valve",title:"CO 농도 추세 분석",prompt:"CO 경보기 42→58ppm으로 상승 중이며 배기통 연결부 이상이 확인된다. 가장 타당한 조치는?",cue:"CO 42→58ppm ↑ · 배기통 연결부 이상",correctNote:"상승 추세와 배기통 이상을 근거로 전기 조작 없이 즉시 환기하고 인명을 대피시킨 뒤 전문 점검을 요청합니다.",choices:[{id:"h-b-switch",label:"환기팬을 강하게 가동해 수치를 낮춘다",feedback:"가연성 여부가 불확실한 상황에서 비방폭 전기기구 가동은 위험할 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"h-b-out",label:"창문을 열고 가족을 대피시킨 뒤 전문 점검을 요청한다",feedback:"상승 추세와 배기통 이상을 근거로 대피와 점검 요청을 올바르게 수행했습니다.",correct:true,slot:2},{id:"h-b-ignore",label:"수치가 아직 위험 기준 미만이므로 지켜본다",feedback:"상승 추세가 뚜렷하므로 대기하면 위험이 커집니다.",correct:false,slot:3,hazard:"exposure"},{id:"h-b-repair",label:"직접 배기통 연결부를 분해해 점검한다",feedback:"비전문가의 직접 분해·점검은 위험하며 전문가에게 맡겨야 합니다.",correct:false,slot:4,hazard:"exposure"}]},
  },
};

export const FOLLOWUP_ACTIONS:Record<Difficulty,Record<"vent"|"report",Question>>={
  elementary:{
    vent:{id:"vent",title:"🌬️ 남은 가스 내보내기",prompt:"밸브를 잠갔지만 방 안에 가스 냄새가 남아 있어요. 어떻게 환기할까요?",cue:"🚫 전기기구 OFF · 🪟 창문과 문을 손으로 열기",correctNote:"전기기구를 켜지 않고 창문과 출입문을 손으로 열어 자연스럽게 환기해요.",choices:[{id:"e-v-fan",label:"🌀 환풍기를 세게 켠다",feedback:"환풍기를 켤 때 작은 전기 불꽃이 생길 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-v-natural",label:"🪟 창문과 문을 손으로 열고 밖으로 나온다",feedback:"전기를 사용하지 않고 안전하게 가스를 내보냈어요!",correct:true,slot:2},{id:"e-v-spray",label:"🌸 방향제를 뿌려 냄새를 없앤다",feedback:"냄새를 가려도 가스는 그대로 남아 있어요.",correct:false,slot:3,hazard:"exposure"},{id:"e-v-light",label:"🕯️ 촛불을 켜서 냄새를 없앤다",feedback:"불꽃은 가스에 불을 붙일 수 있어요.",correct:false,slot:4,hazard:"spark"}]},
    report:{id:"report",title:"📞 안전한 곳에서 신고하기",prompt:"차단과 환기를 했어요. 이제 어디에서 누구에게 알려야 할까요?",cue:"🚶 밖으로 이동 → 📞 119·가스공급자",correctNote:"가스가 없는 바깥의 안전한 곳에서 119나 가스공급자에게 신고하고 어른과 전문가를 기다려요.",choices:[{id:"e-p-inside",label:"🏠 방 안에서 바로 전화한다",feedback:"가스가 남은 실내에서 휴대전화를 사용하면 위험할 수 있어요.",correct:false,slot:1,hazard:"spark"},{id:"e-p-outside",label:"🌳 밖으로 나가 119나 가스공급자에게 알린다",feedback:"안전한 곳에서 정확하게 신고했어요!",correct:true,slot:2},{id:"e-p-return",label:"🔍 냄새가 약하니 혼자 다시 들어간다",feedback:"전문가가 확인하기 전에는 다시 들어가면 안 돼요.",correct:false,slot:3,hazard:"exposure"},{id:"e-p-finish",label:"✅ 냄새가 줄었으니 아무에게도 알리지 않는다",feedback:"누출 원인을 고치지 않으면 사고가 다시 생길 수 있어요.",correct:false,slot:4,hazard:"exposure"}]},
  },
  middle:{
    vent:{id:"vent",title:"자연환기 행동 순서",prompt:"공급 차단 후 실내에 가스가 남아 있다. 올바른 환기 순서는?",cue:"전기 조작 금지 → 문·창문 개방 → 밖에서 농도 저감 대기",correctNote:"전기를 사용하지 않고 문과 창문을 열어 자연환기한 뒤 안전한 외부에서 기다립니다.",choices:[{id:"m-v-fan",label:"환풍기를 켠 뒤 창문을 차례로 연다",feedback:"환풍기 모터의 스파크가 남은 가스에 점화될 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"m-v-natural",label:"전기를 조작하지 않고 문·창문을 열어 자연환기한 뒤 밖으로 나온다",feedback:"점화원을 만들지 않는 올바른 자연환기 순서입니다.",correct:true,slot:2},{id:"m-v-phone",label:"실내에서 휴대전화로 농도를 확인하며 환기한다",feedback:"통화와 신고는 가스가 없는 안전한 외부에서 해야 합니다.",correct:false,slot:3,hazard:"spark"},{id:"m-v-return",label:"냄새가 약해지는 즉시 실내로 돌아가 점검한다",feedback:"냄새만으로 안전을 판단하지 말고 전문가의 확인을 기다려야 합니다.",correct:false,slot:4,hazard:"exposure"}]},
    report:{id:"report",title:"현장 신고 정보 구성",prompt:"차단·자연환기·대피를 마쳤다. 다음 행동으로 가장 적절한 것은?",cue:"안전한 장소 → 119·가스공급자 → 위치·가스 종류·조치 내용 전달",correctNote:"안전한 외부에서 위치, 사고 상황, 가스 종류, 완료한 조치를 신고하고 재진입하지 않습니다.",choices:[{id:"m-p-inside",label:"실내에 남아 휴대전화로 119에 신고한다",feedback:"신고는 가스가 없는 안전한 장소로 이동한 뒤 해야 합니다.",correct:false,slot:1,hazard:"spark"},{id:"m-p-outside",label:"밖에서 위치와 조치 내용을 119·가스공급자에게 알린다",feedback:"전문가가 판단하는 데 필요한 정보를 안전하게 전달했습니다.",correct:true,slot:2},{id:"m-p-return",label:"친구와 다시 들어가 누출 부위를 사진으로 기록한다",feedback:"전문가 확인 전 재진입과 전자기기 사용은 위험합니다.",correct:false,slot:3,hazard:"spark"},{id:"m-p-finish",label:"환기가 끝났으므로 신고 없이 수업을 재개한다",feedback:"누출 원인 점검과 안전 확인 없이 사용을 재개하면 안 됩니다.",correct:false,slot:4,hazard:"exposure"}]},
  },
  high:{
    vent:{id:"vent",title:"LEL 추세 기반 환기 판단",prompt:"공급 차단 후 자연환기 2분 동안 24→13% LEL로 감소했다. 다음 조치로 타당한 것은?",cue:"24% → 13% LEL 감소 중 · 안전 확인 미완료",correctNote:"수치가 감소해도 안전이 확인된 것은 아닙니다. 전기 조작과 재진입을 금지하고 자연환기를 지속하며 전문가 측정을 기다립니다.",choices:[{id:"h-v-fan",label:"감소 속도를 높이기 위해 비방폭 환풍기를 가동한다",feedback:"가연성 농도가 남은 상태에서 비방폭 모터는 점화원이 될 수 있습니다.",correct:false,slot:1,hazard:"spark"},{id:"h-v-natural",label:"자연환기와 출입 통제를 유지하고 전문가의 농도 확인을 기다린다",feedback:"감소 추세와 잔류 위험을 모두 반영한 판단입니다.",correct:true,slot:2},{id:"h-v-enter",label:"25% LEL 미만이므로 보호구 없이 들어가 누출부를 점검한다",feedback:"13% LEL도 가연성 위험을 무시할 수 없으며 임의 재진입하면 안 됩니다.",correct:false,slot:3,hazard:"exposure"},{id:"h-v-aircon",label:"창문을 닫고 에어컨 순환모드로 잔류 가스를 희석한다",feedback:"밀폐와 전기기구 가동은 잔류 가스 위험을 키울 수 있습니다.",correct:false,slot:4,hazard:"spark"}]},
    report:{id:"report",title:"전문기관 현장 인계",prompt:"차단·환기 후 농도는 감소 중이며 1명이 어지럼 증상을 보였다. 신고 내용으로 가장 완전한 것은?",cue:"위치 + 가스 종류 + 센서 추세 + 인명 상태 + 시행 조치",correctNote:"안전한 외부에서 119와 가스공급자에게 위치, 가스 종류, 농도 추세, 인명 상태, 시행한 조치를 전달하고 출입을 통제합니다.",choices:[{id:"h-p-short",label:"밖에서 ‘가스 냄새가 난다’고만 신고하고 현장을 떠난다",feedback:"전문 대응에 필요한 위치·가스·인명·조치 정보가 부족합니다.",correct:false,slot:1},{id:"h-p-full",label:"안전한 밖에서 위치·가스·수치 추세·인명 상태·조치 내용을 전달한다",feedback:"전문기관의 위험 판단과 출동에 필요한 정보를 완전하게 인계했습니다.",correct:true,slot:2},{id:"h-p-photo",label:"정확한 신고를 위해 재진입해 누출부 사진과 센서 화면을 촬영한다",feedback:"정보 수집을 위한 임의 재진입과 전자기기 사용은 허용되지 않습니다.",correct:false,slot:3,hazard:"spark"},{id:"h-p-restart",label:"농도가 감소 중이므로 설비를 재가동하고 변화 수치를 함께 신고한다",feedback:"전문가 점검 전 설비 재가동은 재누출과 점화 위험을 만듭니다.",correct:false,slot:4,hazard:"spark"}]},
  },
};

export function safetyQuestion(id:InteractableId,difficulty:Difficulty,scenarioId:ScenarioId){
  if(id==="valve")return VALVE_ACTIONS[difficulty][scenarioId];
  if(id==="vent"||id==="report")return FOLLOWUP_ACTIONS[difficulty][id];
  return QUESTIONS[id];
}

export type PendingMistake = { questionId:InteractableId; scenarioId:ScenarioId; difficulty:Difficulty; at:number };
export function addMistake(list:PendingMistake[],mistake:PendingMistake,cap=10):PendingMistake[]{
  const rest=list.filter(item=>item.questionId!==mistake.questionId);
  return [mistake,...rest].slice(0,cap);
}
export function removeMistake(list:PendingMistake[],questionId:InteractableId):PendingMistake[]{
  return list.filter(item=>item.questionId!==questionId);
}

export function rewindExplanation(choice:QuestionChoice,difficulty:Difficulty){
  const hazard=choice.hazard??(["switch","plug","fan","aircon","all-switch","reset"].includes(choice.id)?"spark":"exposure");
  const byLevel={
    elementary:{spark:{cause:"스위치·모터에서 작은 불꽃이 생김",result:"가스에 불이 붙을 수 있음"},exposure:{cause:"가스가 있는 곳에 계속 머묾",result:"가스를 마시거나 위험해질 수 있음"},heat:{cause:"뜨거운 용기 가까이 접근함",result:"화상·용기 파열 위험이 커짐"}},
    middle:{spark:{cause:"전기 접점·모터가 점화원이 됨",result:"화재·폭발 가능성이 높아짐"},exposure:{cause:"대피·차단이 늦어져 노출이 계속됨",result:"중독 위험과 골든타임 손실"},heat:{cause:"과열 용기를 직접 취급함",result:"화상·압력 파열 위험 증가"}},
    high:{spark:{cause:"가연성 분위기에서 비방폭 점화원 생성",result:"LEL 범위 내 점화·폭발 위험 증가"},exposure:{cause:"위험구역 통제·공급 격리 지연",result:"농도 상승·인명 노출·대응시간 악화"},heat:{cause:"가압 용기에 열·물리적 충격 추가",result:"내압 상승·용기 파열 가능성 증가"}},
  } as const;
  return{hazard,cause:byLevel[difficulty][hazard].cause,result:byLevel[difficulty][hazard].result};
}

export const WORLD={w:1536,h:960};
export const STATIONS = [
  { id:"valve" as StationId, x:205, y:795, label:"차단 밸브", mark:"V", color:"#dc5d4b" },
  { id:"vent" as StationId, x:575, y:175, label:"자연 환기문", mark:"💨", color:"#55b8d8" },
  { id:"report" as StationId, x:1390, y:755, label:"야외 신고소", mark:"119", color:"#e0b04a" },
];

export const TABLETS = [
  {id:"flame" as LoreId,x:520,y:775,label:"불꽃 지식석판",mark:"🔥",color:"#df7e43"},
  {id:"camp" as LoreId,x:900,y:175,label:"캠핑 지식석판",mark:"⛺",color:"#9e77d7"},
  {id:"butane" as LoreId,x:1305,y:175,label:"부탄캔 지식석판",mark:"B",color:"#62a4df"},
  {id:"soapcheck" as LoreId,x:150,y:300,label:"비눗물 점검 지식석판",mark:"🧼",color:"#6bc9a0"},
  {id:"reignite" as LoreId,x:1420,y:550,label:"재점화 지식석판",mark:"🔄",color:"#e0895a"},
];

export const RESCUES=[
  {id:"resident",x:470,y:520,icon:"🧑",label:"대피 주민",tip:"전기 스위치를 만지지 않고 안전한 구역으로 주민을 이동시켰습니다."},
  {id:"camper",x:1260,y:500,icon:"🧑‍🎓",label:"어지러운 학생",tip:"일산화탄소 노출이 의심되는 학생을 신선한 공기가 있는 곳으로 이동시키고 119를 요청했습니다."},
];

export const CACHES=[
  {id:"cache-a",x:130,y:180,label:"안전키트 보급함"},{id:"cache-b",x:825,y:465,label:"탐지기 배터리"},{id:"cache-c",x:1440,y:270,label:"현장 기록상자"},
];

export const GAS_POOLS=[
  {x:270,y:430,r:72},{x:650,y:485,r:88},{x:1020,y:265,r:82},{x:1225,y:820,r:92},{x:860,y:745,r:74},
];

export const SPARK_TRAPS=[
  {x:410,y:220,phase:0},{x:705,y:720,phase:1.3},{x:1080,y:580,phase:2.5},{x:1320,y:340,phase:.7},
];

export const WALLS = [
  {x:0,y:0,w:1536,h:32},{x:0,y:928,w:1536,h:32},{x:0,y:0,w:32,h:960},{x:1504,y:0,w:32,h:960},
  {x:352,y:32,w:32,h:152},{x:352,y:250,w:32,h:360},{x:352,y:680,w:32,h:248},
  {x:736,y:32,w:32,h:282},{x:736,y:386,w:32,h:320},{x:736,y:782,w:32,h:146},
  {x:1120,y:32,w:32,h:164},{x:1120,y:266,w:32,h:280},{x:1120,y:618,w:32,h:310},
  {x:32,y:575,w:140,h:30},{x:245,y:575,w:107,h:30},
  {x:384,y:635,w:130,h:30},{x:590,y:635,w:146,h:30},
  {x:768,y:525,w:145,h:30},{x:990,y:525,w:130,h:30},
  {x:1152,y:360,w:136,h:30},{x:1360,y:360,w:144,h:30},
  {x:835,y:300,w:150,h:28},{x:1000,y:770,w:120,h:28},
];

export const DOORWAYS = [
  {x:352,y:184,w:32,h:66,axis:"vertical"},{x:352,y:610,w:32,h:70,axis:"vertical"},
  {x:736,y:314,w:32,h:72,axis:"vertical"},{x:736,y:706,w:32,h:76,axis:"vertical"},
  {x:1120,y:196,w:32,h:70,axis:"vertical"},{x:1120,y:546,w:32,h:72,axis:"vertical"},
  {x:172,y:575,w:73,h:30,axis:"horizontal"},{x:514,y:635,w:76,h:30,axis:"horizontal"},
  {x:913,y:525,w:77,h:30,axis:"horizontal"},{x:1288,y:360,w:72,h:30,axis:"horizontal"},
] as const;

export const SPAWNS = [
  [170,710,"wisp"],[260,520,"crawler"],[190,300,"wisp"],[445,740,"crawler"],
  [620,560,"wisp"],[540,280,"crawler"],[850,420,"wisp"],[960,650,"crawler"],
  [1040,180,"wisp"],[1210,260,"crawler"],[1360,570,"wisp"],[1300,850,"crawler"],
] as const;

export const OBJECTIVES = [
  "서쪽 배관실의 차단 밸브를 찾아라", "중앙 기록실의 자연 환기문을 개방하라",
  "동쪽 야외 신고소에서 현장을 인계하라", "중앙 제단에 나타난 폭압 군주를 봉인하라",
];

export function logAction(run:RunState,icon:string,label:string,detail:string,outcome:ActionLog["outcome"]){const at=Math.max(0,Math.round(DIFFICULTIES[run.difficulty].time-run.seconds));run.actionLog.push({icon,label,detail,outcome,at});if(run.actionLog.length>12)run.actionLog.shift();}
export function awardSafetyStep(run:RunState,step:number,label:string,detail:string){run.bossBreak=Math.max(run.bossBreak,step);run.safeChain=Math.min(5,run.safeChain+1);run.maxSafeChain=Math.max(run.maxSafeChain,run.safeChain);const multiplier=1+(run.safeChain-1)*.25;run.score+=Math.round(95*multiplier);logAction(run,SAFE_CHAIN_STEPS[step-1].icon,label,`${detail} · SAFE ×${run.safeChain}`,"safe");}
export function breakSafetyChain(run:RunState,label:string,detail:string){run.safeChain=0;logAction(run,"⚠",label,`${detail} · 안전 콤보 초기화`,"danger");}
export function spawnScenarioBoss(run:RunState){if(run.bossSpawned)return;const cfg=DIFFICULTIES[run.difficulty];run.bossSpawned=true;run.bossPatternWait=cfg.bossCadence;run.enemies.push({id:"pressure-lord",x:920,y:745,spawnX:920,spawnY:745,hp:cfg.bossHp,maxHp:cfg.bossHp,kind:"boss",phase:0,hitWait:0,respawnWait:0,respawnable:false});run.score+=200;logAction(run,"☠","보스 출현",`${SCENARIOS[run.scenarioId].boss} · SAFE 보호막 ${run.bossBreak}/5`,"danger");}
export function requiredEvidence(run:RunState){return DIFFICULTIES[run.difficulty].evidenceNeeded;}
export function nextEvidence(run:RunState){return EVIDENCE[run.scenarioId].find(item=>!run.evidence.has(item.id));}
export function remainingRescue(run:RunState){return RESCUES.filter(item=>!run.rescued.has(item.id)).sort((a,b)=>distance(run.player.x,run.player.y,a.x,a.y)-distance(run.player.x,run.player.y,b.x,b.y))[0]??RESCUES[0];}

export function objectiveFor(run:RunState){const needed=requiredEvidence(run);if(run.evidence.size<needed)return`현장 단서를 수집하라 · ${run.evidence.size}/${needed}`;if(!run.detectedLeak)return"수집한 증거로 누출원을 추리하라";if(!run.completed.has("valve"))return OBJECTIVES[0];if(!run.completed.has("vent"))return OBJECTIVES[1];if(run.rescued.size<1)return"구조 대상을 안전구역으로 대피시켜라";if(!run.completed.has("report"))return OBJECTIVES[2];return OBJECTIVES[3]; }
export function objectiveTarget(run:RunState){
  if(run.evidence.size<requiredEvidence(run))return nextEvidence(run)??SCENARIOS[run.scenarioId].leak;
  if(!run.detectedLeak)return SCENARIOS[run.scenarioId].leak;
  if(!run.completed.has("valve"))return STATIONS[0];
  if(!run.completed.has("vent"))return STATIONS[1];
  if(run.rescued.size<1)return remainingRescue(run);
  if(!run.completed.has("report"))return STATIONS[2];
  return run.enemies.find(e=>e.kind==="boss"&&e.hp>0)??{x:920,y:745};
}
export function nearbyAction(run:RunState){
  const evidence=EVIDENCE[run.scenarioId].find(item=>distance(run.player.x,run.player.y,item.x,item.y)<70);if(evidence)return{label:run.evidence.has(evidence.id)?"단서 기록됨":"증거 수집",ready:!run.evidence.has(evidence.id)};
  const rescue=RESCUES.find(item=>distance(run.player.x,run.player.y,item.x,item.y)<78);if(rescue)return{label:run.rescued.has(rescue.id)?"대피 완료":"주민 대피",ready:!run.rescued.has(rescue.id)};
  const station=STATIONS.find(item=>distance(run.player.x,run.player.y,item.x,item.y)<82);if(station)return{label:run.completed.has(station.id)?"작동 완료":station.id==="valve"?"밸브 차단":station.id==="vent"?"자연환기":"안전 신고",ready:!run.completed.has(station.id)};
  const tablet=TABLETS.find(item=>distance(run.player.x,run.player.y,item.x,item.y)<82);if(tablet)return{label:run.knowledge.has(tablet.id)?"해독 완료":"석판 해독",ready:!run.knowledge.has(tablet.id)};
  return{label:"가까이 이동",ready:false};
}
export function distance(ax:number,ay:number,bx:number,by:number){ return Math.hypot(ax-bx,ay-by); }
export function blocked(x:number,y:number,r=13){ return WALLS.some(w=>x+r>w.x&&x-r<w.x+w.w&&y+r>w.y&&y-r<w.y+w.h); }
export function dynamicBlocked(run:RunState,x:number,y:number,r=13){return run.eventType==="block"&&run.eventTimer>0&&x+r>724&&x-r<812&&y+r>676&&y-r<792;}
export function clamp(value:number,min:number,max:number){ return Math.max(min,Math.min(max,value)); }
export function formatTime(seconds:number){ const s=Math.max(0,Math.ceil(seconds)); return `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`; }
export function profileId(){if(typeof window==="undefined")return"classroom";let id=window.localStorage.getItem("gaskeep-profile");if(!id){id=`keeper-${crypto.randomUUID()}`;window.localStorage.setItem("gaskeep-profile",id);}return id;}
export function safetyPath(run:RunState){
  const cell=32,cols=Math.floor(WORLD.w/cell),rows=Math.floor(WORLD.h/cell),start={x:clamp(Math.floor(run.player.x/cell),1,cols-2),y:clamp(Math.floor(run.player.y/cell),1,rows-2)},goalPoint=objectiveTarget(run),goal={x:clamp(Math.floor(goalPoint.x/cell),1,cols-2),y:clamp(Math.floor(goalPoint.y/cell),1,rows-2)};
  const key=(x:number,y:number)=>`${x},${y}`,queue=[start],seen=new Set([key(start.x,start.y)]),parent=new Map<string,string>();let end=key(start.x,start.y);
  while(queue.length){const current=queue.shift()!,currentKey=key(current.x,current.y);end=currentKey;if(Math.abs(current.x-goal.x)+Math.abs(current.y-goal.y)<=1)break;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=current.x+dx,ny=current.y+dy,nk=key(nx,ny),wx=nx*cell+cell/2,wy=ny*cell+cell/2;if(nx<1||ny<1||nx>=cols-1||ny>=rows-1||seen.has(nk)||blocked(wx,wy,10))continue;const dangerous=SPARK_TRAPS.some(t=>distance(wx,wy,t.x,t.y)<70)||SCENARIOS[run.scenarioId].poolIndices.some(index=>{const p=GAS_POOLS[index];return distance(wx,wy,p.x,p.y)<p.r*run.gasLevel*.8;});if(dangerous&&Math.random()>.18)continue;seen.add(nk);parent.set(nk,currentKey);queue.push({x:nx,y:ny});}}
  const points:{x:number;y:number}[]=[];let cursor=end;for(let count=0;count<180;count++){const [x,y]=cursor.split(",").map(Number);points.push({x:x*cell+cell/2,y:y*cell+cell/2});const prev=parent.get(cursor);if(!prev)break;cursor=prev;}return points.reverse();
}

export function createRun(difficulty:Difficulty,scenarioId:ScenarioId):RunState {
  const cfg=DIFFICULTIES[difficulty];
  return {
    difficulty,
    player:{x:95,y:855,hp:cfg.hp,maxHp:cfg.hp,facingX:1,facingY:0,moving:false},
    enemies:SPAWNS.slice(0,cfg.enemies).map((spawn,index)=>({
      id:`mist-${index}`,x:spawn[0],y:spawn[1],spawnX:spawn[0],spawnY:spawn[1],kind:spawn[2],hp:cfg.enemyHp,maxHp:cfg.enemyHp,phase:index*.83,hitWait:0,respawnWait:0,respawnable:true,
    })),
    completed:new Set(),knowledge:new Set(),caches:new Set(),rescued:new Set(),score:0,seconds:cfg.time,pulseWait:0,pulseAge:9,
    medkits:cfg.medkits,defeated:0,bossSpawned:false,finished:false,hitFlash:0,trapWait:0,bossPhase2:false,respawned:0,
    scenarioId,detectedLeak:false,gasLevel:.82,pulseCount:0,wrongChoices:0,sparkHits:0,gasExposure:0,sparkBurst:0,lastMistake:"",
    guidePath:[],guideAge:0,alertWait:0,droneWait:0,droneAge:0,shieldWait:0,shieldAge:0,ventWait:0,ventAge:0,eventTriggered:false,eventTimer:0,eventType:"none",eventLabel:"",coopActions:0,overheat:scenarioId==="camping"?54:0,bossPatternWait:cfg.bossCadence,rescueMarkerAge:0,eventCount:0,nextEventAt:cfg.eventStart,evidence:new Set(),safeChain:0,maxSafeChain:0,bossBreak:0,crisisActive:false,crisisTimer:0,crisisSuccess:false,crisisHandled:false,actionLog:[],
    shake:0,particles:[],
  };
}

export function addShake(run:RunState,amount:number,reducedFx=false){run.shake=Math.min(1,run.shake+amount*(reducedFx?.35:1));}

export function spawnParticles(run:RunState,x:number,y:number,color:string,count:number,reducedFx=false){
  const total=reducedFx?Math.ceil(count*.4):count;
  for(let i=0;i<total;i++){
    const angle=Math.random()*Math.PI*2,speed=40+Math.random()*110;
    run.particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:.4+Math.random()*.35,maxLife:.75,color,size:2+Math.random()*3});
  }
  if(run.particles.length>240)run.particles.splice(0,run.particles.length-240);
}

export function updateEffects(run:RunState,dt:number){
  run.shake=Math.max(0,run.shake-dt*3.2);
  if(!run.particles.length)return;
  const next:Particle[]=[];
  for(const p of run.particles){
    p.life-=dt;if(p.life<=0)continue;
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;
    next.push(p);
  }
  run.particles=next;
}

export function emptyHud(difficulty:Difficulty):Hud {
  const c=DIFFICULTIES[difficulty];
  return {hp:c.hp,maxHp:c.hp,score:0,seconds:c.time,seals:0,medkits:c.medkits,defeated:0,objective:`현장 단서를 수집하라 · 0/${c.evidenceNeeded}`,pulseReady:1,bossHp:0,bossMax:0,knowledge:0,rescued:0,sensorLevel:1,respawned:0,living:c.enemies,gasLevel:.82,detectedLeak:false,bossShielded:false,nearbyLabel:"가까이 이동",canInteract:false,guideAge:0,droneReady:1,droneActive:false,shieldReady:1,shieldActive:false,ventReady:1,ventActive:false,eventLabel:"",eventTimer:0,coopActions:0,evidence:0,evidenceNeeded:c.evidenceNeeded,safeChain:0,maxSafeChain:0,bossBreak:0,crisisActive:false,crisisTimer:0};
}
