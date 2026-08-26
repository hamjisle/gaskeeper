"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";

import type { CrisisChoice, DashboardReport, DeductionChoice, Difficulty, Hud, InteractableId, LoreId, PendingMistake, ProgressProfile, QuestionChoice, ResultData, RewindInfo, RunState, Screen, ScenarioChoice, ScenarioId, StationId } from "./game-data";
import { CACHES, CRISIS_ACTIONS, DEDUCTIONS, DIFFICULTIES, EVIDENCE, GAS_POOLS, LEVEL_GUIDES, LEVEL_STATS, QUESTIONS, RESCUES, SAFE_CHAIN_STEPS, SCENARIOS, SPARK_TRAPS, STATIONS, TABLETS, WORLD, addMistake, addShake, awardSafetyStep, blocked, breakSafetyChain, clamp, createRun, distance, dynamicBlocked, emptyHud, formatTime, logAction, nearbyAction, objectiveFor, objectiveTarget, profileId, removeMistake, requiredEvidence, rewindExplanation, safetyPath, safetyQuestion, spawnParticles, spawnScenarioBoss, updateEffects } from "./game-data";
import { drawWorld } from "./game-renderer";

const REVIEW_QUEUE_KEY="gaskeeper-review-queue-v1";
function loadReviewQueue():PendingMistake[]{
  if(typeof window==="undefined")return[];
  try{const raw=window.localStorage.getItem(REVIEW_QUEUE_KEY);return raw?JSON.parse(raw) as PendingMistake[]:[];}catch{return[];}
}
function saveReviewQueue(list:PendingMistake[]){
  if(typeof window==="undefined")return;
  try{window.localStorage.setItem(REVIEW_QUEUE_KEY,JSON.stringify(list));}catch{}
}

function HeroPortrait(){
  return <div className="hero-portrait" aria-label="가스안전 수호기사 가온">
    <div className="portrait-halo"/><div className="portrait-staff"><i/><b/></div>
    <div className="portrait-body"><span className="portrait-badge">G</span></div>
    <div className="portrait-head"><span className="portrait-visor"/></div>
    <div className="portrait-shield">GAS<br/><small>SAFE</small></div>
    <div className="portrait-name"><small>가스안전 수호기사</small><b>가온</b></div>
  </div>;
}

export default function Home(){
  const [screen,setScreen]=useState<Screen>("title");
  const [difficulty,setDifficulty]=useState<Difficulty>("elementary");
  const [scenarioChoice,setScenarioChoice]=useState<ScenarioChoice>("random");
  const [scenarioId,setScenarioId]=useState<ScenarioId>("kitchen");
  const [teacherMode,setTeacherMode]=useState(false);
  const [coOp,setCoOp]=useState(false);
  const [experienceMode,setExperienceMode]=useState<"action"|"story">("action");
  const [storyStep,setStoryStep]=useState(0);
  const [storyWrong,setStoryWrong]=useState(0);
  const [storySparkHits,setStorySparkHits]=useState(0);
  const [storyStartedAt,setStoryStartedAt]=useState(0);
  const [voiceEnabled,setVoiceEnabled]=useState(true);
  const [reducedFx,setReducedFx]=useState(false);
  const [largeText,setLargeText]=useState(false);
  const [leftHanded,setLeftHanded]=useState(false);
  const [showTouchGuide,setShowTouchGuide]=useState(false);
  const [showMissionPanel,setShowMissionPanel]=useState(false);
  const [stick,setStick]=useState({x:0,y:0});
  const [hud,setHud]=useState<Hud>(()=>emptyHud("elementary"));
  const [message,setMessage]=useState("관제관의 지시를 확인하세요.");
  const [activeQuestion,setActiveQuestion]=useState<InteractableId|null>(null);
  const [feedback,setFeedback]=useState<{correct:boolean;text:string;note:string}|null>(null);
  const [rewindInfo,setRewindInfo]=useState<RewindInfo|null>(null);
  const [activeDeduction,setActiveDeduction]=useState(false);
  const [deductionFeedback,setDeductionFeedback]=useState<{correct:boolean;text:string}|null>(null);
  const [deductionEvidence,setDeductionEvidence]=useState<string[]>([]);
  const [reviewQueue,setReviewQueue]=useState<PendingMistake[]>(()=>loadReviewQueue());
  const [reviewFeedback,setReviewFeedback]=useState<{correct:boolean;text:string;note:string}|null>(null);
  const [reviewBannerDismissed,setReviewBannerDismissed]=useState(false);
  const [result,setResult]=useState<ResultData|null>(null);
  const [sessionReports,setSessionReports]=useState<ResultData[]>([]);
  const [showDashboard,setShowDashboard]=useState(false);
  const [dashboardReports,setDashboardReports]=useState<DashboardReport[]>([]);
  const [profile,setProfile]=useState<ProgressProfile>({xp:0,streak:0,missions:0,bestIndex:0,badges:[],sensorLevel:1,suitTier:1});
  const [coopCode,setCoopCode]=useState("");
  const [coopConnected,setCoopConnected]=useState(false);
  const [coopQr,setCoopQr]=useState("");
  const [controllerMode,setControllerMode]=useState(false);
  const [controllerStatus,setControllerStatus]=useState("연결 코드를 확인하고 대기하세요.");
  const canvasRef=useRef<HTMLCanvasElement|null>(null);
  const runRef=useRef<RunState|null>(null);
  const pausedRef=useRef(false);
  const inputRef=useRef({up:false,down:false,left:false,right:false,axisX:0,axisY:0});
  const joystickPointerRef=useRef<number|null>(null);
  const pulseTimerRef=useRef<ReturnType<typeof setInterval>|null>(null);
  const coopLastIdRef=useRef(0);
  const audioRef=useRef<AudioContext|null>(null);
  const cfg=DIFFICULTIES[difficulty];
  const scenario=SCENARIOS[scenarioId];
  const currentQuestion=activeQuestion?safetyQuestion(activeQuestion,difficulty,scenarioId):null;

  const tone=useCallback((frequency:number,duration=.08,type:OscillatorType="sine",pan=0)=>{
    try{const AudioCtor=window.AudioContext||(window as typeof window & {webkitAudioContext:typeof AudioContext}).webkitAudioContext;const ac=audioRef.current??new AudioCtor();audioRef.current=ac;const o=ac.createOscillator(),g=ac.createGain(),p=ac.createStereoPanner();o.type=type;o.frequency.value=frequency;p.pan.value=clamp(pan,-1,1);g.gain.setValueAtTime(.055,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);o.connect(g);g.connect(p);p.connect(ac.destination);o.start();o.stop(ac.currentTime+duration);}catch{}
  },[]);

  const speak=useCallback((text:string)=>{if(!voiceEnabled||typeof window==="undefined"||!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang="ko-KR";utterance.rate=1.02;window.speechSynthesis.speak(utterance);},[voiceEnabled]);
  const haptic=useCallback((pattern:number|number[]=16)=>{if(typeof navigator!=="undefined"&&"vibrate" in navigator)navigator.vibrate(pattern);},[]);

  const syncHud=useCallback(()=>{
    const r=runRef.current;if(!r)return;const boss=r.enemies.find(e=>e.kind==="boss"&&e.hp>0),nearby=nearbyAction(r);
    setHud({hp:Math.max(0,Math.ceil(r.player.hp)),maxHp:r.player.maxHp,score:Math.round(r.score),seconds:r.seconds,seals:r.completed.size,medkits:r.medkits,defeated:r.defeated,objective:objectiveFor(r),pulseReady:1-clamp(r.pulseWait/cfg.cooldown,0,1),bossHp:boss?.hp??0,bossMax:boss?.maxHp??0,knowledge:r.knowledge.size,rescued:r.rescued.size,sensorLevel:Math.max(profile.sensorLevel,1+r.knowledge.size),respawned:r.respawned,living:r.enemies.filter(e=>e.kind!=="boss"&&e.hp>0).length,gasLevel:r.gasLevel,detectedLeak:r.detectedLeak,bossShielded:!!boss&&r.bossBreak<5,nearbyLabel:nearby.label,canInteract:nearby.ready,guideAge:r.guideAge,droneReady:1-clamp(r.droneWait/14,0,1),droneActive:r.droneAge>0,shieldReady:1-clamp(r.shieldWait/16,0,1),shieldActive:r.shieldAge>0,ventReady:1-clamp(r.ventWait/18,0,1),ventActive:r.ventAge>0,eventLabel:r.eventLabel,eventTimer:r.eventTimer,coopActions:r.coopActions,evidence:r.evidence.size,evidenceNeeded:requiredEvidence(r),safeChain:r.safeChain,maxSafeChain:r.maxSafeChain,bossBreak:r.bossBreak,crisisActive:r.crisisActive,crisisTimer:r.crisisTimer});
  },[cfg.cooldown,profile.sensorLevel]);

  const saveMission=useCallback(async(report:ResultData)=>{try{const response=await fetch("/api/reports",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({profileId:profileId(),report})});if(response.ok){const data=await response.json() as {report:DashboardReport;profile:ProgressProfile};setDashboardReports(prev=>[data.report,...prev.filter(item=>item.id!==data.report.id)]);setProfile(data.profile);}}catch{}},[]);

  const loadDashboard=useCallback(async()=>{try{const response=await fetch(`/api/reports?profileId=${encodeURIComponent(profileId())}`);if(response.ok){const data=await response.json() as {reports:DashboardReport[];profile:ProgressProfile};setDashboardReports(data.reports);setProfile(data.profile);}}catch{}setShowDashboard(true);},[]);

  const createCoopSession=useCallback(async()=>{const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let code="";for(let i=0;i<6;i++)code+=alphabet[Math.floor(Math.random()*alphabet.length)];setCoopCode(code);setCoopConnected(false);coopLastIdRef.current=0;try{await fetch("/api/coop",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({op:"create",code})});const url=`${window.location.origin}/?controller=${code}`;setCoopQr(await QRCode.toDataURL(url,{width:228,margin:1,color:{dark:"#081014",light:"#effffb"}}));}catch{setMessage("협동 연결을 준비하지 못했습니다. 한 화면 2인 모드로 계속할 수 있습니다.");}return code;},[]);

  const sendControllerAction=useCallback(async(action:string)=>{if(!coopCode)return;setControllerStatus("입력 전송 중…");try{const response=await fetch("/api/coop",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({op:"action",code:coopCode,action})});setControllerStatus(response.ok?`${action==="pulse"?"탐지 펄스":action==="interact"?"안전 행동":action==="medkit"?"안전키트":action==="drone"?"차단 드론":action==="shield"?"보호막":"환기 유도기"} 입력 완료`:`연결이 끊어졌습니다.`);haptic(response.ok?24:[50,40,50]);}catch{setControllerStatus("전송 실패 · 연결 상태를 확인하세요.");}},[coopCode,haptic]);

  const recordMistake=useCallback((questionId:InteractableId)=>{
    setReviewQueue(prev=>{const next=addMistake(prev,{questionId,scenarioId,difficulty,at:Date.now()});saveReviewQueue(next);return next;});
  },[difficulty,scenarioId]);

  const finishRun=useCallback((victory:boolean)=>{
    const r=runRef.current;if(!r||r.finished)return;r.finished=true;pausedRef.current=true;
    const timeBonus=victory?Math.round(r.seconds*3):0;const hpBonus=victory?Math.round(Math.max(0,r.player.hp)*2):0;const final=Math.max(0,Math.round(r.score+timeBonus+hpBonus));
    const timeUsed=cfg.time-Math.max(0,r.seconds),safetyJudgment=clamp(Math.round(100-r.wrongChoices*18-r.sparkHits*5),0,100),goldenTime=clamp(Math.round(victory?72+r.seconds/cfg.time*28:34-r.gasExposure),0,100),rescueScore=Math.round(r.rescued.size/RESCUES.length*100),knowledgeScore=Math.round((r.completed.size/3*.72+r.knowledge.size/TABLETS.length*.28)*100),safetyIndex=Math.round(safetyJudgment*.4+goldenTime*.25+rescueScore*.2+knowledgeScore*.15);
    logAction(r,victory?"👑":"📜",victory?"임무 완수":"임무 종료",victory?`${SCENARIOS[r.scenarioId].boss} 봉인 성공`:"골든타임 안에 임무를 완수하지 못함",victory?"safe":"danger");
    const report:ResultData={victory,score:final,timeUsed,hp:Math.max(0,Math.round(r.player.hp)),seals:r.completed.size,defeated:r.defeated,knowledge:r.knowledge.size,rescued:r.rescued.size,scenarioId:r.scenarioId,difficulty,safetyJudgment,goldenTime,rescueScore,knowledgeScore,safetyIndex,wrongChoices:r.wrongChoices,sparkHits:r.sparkHits,gasExposure:r.gasExposure,pulseCount:r.pulseCount,lastMistake:r.lastMistake,coopActions:r.coopActions,createdAt:new Date().toISOString(),timeline:[...r.actionLog],maxCombo:r.maxSafeChain,evidenceCount:r.evidence.size,crisisSuccess:r.crisisSuccess,crisisHandled:r.crisisHandled};
    setResult(report);setSessionReports(prev=>[...prev,report]);void saveMission(report);
    tone(victory?659:130,.28,victory?"triangle":"sawtooth");setTimeout(()=>setScreen("result"),350);
  },[cfg.time,difficulty,saveMission,tone]);

  const detectorPulse=useCallback(()=>{
    if(screen!=="game"||pausedRef.current)return;const r=runRef.current;if(!r||r.pulseWait>0)return;
    r.pulseWait=cfg.cooldown;r.pulseAge=0;r.pulseCount++;r.guidePath=safetyPath(r);r.guideAge=cfg.pathSeconds;tone(430,.1,"triangle");let hits=0,shieldHit=false;
    const leak=SCENARIOS[r.scenarioId].leak;if(!r.detectedLeak&&distance(r.player.x,r.player.y,leak.x,leak.y)<225){const needed=requiredEvidence(r);if(r.evidence.size<needed){setMessage(`추리에 필요한 현장 단서가 부족합니다. 단서 ${needed-r.evidence.size}개를 더 수집하세요.`);tone(165,.1,"square");}else{setDeductionEvidence([...r.evidence]);setActiveDeduction(true);setDeductionFeedback(null);pausedRef.current=true;setMessage("증거 보드 활성화 · 수집한 단서로 실제 누출원을 판정하세요.");tone(780,.16,"triangle");}}
    const sensorBoost=(1+r.knowledge.size*.08)*(1+r.completed.size*.16);const radiusBoost=r.knowledge.size*14;
    r.enemies.forEach(e=>{if(e.hp<=0)return;const radius=cfg.pulseRange+(e.kind==="boss"?22:0)+radiusBoost;if(distance(r.player.x,r.player.y,e.x,e.y)<=radius){if(e.kind==="boss"&&r.bossBreak<5){shieldHit=true;return;}e.hp-=(e.kind==="boss"?cfg.damage*.72:cfg.damage)*sensorBoost;hits++;if(e.hp<=0){r.defeated++;r.score+=e.kind==="boss"?650:70;if(e.respawnable&&!r.completed.has("valve"))e.respawnWait=cfg.respawn;if(e.kind!=="boss"&&r.defeated%3===0)r.medkits++;spawnParticles(r,e.x,e.y,e.kind==="boss"?SCENARIOS[r.scenarioId].bossColor:"#ffb24d",e.kind==="boss"?42:16,reducedFx);addShake(r,e.kind==="boss"?.6:.22,reducedFx);}}});
    if(shieldHit){setMessage(`보스 브레이크 ${r.bossBreak}/5 · 탐지→차단→환기→대피→신고 행동을 완성하세요.`);tone(112,.13,"sawtooth");}
    if(hits){r.score+=hits*10;tone(235,.07,"square");}
    const boss=r.enemies.find(e=>e.kind==="boss");if(boss&&boss.hp<=0)finishRun(true);syncHud();
  },[cfg.cooldown,cfg.damage,cfg.pathSeconds,cfg.pulseRange,cfg.respawn,finishRun,reducedFx,screen,syncHud,tone]);

  const activateDrone=useCallback(()=>{const r=runRef.current;if(screen!=="game"||pausedRef.current||!r||!r.detectedLeak||r.droneWait>0)return;r.droneWait=14;r.droneAge=5;r.score+=35;r.enemies.forEach(e=>{if(e.hp<=0&&e.respawnable)e.respawnWait+=4;});setMessage("자동 차단 드론 전개! 가스 균열의 재출현을 지연하고 위험체를 둔화합니다.");tone(910,.12,"square");haptic([18,25,18]);syncHud();},[haptic,screen,syncHud,tone]);
  const activateShield=useCallback(()=>{const r=runRef.current;if(screen!=="game"||pausedRef.current||!r||(r.completed.size<1&&r.rescued.size<1)||r.shieldWait>0)return;r.shieldWait=16;r.shieldAge=5;r.score+=30;setMessage("안전 보호막 전개! 5초 동안 가스·충격 피해가 크게 줄어듭니다.");tone(620,.16,"triangle");haptic(40);syncHud();},[haptic,screen,syncHud,tone]);
  const activateVentGuide=useCallback(()=>{const r=runRef.current;if(screen!=="game"||pausedRef.current||!r||!r.completed.has("vent")||r.ventWait>0)return;r.ventWait=18;r.ventAge=6;r.gasLevel=Math.max(.1,r.gasLevel-.2);r.score+=35;setMessage("환기 유도기 가동! 안전한 바람길이 가스를 밀어내고 위험체를 뒤로 보냅니다.");r.enemies.forEach(e=>{if(e.hp>0){const d=Math.max(1,distance(r.player.x,r.player.y,e.x,e.y));e.x=clamp(e.x+(e.x-r.player.x)/d*55,35,WORLD.w-35);e.y=clamp(e.y+(e.y-r.player.y)/d*55,35,WORLD.h-35);}});tone(740,.18,"sine");haptic([20,30,30]);syncHud();},[haptic,screen,syncHud,tone]);

  const activateMedkit=useCallback(()=>{
    if(screen!=="game"||pausedRef.current)return;const r=runRef.current;if(!r||r.medkits<=0||r.player.hp>=r.player.maxHp)return;
    r.medkits--;r.player.hp=Math.min(r.player.maxHp,r.player.hp+38);setMessage("응급 안전키트로 보호력을 회복했습니다.");tone(720,.15,"sine");haptic([18,25,24]);syncHud();
  },[haptic,screen,syncHud,tone]);

  const answerDeduction=useCallback((choice:DeductionChoice)=>{const r=runRef.current;if(!r||deductionFeedback)return;if(choice.correct){r.detectedLeak=true;r.score+=150;awardSafetyStep(r,1,"누출원 추리",choice.feedback);r.guidePath=safetyPath(r);r.guideAge=cfg.pathSeconds;setDeductionFeedback({correct:true,text:`${choice.feedback} 누출원 좌표가 확정되었습니다.`});tone(860,.18,"triangle");haptic([25,35,70]);}else{r.wrongChoices++;r.lastMistake=choice.label;r.gasLevel=Math.min(1.48,r.gasLevel+.12);r.player.hp=Math.max(1,r.player.hp-cfg.wrongDamage*.6);breakSafetyChain(r,"추리 오류",choice.feedback);setDeductionFeedback({correct:false,text:`${choice.feedback} 증거를 다시 연결해 판정하세요.`});tone(112,.16,"sawtooth");haptic([45,30,75]);}syncHud();},[cfg.pathSeconds,cfg.wrongDamage,deductionFeedback,haptic,syncHud,tone]);

  const closeDeduction=useCallback(()=>{if(!deductionFeedback)return;if(deductionFeedback.correct){setActiveDeduction(false);setDeductionFeedback(null);pausedRef.current=false;setMessage("SAFE ×1 · 누출원 추리 성공! 전기·화기 조작 없이 차단 밸브로 이동하세요.");speak("누출원 추리 성공. 전기기구 조작 금지. 차단 밸브로 이동하세요.");}else setDeductionFeedback(null);},[deductionFeedback,speak]);

  const resolveCrisis=useCallback((choice:CrisisChoice)=>{const r=runRef.current;if(!r||!r.crisisActive)return;r.crisisActive=false;r.crisisHandled=true;if(choice.correct){r.crisisSuccess=true;const bonus=140+Math.ceil(r.crisisTimer)*20;r.score+=Math.round(bonus*(1+r.safeChain*.18));logAction(r,"⏱","골든타임 세이브",`${choice.feedback} · +${bonus}점`,"safe");setMessage(`GOLDEN SAVE! ${choice.feedback}`);tone(940,.2,"triangle");haptic([25,25,90]);}else{r.wrongChoices++;r.lastMistake=choice.label;r.gasLevel=Math.min(1.48,r.gasLevel+.16);r.player.hp=Math.max(1,r.player.hp-cfg.wrongDamage);if(choice.hazard==="spark"){r.sparkHits++;r.sparkBurst=1.3;}breakSafetyChain(r,"위기 판단 실패",choice.feedback);setMessage(`위기 결과: ${choice.feedback}`);tone(96,.18,"sawtooth");haptic([60,35,100]);}r.crisisTimer=0;syncHud();},[cfg.wrongDamage,haptic,syncHud,tone]);

  const interact=useCallback(()=>{
    if(screen!=="game"||pausedRef.current)return;const r=runRef.current;if(!r)return;
    const evidence=EVIDENCE[r.scenarioId].find(item=>distance(r.player.x,r.player.y,item.x,item.y)<68);
    if(evidence){if(r.evidence.has(evidence.id)){setMessage(`${evidence.label} 단서는 이미 증거 보드에 기록되었습니다.`);return;}r.evidence.add(evidence.id);r.score+=65;logAction(r,evidence.icon,"현장 단서 수집",`${evidence.label} · ${evidence.value}`,"clue");r.guidePath=safetyPath(r);r.guideAge=cfg.pathSeconds;const needed=requiredEvidence(r),ready=r.evidence.size>=needed;setMessage(ready?`증거 ${r.evidence.size}/${needed} 확보! 누출 의심 지점에서 탐지 펄스를 사용해 추리하세요.`:`${evidence.value} · 단서 ${r.evidence.size}/${needed}`);tone(ready?780:610,.12,"triangle");haptic([20,20,35]);syncHud();return;}
    const rescue=RESCUES.find(s=>distance(r.player.x,r.player.y,s.x,s.y)<68);
    if(rescue){if(r.rescued.has(rescue.id)){setMessage(`${rescue.label}은 이미 안전구역으로 대피했습니다.`);return;}if(!r.completed.has("vent")){setMessage("공급 차단과 자연환기를 먼저 완료해 안전한 대피 경로를 확보하세요.");tone(125,.1,"sawtooth");return;}const firstRescue=r.rescued.size===0;r.rescued.add(rescue.id);r.rescueMarkerAge=8;r.score+=110;r.medkits++;if(firstRescue){awardSafetyStep(r,4,"인명 대피",rescue.tip);spawnScenarioBoss(r);}else logAction(r,rescue.icon,"추가 구조",rescue.tip,"safe");r.guidePath=safetyPath(r);r.guideAge=cfg.pathSeconds;setMessage(firstRescue?`${rescue.tip} ${SCENARIOS[r.scenarioId].boss} 출현! 신고를 완료해 보호막을 파괴하세요.`:`${rescue.label} 추가 대피 완료!`);tone(680,.14,"triangle");haptic(120);syncHud();return;}
    const station=STATIONS.find(s=>distance(r.player.x,r.player.y,s.x,s.y)<72);const tablet=TABLETS.find(s=>distance(r.player.x,r.player.y,s.x,s.y)<72);const nearby=station??tablet;
    if(!nearby){setMessage("빛나는 제단·석판 또는 구조 대상 가까이에서 상호작용하세요.");tone(150,.05,"square");return;}
    if(station&&r.completed.has(station.id)){setMessage(`${station.label}은 이미 안전하게 복구되었습니다.`);return;}
    if(tablet&&r.knowledge.has(tablet.id)){setMessage(`${tablet.label}의 지식을 이미 기록했습니다.`);return;}
    if(station?.id==="valve"&&!r.detectedLeak){setMessage("먼저 방폭 탐지 펄스로 정확한 누출원을 특정해야 합니다.");tone(128,.12,"sawtooth");return;}
    if(station){const required:StationId|null=station.id==="vent"?"valve":station.id==="report"?"vent":null;if(required&&!r.completed.has(required)){setMessage(required==="valve"?"먼저 서부 배관실의 밸브를 차단해야 합니다.":"먼저 환기 기록실의 자연 환기문을 열어야 합니다.");tone(120,.12,"sawtooth");return;}if(station.id==="report"&&r.rescued.size<1){setMessage("신고 전에 구조 대상을 가스가 없는 안전구역으로 대피시키세요.");tone(120,.12,"sawtooth");return;}}
    setActiveQuestion(nearby.id);setFeedback(null);pausedRef.current=true;tone(520,.08,"triangle");
  },[cfg.pathSeconds,haptic,screen,syncHud,tone]);

  const answer=useCallback((choice:QuestionChoice)=>{
    const r=runRef.current;if(!r||!activeQuestion||feedback)return;
    if(choice.correct){
      const isMain=STATIONS.some(s=>s.id===activeQuestion);
      if(isMain){r.completed.add(activeQuestion as StationId);r.score+=180;r.player.hp=Math.min(r.player.maxHp,r.player.hp+8);if(activeQuestion==="valve"){r.enemies.forEach(e=>{if(e.kind!=="boss")e.respawnable=false;});r.score+=120;awardSafetyStep(r,2,"공급 차단",choice.feedback);}if(activeQuestion==="vent"){r.gasLevel=Math.min(r.gasLevel,.72);awardSafetyStep(r,3,"자연환기",choice.feedback);}if(activeQuestion==="report"){awardSafetyStep(r,5,"안전 신고",choice.feedback);spawnScenarioBoss(r);}}else{r.knowledge.add(activeQuestion as LoreId);r.score+=145;r.player.hp=Math.min(r.player.maxHp,r.player.hp+5);logAction(r,"📜","안전지식 해독",choice.feedback,"clue");}r.guidePath=safetyPath(r);r.guideAge=cfg.pathSeconds;
      setFeedback({correct:true,text:choice.feedback,note:currentQuestion?.correctNote??QUESTIONS[activeQuestion].correctNote});tone(784,.16,"triangle");
      spawnParticles(r,r.player.x,r.player.y-20,"#f0d27b",22,reducedFx);
      setRewindInfo(null);if(activeQuestion==="valve")haptic(180);else haptic([24,30,24]);
    }else{
      r.wrongChoices++;r.lastMistake=choice.label;const rewind=rewindExplanation(choice,difficulty),electrical=rewind.hazard==="spark";if(electrical){r.sparkHits++;r.sparkBurst=1.25;r.hitFlash=1;r.player.hp=Math.max(1,r.player.hp-cfg.wrongDamage*1.35);}else r.player.hp=Math.max(1,r.player.hp-cfg.wrongDamage);r.score=Math.max(0,r.score-(electrical?70:40));breakSafetyChain(r,"위험 행동",`${choice.label} → ${rewind.result}`);setFeedback({correct:false,text:choice.feedback,note:currentQuestion?.correctNote??QUESTIONS[activeQuestion].correctNote});setRewindInfo({choice:choice.label,cause:rewind.cause,result:rewind.result,hazard:rewind.hazard});recordMistake(activeQuestion);tone(108,.18,"sawtooth");haptic([45,35,45,35,110]);
    }
    syncHud();
  },[activeQuestion,cfg.pathSeconds,cfg.wrongDamage,currentQuestion,difficulty,feedback,haptic,reducedFx,recordMistake,syncHud,tone]);

  const closeQuestion=useCallback(()=>{
    if(!feedback)return;if(feedback.correct){const r=runRef.current;const all=r?.completed.size===3;const lore=activeQuestion?TABLETS.some(t=>t.id===activeQuestion):false;const bossMessage=r&&r.rescued.size<1?`구조 대상을 먼저 대피시켜 ${SCENARIOS[r.scenarioId].boss}의 보호막을 해제하세요!`:`세 안전인장이 모였습니다. 탐지 펄스로 ${r?SCENARIOS[r.scenarioId].boss:"보스"}를 봉인하세요!`;setMessage(lore?`지식석판을 해독했습니다. 탐지기가 LV.${1+(r?.knowledge.size??0)}로 강화되었습니다!`:all?bossMessage:activeQuestion==="valve"?"공급 차단 완료! 자동 차단 드론이 해금되고 가스 균열 재출현이 멈췄습니다.":activeQuestion==="vent"?"자연환기 시작! 환기 유도기가 해금되었습니다.":"안전인장을 획득했습니다. 다음 구역으로 이동하세요.");setActiveQuestion(null);setFeedback(null);setRewindInfo(null);pausedRef.current=false;}else{setFeedback(null);setRewindInfo(null);}
  },[activeQuestion,feedback]);

  const prepareBriefing=useCallback(()=>{const ids=Object.keys(SCENARIOS) as ScenarioId[];const chosen=scenarioChoice==="random"?ids[Math.floor(Math.random()*ids.length)]:scenarioChoice;setScenarioId(chosen);setScreen("briefing");if(coOp)void createCoopSession();tone(460,.1,"triangle");},[coOp,createCoopSession,scenarioChoice,tone]);

  const startRun=useCallback(()=>{
    const coarse=typeof window!=="undefined"&&window.matchMedia("(pointer: coarse)").matches,fresh=createRun(difficulty,scenarioId);if(difficulty==="elementary")fresh.guidePath=safetyPath(fresh);runRef.current=fresh;pausedRef.current=coarse;inputRef.current={up:false,down:false,left:false,right:false,axisX:0,axisY:0};setStick({x:0,y:0});setShowTouchGuide(coarse);setShowMissionPanel(false);setHud(emptyHud(difficulty));const opening=`${scenario.place} 사고 발생. 빛나는 현장 단서를 수집하고 누출원을 추리하세요.`;setMessage(opening);setActiveQuestion(null);setFeedback(null);setRewindInfo(null);setActiveDeduction(false);setDeductionFeedback(null);setDeductionEvidence([]);setResult(null);setScreen("game");tone(392,.12,"triangle");if(!coarse)speak(opening);
  },[difficulty,scenario.place,scenarioId,speak,tone]);

  const startStoryRun=useCallback(()=>{
    setStoryStep(1);setStoryWrong(0);setStorySparkHits(0);setStoryStartedAt(Date.now());
    setDeductionEvidence(EVIDENCE[scenarioId].map(item=>item.id));setActiveDeduction(true);setDeductionFeedback(null);
    setActiveQuestion(null);setFeedback(null);setRewindInfo(null);setResult(null);
    setMessage(`${scenario.place} 사고 기록을 검토하고 있습니다. 시간 압박 없이 차근차근 판단하세요.`);
    setScreen("story");tone(392,.12,"triangle");
  },[scenario.place,scenarioId,tone]);

  const storyAnswerDeduction=useCallback((choice:DeductionChoice)=>{
    if(deductionFeedback)return;
    if(choice.correct){setDeductionFeedback({correct:true,text:choice.feedback});tone(860,.18,"triangle");}
    else{setStoryWrong(w=>w+1);setDeductionFeedback({correct:false,text:choice.feedback});tone(112,.16,"sawtooth");}
  },[deductionFeedback,tone]);

  const storyCloseDeduction=useCallback(()=>{
    if(!deductionFeedback)return;
    if(!deductionFeedback.correct){setDeductionFeedback(null);return;}
    setActiveDeduction(false);setDeductionFeedback(null);setStoryStep(2);setActiveQuestion("valve");setFeedback(null);setRewindInfo(null);
    setMessage("추리 성공! 전기·화기 조작 없이 차단 밸브부터 순서대로 판단하세요.");
  },[deductionFeedback]);

  const storyAnswer=useCallback((choice:QuestionChoice)=>{
    if(feedback)return;
    if(choice.correct){setFeedback({correct:true,text:choice.feedback,note:currentQuestion?.correctNote??""});tone(784,.16,"triangle");}
    else{setStoryWrong(w=>w+1);const rewind=rewindExplanation(choice,difficulty);if(rewind.hazard==="spark")setStorySparkHits(s=>s+1);setFeedback({correct:false,text:choice.feedback,note:currentQuestion?.correctNote??""});if(activeQuestion)recordMistake(activeQuestion);tone(108,.18,"sawtooth");}
  },[activeQuestion,currentQuestion,difficulty,feedback,recordMistake,tone]);

  const storyCloseQuestion=useCallback(()=>{
    if(!feedback)return;
    if(!feedback.correct){setFeedback(null);return;}
    setFeedback(null);setRewindInfo(null);
    const order:StationId[]=["valve","vent","report"];
    const currentIndex=activeQuestion?order.indexOf(activeQuestion as StationId):-1;
    const next=order[currentIndex+1];
    if(next){setActiveQuestion(next);setMessage(`${STATIONS.find(s=>s.id===next)?.label} 판단으로 이동합니다.`);}
    else{setActiveQuestion(null);setStoryStep(5);setMessage("마지막으로 5초 위기 상황을 판단해 보세요. 시간 제한은 없습니다.");}
  },[activeQuestion,feedback]);

  const storyResolveCrisis=useCallback((choice:CrisisChoice)=>{
    const wrong=choice.correct?storyWrong:storyWrong+1;
    const sparkHits=(!choice.correct&&choice.hazard==="spark")?storySparkHits+1:storySparkHits;
    setStoryStep(6);setStoryWrong(wrong);setStorySparkHits(sparkHits);
    const elapsed=storyStartedAt?Math.round((Date.now()-storyStartedAt)/1000):0;
    const safetyJudgment=clamp(Math.round(100-wrong*18),0,100),goldenTime=80,rescueScore=100,knowledgeScore=safetyJudgment;
    const safetyIndex=Math.round(safetyJudgment*.4+goldenTime*.25+rescueScore*.2+knowledgeScore*.15);
    const report:ResultData={victory:true,score:Math.max(0,600-wrong*80),timeUsed:elapsed,hp:cfg.hp,seals:3,defeated:0,knowledge:0,rescued:1,scenarioId,difficulty,safetyJudgment,goldenTime,rescueScore,knowledgeScore,safetyIndex,wrongChoices:wrong,sparkHits,gasExposure:0,pulseCount:0,lastMistake:wrong>0?"스토리 모드 재판단":"",coopActions:0,createdAt:new Date().toISOString(),maxCombo:0,evidenceCount:EVIDENCE[scenarioId].length,crisisSuccess:sparkHits===0,crisisHandled:true};
    setResult(report);setSessionReports(prev=>[...prev,report]);void saveMission(report);
    tone(choice.correct?659:130,.28,choice.correct?"triangle":"sawtooth");setTimeout(()=>setScreen("result"),350);
  },[cfg.hp,difficulty,saveMission,scenarioId,storySparkHits,storyStartedAt,storyWrong,tone]);

  useEffect(()=>{
    if(screen!=="game")return;let frame=0,last=performance.now(),hudClock=0;
    const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;
    const dpr=Math.min(window.devicePixelRatio||1,2.5);
    const syncCanvasResolution=()=>{
      const rect=canvas.getBoundingClientRect(),w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      ctx.setTransform(w/960,0,0,h/576,0,0);
    };
    syncCanvasResolution();
    const loop=(now:number)=>{
      syncCanvasResolution();
      const r=runRef.current;if(!r||r.finished)return;const dt=Math.min(.034,(now-last)/1000);last=now;
      r.sparkBurst=Math.max(0,r.sparkBurst-dt);updateEffects(r,dt);
      if(!pausedRef.current){
        r.seconds-=dt;r.pulseWait=Math.max(0,r.pulseWait-dt);r.pulseAge+=dt;r.guideAge=Math.max(0,r.guideAge-dt);r.hitFlash=Math.max(0,r.hitFlash-dt*2.4);r.trapWait=Math.max(0,r.trapWait-dt);r.alertWait=Math.max(0,r.alertWait-dt);r.droneWait=Math.max(0,r.droneWait-dt);r.droneAge=Math.max(0,r.droneAge-dt);r.shieldWait=Math.max(0,r.shieldWait-dt);r.shieldAge=Math.max(0,r.shieldAge-dt);r.ventWait=Math.max(0,r.ventWait-dt);r.ventAge=Math.max(0,r.ventAge-dt);r.eventTimer=Math.max(0,r.eventTimer-dt);r.bossPatternWait=Math.max(0,r.bossPatternWait-dt);r.rescueMarkerAge=Math.max(0,r.rescueMarkerAge-dt);if(r.crisisActive){r.crisisTimer=Math.max(0,r.crisisTimer-dt);if(r.crisisTimer<=0){r.crisisActive=false;r.crisisHandled=true;r.wrongChoices++;r.lastMistake="골든타임 판단 지연";r.gasLevel=Math.min(1.48,r.gasLevel+.18);r.player.hp=Math.max(1,r.player.hp-cfg.wrongDamage);breakSafetyChain(r,"골든타임 초과","5초 안에 위험 행동을 차단하지 못해 사고가 확대됨");setMessage("골든타임 실패! 판단이 늦어 가스 농도와 위험도가 상승했습니다.");tone(88,.2,"sawtooth");haptic([80,40,120]);}}
        const leakGrowth=cfg.gasGrowth*(r.scenarioId==="camping"?1.25:r.scenarioId==="restaurant"?1.12:1);if(!r.completed.has("valve"))r.gasLevel=Math.min(1.48,r.gasLevel+dt*leakGrowth);else if(!r.completed.has("vent"))r.gasLevel=Math.max(.7,r.gasLevel-dt*.035);else r.gasLevel=Math.max(.12,r.gasLevel-dt*(r.ventAge>0?.62:.38));
        if(r.scenarioId==="camping"&&!r.completed.has("valve"))r.overheat=Math.min(92,r.overheat+dt*.36);
        const elapsed=cfg.time-r.seconds;if(r.eventCount<cfg.events&&r.eventTimer<=0&&elapsed>=r.nextEventAt){const eventIndex=r.eventCount;r.eventCount++;r.eventTriggered=true;r.eventTimer=difficulty==="high"?10:9;r.nextEventAt+=cfg.eventGap;if(eventIndex===0&&r.scenarioId==="laboratory"){r.eventType="sensor";r.eventLabel="센서 03 통신 두절 · 현장 표지로 이동";}else if(eventIndex===0&&r.scenarioId==="restaurant"){r.eventType="shift";r.eventLabel="LPG 저류 방향 변경 · 낮은 통로 주의";r.gasLevel=Math.min(1.48,r.gasLevel+.18);}else if(eventIndex===0&&r.scenarioId==="camping"){r.eventType="spark";r.eventLabel="부탄캔 과열 경보 · 즉시 거리 확보";r.sparkBurst=difficulty==="elementary"?1.25:2.2;}else if(eventIndex===0){r.eventType="rift";r.eventLabel="후드 센서 단선 · 신규 가스 균열";r.enemies.push({id:`event-rift-${eventIndex}`,x:610,y:450,spawnX:610,spawnY:450,hp:cfg.enemyHp,maxHp:cfg.enemyHp,kind:"wisp",phase:3.1,hitWait:0,respawnWait:0,respawnable:!r.completed.has("valve")});}else if(eventIndex===1){r.eventType="block";r.eventLabel="방화셔터 오작동 · 중앙 통로 10초 폐쇄";r.gasLevel=Math.min(1.48,r.gasLevel+.12);}else{r.eventType="rift";r.eventLabel="연쇄 가스 균열 · 위험체와 스파크 동시 발생";r.sparkBurst=1.5;for(let i=0;i<2;i++)r.enemies.push({id:`surge-${Date.now()}-${i}`,x:790+i*82,y:520+i*70,spawnX:790+i*82,spawnY:520+i*70,hp:cfg.enemyHp*.8,maxHp:cfg.enemyHp*.8,kind:i?"crawler":"wisp",phase:4+i,hitWait:.8,respawnWait:0,respawnable:false});}if(eventIndex===0&&!r.crisisHandled){r.crisisActive=true;r.crisisTimer=5;}setMessage(`돌발상황 ${r.eventCount}/${cfg.events}: ${r.eventLabel}`);speak(`돌발 상황. ${r.eventLabel}`);haptic([70,50,70]);}
        if(r.seconds<=0){r.seconds=0;finishRun(false);return;}
        const input=inputRef.current;let dx=(input.right?1:0)-(input.left?1:0)+input.axisX,dy=(input.down?1:0)-(input.up?1:0)+input.axisY;
        r.player.moving=!!(dx||dy);if(dx||dy){const len=Math.hypot(dx,dy);dx/=len;dy/=len;r.player.facingX=dx;r.player.facingY=dy;const activePoolsNow=SCENARIOS[r.scenarioId].poolIndices.map(index=>GAS_POOLS[index]),floorSlow=r.scenarioId==="restaurant"&&activePoolsNow.some(pool=>distance(r.player.x,r.player.y,pool.x,pool.y)<pool.r*r.gasLevel*.9)?.76:1;const speed=cfg.playerSpeed*floorSlow;const nx=r.player.x+dx*speed*dt,ny=r.player.y+dy*speed*dt;if(!blocked(nx,r.player.y)&&!dynamicBlocked(r,nx,r.player.y))r.player.x=nx;if(!blocked(r.player.x,ny)&&!dynamicBlocked(r,r.player.x,ny))r.player.y=ny;}
        CACHES.forEach(cache=>{if(!r.caches.has(cache.id)&&distance(r.player.x,r.player.y,cache.x,cache.y)<32){r.caches.add(cache.id);r.medkits++;r.score+=75;setMessage(`${cache.label} 발견! 안전키트 1개와 보너스 점수를 획득했습니다.`);tone(760,.12,"triangle");}});
        const activePools=SCENARIOS[r.scenarioId].poolIndices.map(index=>GAS_POOLS[index]),poolFactor=r.scenarioId==="restaurant"?.94:.72,inGas=r.gasLevel>.2&&activePools.some(pool=>distance(r.player.x,r.player.y,pool.x,pool.y)<pool.r*r.gasLevel*poolFactor);if(inGas)r.gasExposure+=dt;
        const sparkHit=SPARK_TRAPS.some(trap=>(r.sparkBurst>0||((now/1000*cfg.trapTempo+trap.phase)%4)<cfg.trapWindow)&&distance(r.player.x,r.player.y,trap.x,trap.y)<cfg.trapRadius);
        if(r.trapWait<=0&&(inGas||sparkHit)){r.trapWait=.9;const guard=r.shieldAge>0?.28:1;r.player.hp-=(sparkHit?cfg.touchDamage*.8:cfg.touchDamage*.48)*guard;r.hitFlash=.72;addShake(r,sparkHit?.45:.2,reducedFx);spawnParticles(r,r.player.x,r.player.y,sparkHit?"#ffcf5c":SCENARIOS[r.scenarioId].color,sparkHit?18:10,reducedFx);setMessage(sparkHit?"대형 점화 스파크 함정! 주황색 예고 링이 사라진 뒤 통과하세요.":"바닥에 고인 가스에 노출되었습니다. 자연 환기문을 서둘러 개방하세요.");tone(sparkHit?118:82,.09,"sawtooth");if(sparkHit)haptic([35,25,65]);}
        if(r.alertWait<=0){const leak=SCENARIOS[r.scenarioId].leak,leakDistance=distance(r.player.x,r.player.y,leak.x,leak.y),nearest=r.enemies.filter(e=>e.hp>0).sort((a,b)=>distance(r.player.x,r.player.y,a.x,a.y)-distance(r.player.x,r.player.y,b.x,b.y))[0];if(!r.detectedLeak&&leakDistance<430){tone(360+clamp(430-leakDistance,0,390)*1.4,.045,"square",clamp((leak.x-r.player.x)/350,-1,1));r.alertWait=clamp(leakDistance/170,.28,1.35);}else if(nearest&&distance(r.player.x,r.player.y,nearest.x,nearest.y)<220){tone(145,.045,"sine",clamp((nearest.x-r.player.x)/180,-1,1));r.alertWait=1.3;}else{const target=objectiveTarget(r);if(distance(r.player.x,r.player.y,target.x,target.y)>520){setMessage(`관제 안내: 화면 가장자리의 황금 화살표와 미니맵 NEXT 표식을 따라가세요.`);if(difficulty==="elementary")speak("탐지 펄스를 누르면 초록 안전 길이 나타납니다.");}r.alertWait=7;}}
        r.enemies.forEach(e=>{
          if(e.hp<=0){if(e.respawnable&&!r.completed.has("valve")){e.respawnWait=Math.max(0,e.respawnWait-dt);if(e.respawnWait<=0&&distance(r.player.x,r.player.y,e.spawnX,e.spawnY)>105){e.x=e.spawnX;e.y=e.spawnY;e.hp=e.maxHp;e.hitWait=.9;e.phase+=.71;r.respawned++;setMessage(`누출원이 열려 가스 균열이 다시 나타났습니다! 차단 밸브를 서두르세요.`);tone(168,.12,"sawtooth");}}return;}e.hitWait=Math.max(0,e.hitWait-dt);const d=distance(e.x,e.y,r.player.x,r.player.y);const aggro=e.kind==="boss"?cfg.aggro+220:cfg.aggro;
          if(d<aggro&&d>24){const droneSlow=r.droneAge>0?.48:1,speed=cfg.enemySpeed*(e.kind==="boss"?.78:e.kind==="crawler"?1.12:1)*droneSlow;const ex=e.x+(r.player.x-e.x)/d*speed*dt,ey=e.y+(r.player.y-e.y)/d*speed*dt;if(!blocked(ex,e.y,e.kind==="boss"?26:14))e.x=ex;if(!blocked(e.x,ey,e.kind==="boss"?26:14))e.y=ey;}
          const hitRange=e.kind==="boss"?48:28;if(d<hitRange&&e.hitWait<=0){e.hitWait=e.kind==="boss"?.72:1.05;const guard=r.shieldAge>0?.28:1;r.player.hp-=cfg.touchDamage*(e.kind==="boss"?1.65:1)*guard;r.hitFlash=1;addShake(r,e.kind==="boss"?.7:.35,reducedFx);spawnParticles(r,r.player.x,r.player.y,"#ff5a52",e.kind==="boss"?26:14,reducedFx);setMessage(e.kind==="boss"?`${SCENARIOS[r.scenarioId].boss}의 충격! 거리를 벌리고 탐지 펄스를 사용하세요.`:"가스 망령에게 노출되었습니다. 거리를 확보하세요.");tone(92,.07,"sawtooth",clamp((e.x-r.player.x)/150,-1,1));if(r.player.hp<=0){r.player.hp=0;finishRun(false);}}
        });
        const boss=r.enemies.find(e=>e.kind==="boss"&&e.hp>0);if(boss&&r.bossPatternWait<=0){r.bossPatternWait=cfg.bossCadence*(r.scenarioId==="camping"?.88:1);if(r.scenarioId==="kitchen"){const d=distance(boss.x,boss.y,r.player.x,r.player.y);if(d>88&&d<190){r.player.hp-=cfg.touchDamage*(r.shieldAge>0?.22:.72);r.hitFlash=.8;}setMessage("역화 고리 확산! 보스에게 너무 가깝거나 멀리 서지 마세요.");}else if(r.scenarioId==="restaurant"){r.gasLevel=Math.min(1.48,r.gasLevel+.1);setMessage("저류층 포식자가 바닥으로 LPG 안개를 퍼뜨립니다.");}else if(r.scenarioId==="camping"){r.sparkBurst=1.35;setMessage("블레이즈의 과열 폭발! 주황 예고 링 밖으로 이동하세요.");haptic([60,30,80]);}else{for(let i=0;i<cfg.bossSummons;i++)r.enemies.push({id:`code-${Date.now()}-${i}`,x:boss.x+(i-(cfg.bossSummons-1)/2)*72,y:boss.y+(i%2?60:-60),spawnX:boss.x,spawnY:boss.y,hp:cfg.enemyHp*.55,maxHp:cfg.enemyHp*.55,kind:i%2?"crawler":"wisp",phase:i,hitWait:.7,respawnWait:0,respawnable:false});setMessage(`오류코드 키메라가 잘못된 센서 신호 ${cfg.bossSummons}개를 소환했습니다.`);}tone(86,.16,"sawtooth");}
        if(boss&&!r.bossPhase2&&boss.hp/boss.maxHp<.5){r.bossPhase2=true;const summonCount=cfg.bossSummons;for(let i=0;i<summonCount;i++)r.enemies.push({id:`phase-wisp-${i}`,x:boss.x+(i-(summonCount-1)/2)*90,y:boss.y+(i%2?-60:60),spawnX:boss.x,spawnY:boss.y,hp:cfg.enemyHp,maxHp:cfg.enemyHp,kind:i%2?"crawler":"wisp",phase:1.2+i,hitWait:0,respawnWait:0,respawnable:false});setMessage(`${SCENARIOS[r.scenarioId].boss} 2단계! ${DIFFICULTIES[difficulty].short} 난이도 위험체 ${summonCount}기 증원.`);tone(74,.2,"sawtooth");}
        if(r.player.hp<=0){r.player.hp=0;finishRun(false);return;}
        hudClock+=dt;if(hudClock>.11){hudClock=0;syncHud();}
      }
      drawWorld(ctx,r,now/1000,reducedFx,difficulty,profile.suitTier);frame=requestAnimationFrame(loop);
    };
    frame=requestAnimationFrame(loop);return()=>cancelAnimationFrame(frame);
  },[cfg.aggro,cfg.bossCadence,cfg.bossSummons,cfg.enemyHp,cfg.enemySpeed,cfg.eventGap,cfg.events,cfg.gasGrowth,cfg.playerSpeed,cfg.respawn,cfg.time,cfg.touchDamage,cfg.trapRadius,cfg.trapTempo,cfg.trapWindow,cfg.wrongDamage,difficulty,finishRun,haptic,profile.suitTier,reducedFx,screen,speak,syncHud,tone]);

  useEffect(()=>{
    const down=(event:KeyboardEvent)=>{
      if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(event.code))event.preventDefault();
      if(event.code==="ArrowUp"||event.code==="KeyW")inputRef.current.up=true;if(event.code==="ArrowDown"||event.code==="KeyS")inputRef.current.down=true;if(event.code==="ArrowLeft"||event.code==="KeyA")inputRef.current.left=true;if(event.code==="ArrowRight"||event.code==="KeyD")inputRef.current.right=true;
      if(!event.repeat&&event.code==="Space")detectorPulse();if(!event.repeat&&event.code==="KeyE")interact();if(!event.repeat&&event.code==="KeyQ")activateMedkit();if(!event.repeat&&event.code==="Digit1")activateDrone();if(!event.repeat&&event.code==="Digit2")activateShield();if(!event.repeat&&event.code==="Digit3")activateVentGuide();
    };
    const up=(event:KeyboardEvent)=>{if(event.code==="ArrowUp"||event.code==="KeyW")inputRef.current.up=false;if(event.code==="ArrowDown"||event.code==="KeyS")inputRef.current.down=false;if(event.code==="ArrowLeft"||event.code==="KeyA")inputRef.current.left=false;if(event.code==="ArrowRight"||event.code==="KeyD")inputRef.current.right=false;};
    const resetInput=()=>{inputRef.current={up:false,down:false,left:false,right:false,axisX:0,axisY:0};joystickPointerRef.current=null;setStick({x:0,y:0});};
    window.addEventListener("keydown",down,{passive:false});window.addEventListener("keyup",up);window.addEventListener("blur",resetInput);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);window.removeEventListener("blur",resetInput);};
  },[activateDrone,activateMedkit,activateShield,activateVentGuide,detectorPulse,interact]);

  useEffect(()=>{const params=new URLSearchParams(window.location.search),code=params.get("controller")?.toUpperCase().slice(0,6);if(code){setTimeout(()=>{setControllerMode(true);setCoopCode(code);},0);void fetch("/api/coop",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({op:"connect",code})}).then(response=>setControllerStatus(response.ok?"게임 화면과 연결되었습니다.":"유효하지 않은 연결 코드입니다.")).catch(()=>setControllerStatus("연결 상태를 확인하세요."));}else{void fetch(`/api/reports?profileId=${encodeURIComponent(profileId())}`).then(response=>response.ok?response.json():null).then((data:{profile?:ProgressProfile}|null)=>{if(data?.profile)setProfile(data.profile);}).catch(()=>{});}},[]);

  useEffect(()=>{if(!coOp||!coopCode||screen!=="game"||controllerMode)return;let stopped=false,busy=false;const poll=async()=>{if(stopped||busy)return;busy=true;try{const response=await fetch(`/api/coop?code=${coopCode}&after=${coopLastIdRef.current}`,{cache:"no-store"});if(response.ok){const data=await response.json() as {connected:boolean;actions:{id:number;action:string}[]};setCoopConnected(data.connected);for(const item of data.actions){coopLastIdRef.current=Math.max(coopLastIdRef.current,item.id);const r=runRef.current;if(r)r.coopActions++;if(item.action==="pulse")detectorPulse();if(item.action==="interact")interact();if(item.action==="medkit")activateMedkit();if(item.action==="drone")activateDrone();if(item.action==="shield")activateShield();if(item.action==="vent")activateVentGuide();}if(data.actions.length)syncHud();}}catch{}finally{busy=false;}};void poll();const timer=setInterval(poll,260);return()=>{stopped=true;clearInterval(timer);};},[activateDrone,activateMedkit,activateShield,activateVentGuide,coOp,coopCode,controllerMode,detectorPulse,interact,screen,syncHud]);

  const reviewItem=reviewQueue[0]??null;
  const reviewQuestionData=reviewItem?safetyQuestion(reviewItem.questionId,reviewItem.difficulty,reviewItem.scenarioId):null;
  const reviewChoices=useMemo(()=>{
    if(!reviewItem||!reviewQuestionData)return[];
    const options=DIFFICULTIES[reviewItem.difficulty].options,all=reviewQuestionData.choices,correct=all.find(c=>c.correct)!;
    return [correct,...all.filter(c=>!c.correct).slice(0,options-1)].sort((a,b)=>a.slot-b.slot);
  },[reviewItem,reviewQuestionData]);

  const startReview=useCallback(()=>{if(!reviewQueue.length)return;setReviewFeedback(null);setScreen("review");tone(460,.1,"triangle");},[reviewQueue.length,tone]);

  const reviewAnswer=useCallback((choice:QuestionChoice)=>{
    if(!reviewItem||reviewFeedback)return;
    if(choice.correct){setReviewFeedback({correct:true,text:choice.feedback,note:reviewQuestionData?.correctNote??""});tone(784,.16,"triangle");}
    else{setReviewFeedback({correct:false,text:choice.feedback,note:reviewQuestionData?.correctNote??""});tone(108,.18,"sawtooth");}
  },[reviewFeedback,reviewItem,reviewQuestionData,tone]);

  const closeReviewItem=useCallback(()=>{
    if(!reviewFeedback||!reviewItem)return;
    if(!reviewFeedback.correct){setReviewFeedback(null);return;}
    const next=removeMistake(reviewQueue,reviewItem.questionId);saveReviewQueue(next);setReviewQueue(next);
    setReviewFeedback(null);
    if(next.length===0){setScreen("title");setMessage("복습을 모두 마쳤습니다! 다음 임무에서 만나요.");}
  },[reviewFeedback,reviewItem,reviewQueue]);

  const visibleChoices=useMemo(()=>{
    if(!currentQuestion)return[];const all=currentQuestion.choices;const correct=all.find(c=>c.correct)!;return [correct,...all.filter(c=>!c.correct).slice(0,cfg.options-1)].sort((a,b)=>a.slot-b.slot);
  },[cfg.options,currentQuestion]);
  const visibleDeductionChoices=useMemo(()=>{const all=DEDUCTIONS[scenarioId].choices,correct=all.find(item=>item.correct)!;return[correct,...all.filter(item=>!item.correct).slice(0,cfg.options-1)];},[cfg.options,scenarioId]);
  const visibleCrisisChoices=useMemo(()=>{const all=CRISIS_ACTIONS[scenarioId].choices,correct=all.find(item=>item.correct)!;return[correct,...all.filter(item=>!item.correct).slice(0,cfg.options-1)];},[cfg.options,scenarioId]);

  const classroomStats=useMemo(()=>{const rows=dashboardReports.length?dashboardReports:sessionReports;if(!rows.length)return null;const average=Math.round(rows.reduce((sum,item)=>sum+item.safetyIndex,0)/rows.length),mistakes=rows.filter(item=>item.wrongChoices>0).length,sparks=rows.reduce((sum,item)=>sum+item.sparkHits,0),response=Math.round(rows.reduce((sum,item)=>sum+item.timeUsed,0)/rows.length),coop=Math.round(rows.reduce((sum,item)=>sum+item.coopActions,0)/rows.length);return{average,mistakes,sparks,response,coop,count:rows.length};},[dashboardReports,sessionReports]);
  const dashboardData:DashboardReport[]=dashboardReports.length?dashboardReports:sessionReports;
  const dashboardMistakes=useMemo(()=>{const counts=new Map<string,number>();dashboardData.forEach(item=>{if(item.lastMistake)counts.set(item.lastMistake,(counts.get(item.lastMistake)??0)+1);});return [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4);},[dashboardData]);
  const dashboardGrowth=dashboardData.length>1?dashboardData[0].safetyIndex-dashboardData[dashboardData.length-1].safetyIndex:0;
  const exportCsv=()=>{const header=["일시","시나리오","난이도","안전지수","판단력","대응시간(초)","구조","오답","스파크","협동입력"];const rows=dashboardData.map(item=>[item.createdAt??"",SCENARIOS[item.scenarioId].place,DIFFICULTIES[item.difficulty].label,item.safetyIndex,item.safetyJudgment,Math.round(item.timeUsed),item.rescued,item.wrongChoices,item.sparkHits,item.coopActions]);const csv=[header,...rows].map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(",")).join("\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download=`gaskeeper-classroom-${new Date().toISOString().slice(0,10)}.csv`;anchor.click();URL.revokeObjectURL(url);};
  const resetDashboard=async()=>{if(!window.confirm("이 기기의 체험교실 누적 기록과 캐릭터 성장을 초기화할까요?"))return;try{await fetch(`/api/reports?profileId=${encodeURIComponent(profileId())}`,{method:"DELETE"});}catch{}setDashboardReports([]);setSessionReports([]);setProfile({xp:0,streak:0,missions:0,bestIndex:0,badges:[],sensorLevel:1,suitTier:1});};

  const exportResultCard=()=>{
    if(!result)return;
    const cardScenario=SCENARIOS[result.scenarioId],cardDifficulty=DIFFICULTIES[result.difficulty];
    const rankInfo=result.victory?(result.safetyIndex>=90?{icon:"👑",title:"골든타임 가스키퍼"}:result.safetyIndex>=75?{icon:"🛡️",title:"가스안전 수호기사"}:{icon:"◆",title:"현장 대응기사"}):{icon:"📜",title:"현장 견습기사"};
    const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=630;const ctx=canvas.getContext("2d");if(!ctx)return;
    const bg=ctx.createLinearGradient(0,0,1200,630);bg.addColorStop(0,"#171a1f");bg.addColorStop(1,"#0a0c0f");ctx.fillStyle=bg;ctx.fillRect(0,0,1200,630);
    ctx.strokeStyle="#665638";ctx.lineWidth=6;ctx.strokeRect(18,18,1164,594);
    ctx.textAlign="center";
    ctx.fillStyle="#8e7746";ctx.font="900 20px Georgia, serif";ctx.fillText("GASKEEPER · 대한민국 가스안전 RPG",600,78);
    ctx.font="120px sans-serif";ctx.fillText(rankInfo.icon,600,240);
    ctx.fillStyle="#f0e4cb";ctx.font="700 46px Georgia, 'Batang', serif";ctx.fillText(rankInfo.title,600,300);
    ctx.fillStyle="#a9a49a";ctx.font="20px sans-serif";ctx.fillText(`${cardScenario.icon} ${cardScenario.place} · ${cardDifficulty.label}`,600,340);
    ctx.fillStyle="#8b7546";ctx.font="700 16px Georgia, serif";ctx.fillText("SAFETY INDEX",600,400);
    ctx.fillStyle="#efd27c";ctx.font="700 88px Georgia, serif";ctx.fillText(String(result.safetyIndex),600,478);
    const stats:[string,string][]=[["안전 행동",`${result.seals} / 3`],["구조 완료",`${result.rescued} / 2`],["위험 판단",`${result.wrongChoices}회`],["스파크 유발",`${result.sparkHits}회`]];
    const colW=1164/4;
    stats.forEach(([label,value],index)=>{
      const cx=42+colW*index+colW/2;
      ctx.fillStyle="#d6d1c7";ctx.font="700 26px Georgia, serif";ctx.fillText(value,cx,548);
      ctx.fillStyle="#787f84";ctx.font="14px sans-serif";ctx.fillText(label,cx,572);
    });
    ctx.fillStyle="#5b5238";ctx.font="15px sans-serif";ctx.fillText("탐지 → 전기·화기 조작 금지 → 차단 → 자연환기 → 대피 → 안전한 곳에서 신고",600,608);
    const link=document.createElement("a");link.href=canvas.toDataURL("image/png");link.download=`gaskeeper-result-${result.scenarioId}-${Date.now()}.png`;link.click();
  };

  const moveJoystick=(event:React.PointerEvent<HTMLDivElement>)=>{if(joystickPointerRef.current!==event.pointerId)return;const rect=event.currentTarget.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,max=rect.width*.3,rawX=event.clientX-cx,rawY=event.clientY-cy,length=Math.hypot(rawX,rawY),scale=length>max?max/length:1,x=rawX*scale,y=rawY*scale;setStick({x,y});const normalizedX=x/max,normalizedY=y/max;inputRef.current.axisX=Math.abs(normalizedX)<.08?0:normalizedX;inputRef.current.axisY=Math.abs(normalizedY)<.08?0:normalizedY;};
  const startJoystick=(event:React.PointerEvent<HTMLDivElement>)=>{event.preventDefault();joystickPointerRef.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);haptic(10);moveJoystick(event);};
  const stopJoystick=(event?:React.PointerEvent<HTMLDivElement>)=>{if(event&&joystickPointerRef.current!==event.pointerId)return;if(event?.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);joystickPointerRef.current=null;inputRef.current.axisX=0;inputRef.current.axisY=0;setStick({x:0,y:0});};
  const stopPulseHold=useCallback(()=>{if(pulseTimerRef.current){clearInterval(pulseTimerRef.current);pulseTimerRef.current=null;}},[]);
  const startPulseHold=(event:React.PointerEvent<HTMLButtonElement>)=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);haptic([12,25,12]);detectorPulse();stopPulseHold();pulseTimerRef.current=setInterval(detectorPulse,120);};
  const tapInteract=()=>{haptic(18);interact();};
  const tapMedkit=()=>{haptic([18,35,22]);activateMedkit();};
  const dismissTouchGuide=()=>{setShowTouchGuide(false);pausedRef.current=false;haptic(20);speak(`${scenario.place} 사고 임무를 시작합니다. 왼쪽 조이스틱으로 이동해 빛나는 현장 단서를 수집하세요.`);};
  const toggleFullscreen=async()=>{try{haptic(10);if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setMessage("브라우저 메뉴의 전체화면 기능을 사용해 주세요.");}};
  const resetToTitle=()=>{pausedRef.current=true;runRef.current=null;stopPulseHold();stopJoystick();setShowTouchGuide(false);setShowMissionPanel(false);setScreen("title");setResult(null);setActiveQuestion(null);setActiveDeduction(false);setDeductionFeedback(null);setDeductionEvidence([]);setStoryStep(0);setStoryWrong(0);setStorySparkHits(0);setReviewFeedback(null);};
  const rank=result?.victory?(result.safetyIndex>=90?{icon:"👑",title:"골든타임 가스키퍼",copy:"안전 행동과 구조 임무를 정확한 순서로 완수했습니다."}:result.safetyIndex>=75?{icon:"🛡️",title:"가스안전 수호기사",copy:"누출 원인을 해결하고 폭압 군주를 성공적으로 봉인했습니다."}:{icon:"◆",title:"현장 대응기사",copy:"임무는 완수했습니다. 분석 보고서의 보완 행동을 확인하세요."}):{icon:"📜",title:"현장 견습기사",copy:"임무분석 보고서의 보완 행동을 확인한 뒤 다시 도전하세요."};
  const reportTip=result?(result.lastMistake?`보완 행동: “${result.lastMistake}” 대신 전기·화기 조작을 피하고 안전 순서를 지키세요.`:result.rescued<2?"보완 행동: 위험 제거뿐 아니라 주변 사람을 신선한 공기가 있는 안전구역으로 대피시키세요.":"완벽 대응: 탐지 → 차단 → 자연환기 → 대피 → 안전한 곳에서 신고 순서를 기억하세요."):"";

  useEffect(()=>()=>stopPulseHold(),[stopPulseHold]);
  useEffect(()=>{if(hud.crisisActive){inputRef.current={up:false,down:false,left:false,right:false,axisX:0,axisY:0};joystickPointerRef.current=null;stopPulseHold();}},[hud.crisisActive,stopPulseHold]);

  if(controllerMode)return <main className="controller-app"><section className="controller-card"><div className="controller-mark">G</div><span className="chapter-label">REMOTE SAFETY OFFICER</span><h1>안전관제관 컨트롤러</h1><p>게임 태블릿의 이동 담당과 대화하며 탐지·안전 행동·장비를 지원하세요.</p><div className={`controller-link ${controllerStatus.includes("연결되었습니다")||controllerStatus.includes("완료")?"online":""}`}><span>연결 코드</span><b>{coopCode}</b><small>{controllerStatus}</small></div><div className="controller-pad"><button className="remote-pulse" onPointerDown={()=>void sendControllerAction("pulse")}><span>◉</span><b>탐지 펄스</b><small>누출·안전길 표시</small></button><button onPointerDown={()=>void sendControllerAction("interact")}><span>!</span><b>안전 행동</b><small>밸브·환기·신고</small></button><button onPointerDown={()=>void sendControllerAction("medkit")}><span>✚</span><b>안전키트</b><small>보호력 회복</small></button><button onPointerDown={()=>void sendControllerAction("drone")}><span>✦</span><b>차단 드론</b><small>탐지 후 해금</small></button><button onPointerDown={()=>void sendControllerAction("shield")}><span>⬡</span><b>안전 보호막</b><small>구조·차단 후 해금</small></button><button onPointerDown={()=>void sendControllerAction("vent")}><span>💨</span><b>환기 유도기</b><small>자연환기 후 해금</small></button></div><div className="controller-rule"><b>협동 규칙</b><p>현장요원이 목표물 가까이 이동하면 관제관이 ‘안전 행동’을 누릅니다. 동시에 역할을 수행할수록 협동 점수가 올라갑니다.</p></div></section></main>;

  return <main className={`rpg-app ${largeText?"large-text":""}`}>
    {screen==="title"&&<section className="title-screen">
      <div className="title-mist mist-a"/><div className="title-mist mist-b"/>
      <header className="title-brand"><span className="rune-logo">G</span><div><small>대한민국 행동형 가스안전 RPG</small><b>GASKEEP · 180</b></div></header>
      <div className="title-grid">
        <div className="title-copy">
          <span className="chapter-label">180초 골든타임 · 행동 기반 안전 시뮬레이션</span>
          <h1>가스키퍼<br/><em>누출의 심연</em></h1>
          <p>수호기사 <b>가온</b>이 되어 보이지 않는 누출원을 탐지하세요. 올바른 차단·자연환기·대피·신고 행동만이 가스 균열의 재출현을 멈추고 폭압 군주를 약화시킵니다.</p>
          <div className="rpg-features"><span>🔎 증거 수집·추리</span><span>×5 SAFE 콤보</span><span>⏱ 5초 위기판단</span><span>☠ 행동형 보스 브레이크</span><span>⏪ 사고 리플레이</span><span>📊 교사용 분석</span></div>
          <div className="difficulty-runes" aria-label="난이도 선택">
            {(Object.keys(DIFFICULTIES) as Difficulty[]).map(key=>{const d=DIFFICULTIES[key],guide=LEVEL_GUIDES[key],stats=LEVEL_STATS[key];return <button key={key} className={`${difficulty===key?"selected":""} ${key}`} onClick={()=>{setDifficulty(key);setHud(emptyHud(key));tone(330+(key==="middle"?90:key==="high"?160:0),.06,"triangle");}}><span>{d.icon}</span><b>{d.label}</b><small>{guide.label} · {d.tag}</small><i>{stats.summary}</i><em>{Array.from({length:3},(_,index)=><u key={index} className={index<d.pips?"on":""}/>)}</em></button>;})}
          </div>
          <div className="experience-modes" aria-label="체험 방식 선택"><button className={!teacherMode?"selected":""} onClick={()=>setTeacherMode(false)}>개인 체험</button><button className={teacherMode?"selected":""} onClick={()=>setTeacherMode(true)}>교사용 체험교실</button><button className={!coOp?"selected":""} onClick={()=>setCoOp(false)}>1인 플레이</button><button className={coOp?"selected":""} onClick={()=>setCoOp(true)}>QR 2인 협동</button></div>
          <div className="experience-modes" aria-label="진행 방식 선택"><button className={experienceMode==="action"?"selected":""} onClick={()=>setExperienceMode("action")}>⚡ 실시간 액션</button><button className={experienceMode==="story"?"selected":""} onClick={()=>setExperienceMode("story")}>📖 스토리 전용</button></div>
          {experienceMode==="story"&&<p className="story-mode-note">전투·타이머 없이 증거→추리→차단→환기→신고→위기판단 순서로 압박 없이 진행합니다.</p>}
          {teacherMode&&<div className="scenario-selector"><small>교사용 사고 시나리오</small><div><button className={scenarioChoice==="random"?"selected":""} onClick={()=>setScenarioChoice("random")}>🎲 무작위</button>{(Object.keys(SCENARIOS) as ScenarioId[]).map(id=><button key={id} className={scenarioChoice===id?"selected":""} onClick={()=>setScenarioChoice(id)}>{SCENARIOS[id].icon} {SCENARIOS[id].place}</button>)}</div>{classroomStats&&<p>누적 {classroomStats.count}회 · 평균 안전지수 <b>{classroomStats.average}</b> · 위험판단 발생 {classroomStats.mistakes}회</p>}<button className="dashboard-open" onClick={()=>void loadDashboard()}>📊 교사용 학습 대시보드 열기</button></div>}
          <div className="profile-strip"><div><span>수호복 TIER {profile.suitTier}</span><b>가온 · 탐지기 LV.{profile.sensorLevel}</b></div><p>누적 XP <strong>{profile.xp.toLocaleString()}</strong> · 연속 성공 <strong>{profile.streak}</strong> · 최고 안전지수 <strong>{profile.bestIndex}</strong></p><button onClick={()=>void loadDashboard()}>성장·기록</button></div>
          {reviewQueue.length>0&&!reviewBannerDismissed&&<div className="review-banner"><div><span>📚 오답 복습</span><b>지난번 틀린 문제 {reviewQueue.length}개가 남아 있어요</b></div><div><button className="plain-button" onClick={()=>setReviewBannerDismissed(true)}>나중에</button><button className="gold-button compact" onClick={startReview}><span>복습하기</span></button></div></div>}
          <button className="gold-button" onClick={prepareBriefing}><span>{cfg.time}초 {cfg.tag} 임무를 시작한다</span><b>START GOLDEN TIME</b></button>
        </div>
        <HeroPortrait/>
      </div>
      <footer className="title-footer">키보드 · 마우스 · 터치스크린 지원 <span>│</span> 차단 전에는 가스 균열이 계속 재출현합니다</footer>
    </section>}

    {showDashboard&&<div className="dashboard-overlay" role="dialog" aria-modal="true" aria-labelledby="dashboard-title"><section className="dashboard-sheet"><header><div><span className="chapter-label">TEACHER LEARNING ANALYTICS</span><h2 id="dashboard-title">가스안전 체험교실 대시보드</h2><p>이 기기에서 누적된 수행 결과를 사고 유형·난이도·행동 오류별로 분석합니다.</p></div><button onClick={()=>setShowDashboard(false)} aria-label="대시보드 닫기">×</button></header><div className="dashboard-kpis"><div><span>누적 체험</span><b>{classroomStats?.count??0}</b><small>회</small></div><div><span>평균 안전지수</span><b>{classroomStats?.average??0}</b><small>/ 100</small></div><div><span>평균 대응시간</span><b>{classroomStats?.response??0}</b><small>초</small></div><div><span>사전→사후 성장</span><b className={dashboardGrowth>=0?"up":"down"}>{dashboardGrowth>=0?"+":""}{dashboardGrowth}</b><small>점</small></div><div><span>평균 협동입력</span><b>{classroomStats?.coop??0}</b><small>회</small></div></div>{dashboardData.length?<div className="dashboard-grid"><article><h3>시나리오별 성취</h3>{(Object.keys(SCENARIOS) as ScenarioId[]).map(id=>{const rows=dashboardData.filter(item=>item.scenarioId===id),avg=rows.length?Math.round(rows.reduce((sum,item)=>sum+item.safetyIndex,0)/rows.length):0;return <div className="metric-row" key={id}><span>{SCENARIOS[id].icon} {SCENARIOS[id].place}</span><i><b style={{width:`${avg}%`}}/></i><strong>{rows.length?avg:"-"}</strong></div>;})}</article><article><h3>난이도 비교</h3>{(Object.keys(DIFFICULTIES) as Difficulty[]).map(id=>{const rows=dashboardData.filter(item=>item.difficulty===id),avg=rows.length?Math.round(rows.reduce((sum,item)=>sum+item.safetyIndex,0)/rows.length):0;return <div className="metric-row" key={id}><span>{DIFFICULTIES[id].icon} {DIFFICULTIES[id].label}</span><i><b style={{width:`${avg}%`}}/></i><strong>{rows.length?avg:"-"}</strong></div>;})}<div className="growth-note"><b>학습 성장 해석</b><p>{dashboardGrowth>0?`첫 체험보다 최근 체험이 ${dashboardGrowth}점 향상되었습니다.`:dashboardGrowth<0?`최근 체험이 첫 체험보다 ${Math.abs(dashboardGrowth)}점 낮습니다. 오답 되감기로 재학습하세요.`:"2회 이상 체험하면 사전·사후 성장 폭이 표시됩니다."}</p></div></article><article><h3>반복 위험 행동</h3>{dashboardMistakes.length?dashboardMistakes.map(([label,count],index)=><div className="mistake-row" key={label}><i>{index+1}</i><span>{label}</span><b>{count}회</b></div>):<p className="empty-analysis">기록된 위험 판단이 없습니다.</p>}<small className="teacher-tip">상위 오류 문장을 먼저 토론한 뒤 같은 시나리오를 재도전해 보세요.</small></article><article><h3>최근 수행 기록</h3><div className="recent-list">{dashboardData.slice(0,6).map((item,index)=><div key={item.id??index}><span>{SCENARIOS[item.scenarioId].icon}</span><p><b>{SCENARIOS[item.scenarioId].place}</b><small>{DIFFICULTIES[item.difficulty].short} · {Math.round(item.timeUsed)}초 · 구조 {item.rescued}</small></p><strong>{item.safetyIndex}</strong></div>)}</div></article></div>:<div className="dashboard-empty"><span>📊</span><b>아직 누적된 체험 결과가 없습니다.</b><p>첫 임무를 완료하면 안전지수·반복 오류·시나리오 비교가 자동으로 나타납니다.</p></div>}<footer><div><b>교사용 활용</b><span>CSV는 원자료 분석용, PDF 인쇄는 공모전 시연·수업 결과 보고용입니다.</span></div><button onClick={exportCsv} disabled={!dashboardData.length}>CSV 내보내기</button><button onClick={()=>window.print()} disabled={!dashboardData.length}>PDF·인쇄</button><button className="reset-data" onClick={()=>void resetDashboard()} disabled={!dashboardData.length}>기록 초기화</button></footer></section></div>}

    {screen==="briefing"&&<section className="briefing-screen">
      <div className="briefing-card">
        <div className="npc-panel"><div className="npc-portrait">🧙‍♂️</div><small>지하 관제소장</small><b>한별</b><div className="incident-seal">{scenario.icon}<small>{scenario.gas}</small></div></div>
        <div className="briefing-copy"><span className="chapter-label">MISSION BRIEFING · {cfg.label}</span><h2>“불꽃보다 먼저, 판단이 움직여야 하네.”</h2><div className="incident-card"><span>{scenario.icon}</span><div><small>이번 사고 · {scenario.place}</small><b>{scenario.title}</b><p>{scenario.clue}</p></div><em>{scenario.sensor}</em></div><div className="scenario-mechanic"><span>고유 재난 규칙</span><b>{scenario.mechanic}</b><small>보스 · {scenario.boss}</small></div><div className={`difficulty-contract ${difficulty}`}><header><span>{cfg.icon}</span><div><small>{cfg.threat} · {cfg.tag}</small><b>{LEVEL_STATS[difficulty].accent}</b></div><em>{LEVEL_STATS[difficulty].summary}</em></header><p>{LEVEL_STATS[difficulty].guide}</p><div><i>보호력 <b>{cfg.hp}</b></i><i>키트 <b>{cfg.medkits}</b></i><i>문항 <b>{cfg.options}지선다</b></i><i>보스 <b>HP {cfg.bossHp}</b></i></div></div><p>{LEVEL_GUIDES[difficulty].copy} 누출원을 해결하기 전까지 가스 균열은 계속 다시 나타나며, 안전 행동을 수행할수록 탐지 펄스와 장비가 강화됩니다.</p>
          <div className="mission-route five"><div><i>1</i><b>증거·추리</b><small>누출원 판정</small></div><span>›</span><div><i>2</i><b>차단·환기</b><small>위험 제거</small></div><span>›</span><div><i>3</i><b>대피</b><small>사람 우선</small></div><span>›</span><div><i>4</i><b>신고</b><small>안전한 곳에서</small></div><span>›</span><div><i>5</i><b>브레이크</b><small>보스 봉인</small></div></div>
          <div className="control-grid"><div><kbd>WASD · 🕹️</kbd><span>키보드·조이스틱 이동</span></div><div><kbd>SPACE · HOLD</kbd><span>탐지 펄스 길게 누르기</span></div><div><kbd>E · ACTION</kbd><span>상황별 안전 행동</span></div><div><kbd>Q · ✚</kbd><span>안전키트 즉시 사용</span></div></div>
          {coOp&&<div className="coop-connect"><div className="coop-qr">{coopQr?<div className="qr-image" role="img" aria-label="안전관제관 컨트롤러 연결 QR 코드" style={{backgroundImage:`url(${coopQr})`}}/>:<span>QR 준비 중</span>}</div><div><span className="chapter-label">REAL-TIME CO-OP</span><h3>휴대전화로 QR을 스캔하세요</h3><p>태블릿은 이동, 휴대전화는 탐지·행동·안전 스킬을 담당합니다.</p><b className="coop-code">연결 코드 {coopCode||"------"}</b><small>{coopConnected?"● 안전관제관 연결 완료":"○ 연결 대기 · 한 화면에서도 2인 플레이 가능"}</small></div></div>}
          <div className="access-options"><label><input type="checkbox" checked={voiceEnabled} onChange={e=>setVoiceEnabled(e.target.checked)}/> 한국어 음성 안내</label><label><input type="checkbox" checked={reducedFx} onChange={e=>setReducedFx(e.target.checked)}/> 점멸 효과 완화</label><label><input type="checkbox" checked={largeText} onChange={e=>setLargeText(e.target.checked)}/> 큰 글씨 보기</label></div>
          <div className="briefing-actions"><button className="plain-button" onClick={()=>setScreen("title")}>난이도 다시 선택</button><button className="gold-button compact" onClick={experienceMode==="story"?startStoryRun:startRun}><span>{cfg.label} 난이도로 출동</span><b>{experienceMode==="story"?"BEGIN STORY":"DESCEND"}</b></button></div>
        </div>
      </div>
    </section>}

    {screen==="story"&&<section className="story-screen">
      <div className="story-card">
        <span className="chapter-label">STORY MODE · {scenario.place}</span>
        <h2>{scenario.icon} {scenario.title}</h2>
        <div className="story-progress">{["증거·추리","차단","환기","신고","위기판단"].map((label,index)=><i key={label} className={index<storyStep-1?"done":index===storyStep-1?"active":""}>{label}</i>)}</div>
        <p className="message-scroll">{message}</p>
        {storyStep===5&&<div className="crisis-card static"><h3>{CRISIS_ACTIONS[scenarioId].title}</h3><p>{CRISIS_ACTIONS[scenarioId].prompt}</p><div>{visibleCrisisChoices.map((choice,index)=><button key={choice.id} onClick={()=>storyResolveCrisis(choice)}><i>{String.fromCharCode(65+index)}</i><b>{choice.label}</b></button>)}</div><small>시간 제한 없이 가장 안전한 행동을 고르세요.</small></div>}
        <button className="plain-button" onClick={resetToTitle}>중단하고 처음으로</button>
      </div>
    </section>}

    {screen==="review"&&reviewItem&&reviewQuestionData&&<section className="story-screen review-screen">
      <div className="story-card">
        <span className="chapter-label">REVIEW · {SCENARIOS[reviewItem.scenarioId].place}</span>
        <h2>📚 오답 복습</h2>
        <p className="message-scroll">남은 문제 {reviewQueue.length}개 · 맞히면 목록에서 사라집니다.</p>
        <div className="question-card">
          <div className="question-rune">{TABLETS.find(t=>t.id===reviewItem.questionId)?.mark??(reviewItem.questionId==="valve"?"V":reviewItem.questionId==="vent"?"💨":"119")}</div>
          <h2>{reviewQuestionData.title}</h2><p>{reviewQuestionData.prompt}</p>
          <div className="question-options">{reviewChoices.map((choice,index)=><button key={choice.id} disabled={!!reviewFeedback} className={reviewFeedback?(choice.correct?"correct":"muted"):""} onClick={()=>reviewAnswer(choice)}><i>{String.fromCharCode(65+index)}</i><b>{choice.label}</b>{reviewFeedback&&choice.correct&&<span>✓</span>}</button>)}</div>
          {reviewFeedback&&<div className={`answer-feedback ${reviewFeedback.correct?"safe":"danger"}`}><span>{reviewFeedback.correct?"◆":"⚠"}</span><div><b>{reviewFeedback.correct?"이번엔 정확했습니다":"다시 판단해 보세요"}</b><p>{reviewFeedback.text}</p><small>{reviewFeedback.note}</small></div><button onClick={closeReviewItem}>{reviewFeedback.correct?"다음 문제":"다시 풀기"}</button></div>}
        </div>
        <button className="plain-button" onClick={resetToTitle}>복습 중단하고 처음으로</button>
      </div>
    </section>}

    {screen==="game"&&<section className={`game-screen difficulty-${difficulty} ${leftHanded?"left-handed":""}`}>
      <header className="game-hud">
        <div className="hud-hero"><div className="mini-portrait">{cfg.icon}</div><div><small>GASKEEPER · LV.{difficulty==="elementary"?1:difficulty==="middle"?2:3}</small><b>가온</b></div></div>
        <div className="health-block"><div><span>보호력</span><b>{hud.hp} / {hud.maxHp}</b></div><div className="health-track"><i style={{width:`${hud.hp/hud.maxHp*100}%`}}/></div></div>
        <div className={`hud-stat gas-stat ${hud.gasLevel>.9?"gas-danger":""}`}><small>{scenario.gas} 농도</small><b>{Math.round(hud.gasLevel*68)}%</b></div>
        <div className="hud-stat"><small>남은 시간</small><b className={hud.seconds<30?"danger-time":""}>{formatTime(hud.seconds)}</b></div>
        <div className="hud-stat"><small>안전 점수</small><b>{hud.score.toLocaleString()}</b></div>
        <button className="exit-run" onClick={resetToTitle} aria-label="임무 종료">×</button>
      </header>
      {hud.bossMax>0&&<div className={`boss-bar ${hud.bossShielded?"shielded":""}`}><span>{hud.bossShielded?`◇ SAFETY BREAK ${hud.bossBreak}/5`:`☠ ${scenario.boss}`}</span><div><i style={{width:`${hud.bossShielded?hud.bossBreak/5*100:hud.bossHp/hud.bossMax*100}%`}}/></div><b>{hud.bossShielded?"LOCK":Math.max(0,Math.ceil(hud.bossHp))}</b></div>}
      <div className="tablet-toolbar" aria-label="태블릿 화면 설정"><span>TABLET MODE</span><button aria-expanded={showMissionPanel} aria-controls="mission-panel" onClick={()=>setShowMissionPanel(value=>!value)}>☰ {showMissionPanel?"임무 닫기":"임무 보기"}</button><button onClick={()=>setLeftHanded(value=>!value)}>⇄ {leftHanded?"오른손 이동":"왼손 이동"}</button><button onClick={toggleFullscreen}>⛶ 전체화면</button></div>
      <div className="orientation-tip">↻ 태블릿을 가로로 돌리면 조작 영역이 더 넓어집니다.</div>
      {hud.eventTimer>0&&<div className="dynamic-event"><span>⚠ DYNAMIC EVENT</span><b>{hud.eventLabel}</b><i>{Math.ceil(hud.eventTimer)}초</i></div>}
      {hud.crisisActive&&<div className="crisis-overlay" role="dialog" aria-modal="true" aria-labelledby="crisis-title"><div className={`crisis-card ${difficulty}`}><header><span>GOLDEN TIME</span><b>{Math.ceil(hud.crisisTimer)}</b></header><h2 id="crisis-title">{CRISIS_ACTIONS[scenarioId].title}</h2><p>{CRISIS_ACTIONS[scenarioId].prompt}</p><div>{visibleCrisisChoices.map((choice,index)=><button key={choice.id} onClick={()=>resolveCrisis(choice)}><i>{String.fromCharCode(65+index)}</i><b>{choice.label}</b></button>)}</div><small>시간이 끝나면 가스 농도와 위험도가 상승하고 SAFE 콤보가 초기화됩니다.</small></div></div>}
      <div className="game-layout">
        <div className="canvas-frame">
          <canvas ref={canvasRef} width="960" height="576" aria-label="가스안전 지하 던전 게임 화면"/>
          <div className="scenario-chip"><span>{scenario.icon}</span><div><small>{scenario.place}</small><b>{scenario.gas}</b></div></div>
          <div className={`difficulty-chip ${difficulty}`}><span>{cfg.icon}</span><div><small>{cfg.threat} · {cfg.tag}</small><b>{cfg.label} {Array.from({length:cfg.pips},()=>"◆").join("")}</b></div></div>
          <div className={`safe-chain-meter chain-${hud.safeChain}`}><header><span>GAS SAFE CHAIN</span><b>×{Math.max(1,hud.safeChain)}</b></header><div>{SAFE_CHAIN_STEPS.map((step,index)=><i key={step.label} className={index<hud.bossBreak?"break":index<hud.safeChain?"on":""}><em>{step.icon}</em><small>{step.label}</small></i>)}</div></div>
          <div className="quest-banner"><small>현재 임무</small><b>{hud.objective}</b></div>
          <div className="message-scroll">{message}</div>
          {coOp&&<div className={`coop-live ${coopConnected?"online":""}`}><span>{coopConnected?"●":"○"}</span><b>P2 관제관 {coopConnected?"연결":"대기"}</b><small>협동 입력 {hud.coopActions}</small></div>}
          <div className="virtual-joystick" aria-label="드래그하여 캐릭터 이동">
            <small>{coOp?"P1 · 현장요원":"이동"}</small>
            <div className="joystick-base" onPointerDown={startJoystick} onPointerMove={moveJoystick} onPointerUp={stopJoystick} onPointerCancel={stopJoystick} onLostPointerCapture={stopJoystick}>
              <i className="joystick-arrows">▲<b>◀</b><em>▶</em><strong>▼</strong></i>
              <span className="joystick-knob" style={{transform:`translate(${stick.x}px,${stick.y}px)`}}><b>G</b></span>
            </div>
          </div>
          <div className="tablet-actions" aria-label={coOp?"P2 안전관제관 조작":"스킬 조작"}>
            <small className="action-owner">{coOp?"P2 · 안전관제관":"안전 스킬"}</small>
            <button className="medkit-action" disabled={hud.medkits<=0||hud.hp>=hud.maxHp} onPointerDown={tapMedkit}><span>✚</span><b>키트 {hud.medkits}</b></button>
            <button className={`interact-action ${hud.canInteract?"ready":""}`} onPointerDown={tapInteract}><span>{hud.canInteract?"!":"E"}</span><b>{hud.nearbyLabel}</b></button>
            <button className="pulse-action" onPointerDown={startPulseHold} onPointerUp={stopPulseHold} onPointerCancel={stopPulseHold} onLostPointerCapture={stopPulseHold} style={{"--charge":`${hud.pulseReady*360}deg`} as React.CSSProperties}><span>◉</span><b>탐지 펄스</b><small>길게 누르기</small></button>
          </div>
          <div className="skill-rack" aria-label="해금형 안전 스킬"><button disabled={!hud.detectedLeak||hud.droneReady<1} className={hud.droneActive?"active":""} onPointerDown={activateDrone} style={{"--ready":`${hud.droneReady*100}%`} as React.CSSProperties}><i>1</i><span>✦</span><b>차단 드론</b><small>{!hud.detectedLeak?"탐지 후 해금":hud.droneActive?"작동 중":hud.droneReady>=1?"사용 가능":`${Math.ceil((1-hud.droneReady)*14)}초`}</small></button><button disabled={(hud.seals<1&&hud.rescued<1)||hud.shieldReady<1} className={hud.shieldActive?"active":""} onPointerDown={activateShield} style={{"--ready":`${hud.shieldReady*100}%`} as React.CSSProperties}><i>2</i><span>⬡</span><b>안전 보호막</b><small>{hud.seals<1&&hud.rescued<1?"구조·차단 후":hud.shieldActive?"작동 중":hud.shieldReady>=1?"사용 가능":`${Math.ceil((1-hud.shieldReady)*16)}초`}</small></button><button disabled={hud.seals<2||hud.ventReady<1} className={hud.ventActive?"active":""} onPointerDown={activateVentGuide} style={{"--ready":`${hud.ventReady*100}%`} as React.CSSProperties}><i>3</i><span>💨</span><b>환기 유도기</b><small>{hud.seals<2?"환기 후 해금":hud.ventActive?"작동 중":hud.ventReady>=1?"사용 가능":`${Math.ceil((1-hud.ventReady)*18)}초`}</small></button></div>
        </div>
        {showMissionPanel&&<button className="mission-panel-scrim" aria-label="임무 패널 닫기" onClick={()=>setShowMissionPanel(false)}/>}
        <aside id="mission-panel" className={`quest-panel ${showMissionPanel?"tablet-open":""}`} aria-label="현재 임무와 장비">
          <button className="quest-panel-close" onClick={()=>setShowMissionPanel(false)} aria-label="임무 패널 닫기">×</button>
          <h3>{cfg.time}초 안전 임무</h3><p>{scenario.icon} {scenario.title} · {cfg.tag}</p>
          <div className={`quest-step evidence ${hud.evidence>=hud.evidenceNeeded?"done":"active"}`}><i>{hud.evidence>=hud.evidenceNeeded?"✓":"🔎"}</i><div><b>현장 증거 수집</b><small>{hud.evidence} / {hud.evidenceNeeded} · 난이도별 단서</small></div></div>
          <div className={`quest-step scan ${hud.detectedLeak?"done":hud.evidence>=hud.evidenceNeeded?"active":""}`}><i>{hud.detectedLeak?"✓":"◉"}</i><div><b>누출원 추리</b><small>{hud.detectedLeak?"좌표 특정 완료":"증거 확보 후 펄스"}</small></div></div>
          <div className={`quest-step ${hud.seals>=1?"done":hud.detectedLeak?"active":""}`}><i>{hud.seals>=1?"✓":"V"}</i><div><b>차단 밸브</b><small>전기 조작 없이 공급 차단</small></div></div>
          <div className={`quest-step ${hud.seals>=2?"done":hud.seals>=1?"active":""}`}><i>{hud.seals>=2?"✓":"💨"}</i><div><b>자연 환기문</b><small>전기 없는 창문·문 환기</small></div></div>
          <div className={`quest-step ${hud.rescued>=1?"done":hud.seals>=2?"active":""}`}><i>{hud.rescued>=1?"✓":"🧑"}</i><div><b>인명 대피</b><small>신선한 공기의 안전구역</small></div></div>
          <div className={`quest-step ${hud.seals>=3?"done":hud.rescued>=1?"active":""}`}><i>{hud.seals>=3?"✓":"119"}</i><div><b>외부 안전 신고</b><small>가스 없는 장소에서 신고</small></div></div>
          <div className={`quest-step boss ${hud.seals===3?"active":""}`}><i>☠</i><div><b>{scenario.boss}</b><small>{hud.bossShielded?`보스 브레이크 ${hud.bossBreak}/5`:"탐지 펄스로 최종 봉인"}</small></div></div>
          <div className="inventory"><h4>장비</h4><button onClick={detectorPulse}><span>◉</span><b>방폭 탐지기</b><small>SPACE</small></button><button onClick={activateMedkit}><span>✚</span><b>안전키트 × {hud.medkits}</b><small>Q</small></button><div><span>◆</span><b>안전인장 × {hud.seals}</b><small>QUEST</small></div></div>
          <div className="bonus-quests"><h4>게이미피케이션</h4><p><span>× SAFE 최고 콤보</span><b>{hud.maxSafeChain} / 5</b></p><p><span>📜 지식석판</span><b>{hud.knowledge} / {TABLETS.length}</b></p><p><span>🧑 구조 대상</span><b>{hud.rescued} / 2</b></p><p><span>◉ 탐지기 강화</span><b>LV.{hud.sensorLevel}</b></p></div>
          <div className={`rift-status ${hud.seals>0?"sealed":"open"}`}><span>{hud.seals>0?"◆":"◈"}</span><div><b>{hud.seals>0?"가스 균열 봉쇄":"가스 균열 활성"}</b><small>{hud.seals>0?"처치한 위험체는 재출현하지 않음":"차단 전에는 계속 재출현"}</small></div></div>
          <div className="enemy-count">현재 위협 <b>{hud.living}</b> · 누적 정화 <b>{hud.defeated}</b> · 재출현 <b>{hud.respawned}</b></div>
        </aside>
      </div>
      {showTouchGuide&&<div className="touch-guide-overlay" role="dialog" aria-modal="true" aria-labelledby="touch-guide-title"><div className="touch-guide-card"><span className="chapter-label">TABLET CONTROL</span><h2 id="touch-guide-title">손가락 두 개로 더 편하게</h2><p>게임 시간은 안내를 닫은 뒤부터 흐릅니다.</p><div className="touch-guide-steps"><div><i>①</i><b>조이스틱 드래그</b><small>누른 채 원하는 방향으로 움직이세요.</small></div><div><i>②</i><b>빛나는 증거 수집</b><small>단서 가까이에서 행동 버튼을 눌러 증거 보드에 기록하세요.</small></div><div><i>③</i><b>탐지 펄스 길게 누르기</b><small>증거를 모은 뒤 의심 지점에서 펄스를 사용하세요.</small></div><div><i>④</i><b>5초 위기판단</b><small>화면 중앙 선택지를 터치해 위험 행동을 즉시 차단하세요.</small></div></div><div className="touch-guide-actions"><button className="plain-button" onClick={()=>setLeftHanded(value=>!value)}>⇄ 조이스틱 {leftHanded?"오른쪽":"왼쪽"}</button><button className="gold-button compact" onClick={dismissTouchGuide}><span>조작 확인 · 임무 시작</span><b>TOUCH TO START</b></button></div></div></div>}
    </section>}

    {activeQuestion&&<div className="question-overlay" role="dialog" aria-modal="true" aria-labelledby="question-title"><div className="question-card">
      <div className="question-rune">{TABLETS.find(t=>t.id===activeQuestion)?.mark??(activeQuestion==="valve"?"V":activeQuestion==="vent"?"💨":"119")}</div><span className="chapter-label">{TABLETS.some(t=>t.id===activeQuestion)?"SAFETY CODEX":"SAFETY ACTION"} · {LEVEL_GUIDES[difficulty].label}</span><h2 id="question-title">{currentQuestion?.title}</h2><p>{currentQuestion?.prompt}</p>
      <div className={`level-context ${difficulty}`}><span>{DIFFICULTIES[difficulty].icon}</span><div><b>{cfg.label} 판단 임무 · {cfg.options}지선다</b><small>{LEVEL_GUIDES[difficulty].copy}</small></div><em><strong>관찰 단서</strong>{currentQuestion?.cue??scenario.sensor}</em></div>
      <div className="question-options">{visibleChoices.map((choice,index)=><button key={choice.id} disabled={!!feedback} className={feedback?(choice.correct?"correct":"muted"):""} onClick={()=>(experienceMode==="story"?storyAnswer(choice):answer(choice))}><i>{String.fromCharCode(65+index)}</i><b>{choice.label}</b>{feedback&&choice.correct&&<span>✓</span>}</button>)}</div>
      {feedback&&<div className={`answer-feedback ${feedback.correct?"safe":"danger"}`}><span>{feedback.correct?"◆":"⚠"}</span><div><b>{feedback.correct?(TABLETS.some(t=>t.id===activeQuestion)?"안전지식이 기록됩니다":"안전 행동으로 위험이 약화됩니다"):rewindInfo?.hazard==="spark"?"전기 스파크 발생!":rewindInfo?.hazard==="heat"?"과열·파열 위험 발생!":"위험 행동이 감지되었습니다"}</b><p>{feedback.text}</p><small>{feedback.note}</small>{rewindInfo&&<div className="rewind-chain"><div><i>1</i><b>선택</b><span>{rewindInfo.choice}</span></div><em>→</em><div><i>2</i><b>원인</b><span>{rewindInfo.cause}</span></div><em>→</em><div><i>3</i><b>결과</b><span>{rewindInfo.result}</span></div><strong>⏪ {DIFFICULTIES[difficulty].short} 수준 위험 5초 되감기</strong></div>}</div><button onClick={experienceMode==="story"?storyCloseQuestion:closeQuestion}>{feedback.correct?(TABLETS.some(t=>t.id===activeQuestion)?"기록 완료":"행동 완료"):"5초 전으로 · 다시 판단"}</button></div>}
    </div></div>}

    {activeDeduction&&<div className="deduction-overlay" role="dialog" aria-modal="true" aria-labelledby="deduction-title"><div className={`deduction-card ${difficulty}`}><header><span>🔎 EVIDENCE BOARD</span><b>{experienceMode==="story"?deductionEvidence.length:hud.evidence}/{experienceMode==="story"?deductionEvidence.length:hud.evidenceNeeded} 단서 확보</b></header><h2 id="deduction-title">누출원 추리 판정</h2><p>{DEDUCTIONS[scenarioId].prompt}</p><div className="evidence-board">{EVIDENCE[scenarioId].filter(item=>deductionEvidence.includes(item.id)).map(item=><article key={item.id}><span>{item.icon}</span><div><b>{item.label}</b><small>{item.value}</small></div></article>)}</div><div className="deduction-cue">관제 분석 · {DEDUCTIONS[scenarioId].cue}</div><div className="deduction-options">{visibleDeductionChoices.map((choice,index)=><button key={choice.id} disabled={!!deductionFeedback} className={deductionFeedback?(choice.correct?"correct":"muted"):""} onClick={()=>(experienceMode==="story"?storyAnswerDeduction(choice):answerDeduction(choice))}><i>{String.fromCharCode(65+index)}</i><b>{choice.label}</b>{deductionFeedback&&choice.correct&&<span>✓</span>}</button>)}</div>{deductionFeedback&&<div className={`deduction-feedback ${deductionFeedback.correct?"safe":"danger"}`}><span>{deductionFeedback.correct?"◆":"⚠"}</span><div><b>{deductionFeedback.correct?"증거 연결 성공":"증거 연결 오류"}</b><p>{deductionFeedback.text}</p></div><button onClick={experienceMode==="story"?storyCloseDeduction:closeDeduction}>{deductionFeedback.correct?"판정 확정 · 차단 임무":"증거 다시 분석"}</button></div>}</div></div>}

    {screen==="result"&&result&&rank&&<section className={`result-screen ${result.victory?"victory":"defeat"}`}>
      <div className="result-card"><div className="result-sigil">{rank.icon}</div><span className="chapter-label">MISSION REPORT</span><h1>{rank.title}</h1><p>{rank.copy}</p>
        <div className="report-identity"><span>{SCENARIOS[result.scenarioId].icon}</span><div><small>{DIFFICULTIES[result.difficulty].label} · {SCENARIOS[result.scenarioId].place}</small><b>{SCENARIOS[result.scenarioId].title}</b></div><em>안전지수 <strong>{result.safetyIndex}</strong></em></div>
        <div className="analysis-grid"><div><span>안전 판단력</span><i><b style={{width:`${result.safetyJudgment}%`}}/></i><strong>{result.safetyJudgment}</strong></div><div><span>골든타임 대응</span><i><b style={{width:`${result.goldenTime}%`}}/></i><strong>{result.goldenTime}</strong></div><div><span>구조 수행도</span><i><b style={{width:`${result.rescueScore}%`}}/></i><strong>{result.rescueScore}</strong></div><div><span>안전지식 적용</span><i><b style={{width:`${result.knowledgeScore}%`}}/></i><strong>{result.knowledgeScore}</strong></div></div>
        <div className="result-stats"><div><span>◆</span><b>{result.seals} / 3</b><small>안전 행동</small></div><div><span>🔎</span><b>{result.evidenceCount??0} / {DIFFICULTIES[result.difficulty].evidenceNeeded}</b><small>증거 수집</small></div><div><span>×</span><b>{result.maxCombo??0} / 5</b><small>최고 SAFE 콤보</small></div><div><span>⏱</span><b>{result.crisisHandled?(result.crisisSuccess?"SAVE":"MISS"):"SKIP"}</b><small>골든타임 위기</small></div><div><span>🧑</span><b>{result.rescued} / 2</b><small>구조 완료</small></div><div><span>⚠</span><b>{result.wrongChoices}</b><small>위험 판단</small></div><div><span>⚡</span><b>{result.sparkHits}</b><small>스파크 유발</small></div><div><span>◉</span><b>{result.pulseCount}</b><small>탐지 횟수</small></div></div>
        <div className={`debrief-note ${result.lastMistake?"warning":"perfect"}`}><b>{result.lastMistake?"관제관 보완 지시":"관제관 최종 평가"}</b><p>{reportTip}</p></div>
        {!!result.timeline?.length&&<div className="incident-replay"><header><div><span>⏪ INCIDENT REPLAY</span><b>선택 → 원인 → 결과</b></div><em>총 {formatTime(result.timeUsed)}</em></header><div>{result.timeline.slice(-8).map((item,index)=><article className={item.outcome} key={`${item.at}-${index}`}><i>{item.icon}</i><small>T+{String(Math.floor(item.at/60)).padStart(2,"0")}:{String(item.at%60).padStart(2,"0")}</small><b>{item.label}</b><p>{item.detail}</p></article>)}</div><footer><span className="safe">◆ 안전 행동은 보스 보호막을 파괴합니다.</span><span className="danger">⚠ 위험 행동은 실제 게임 위험으로 확대됩니다.</span></footer></div>}
        <div className="progress-report"><div><span>수호복 성장</span><b>TIER {profile.suitTier}</b><small>누적 XP {profile.xp.toLocaleString()} · 연속 성공 {profile.streak}</small></div><div><span>획득 안전배지</span><p>{profile.badges.length?profile.badges.slice(-5).map(item=><i key={item}>◆ {item}</i>):<i>첫 임무 완료 후 배지가 기록됩니다</i>}</p></div><div><span>협동 기여</span><b>{result.coopActions}회</b><small>{result.coopActions>=6?"역할 분담 우수":"탐지·행동을 나누면 협동 점수가 상승합니다"}</small></div></div>
        {teacherMode&&classroomStats&&<div className="classroom-report"><b>체험교실 누적 분석</b><div><span>플레이 {sessionReports.length}회</span><span>평균 안전지수 {classroomStats.average}</span><span>스파크 유발 {classroomStats.sparks}회</span></div></div>}
        <div className="safety-oath"><b>가스키퍼의 골든타임 행동순서</b><p>탐지 → 전기·화기 조작 금지 → 가능한 경우 밸브 차단 → 창문·문으로 자연환기 → 주변 대피 → 안전한 곳에서 119·가스공급자 신고</p><small>본 콘텐츠는 교육용 시뮬레이션입니다. 실제 상황에서는 119 및 한국가스안전공사(1544-4500) 안내를 따르세요.</small></div>
        <div className="result-actions"><button className="plain-button" onClick={resetToTitle}>난이도·운영모드</button><button className="plain-button" onClick={()=>window.print()}>수호기사 인증서 인쇄</button><button className="plain-button" onClick={exportResultCard}>결과 카드 저장 · SNS 공유용</button><button className="gold-button compact" onClick={prepareBriefing}><span>새 사고에 도전</span><b>NEXT MISSION</b></button></div>
      </div>
    </section>}
  </main>;
}
