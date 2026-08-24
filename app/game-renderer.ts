import type { Difficulty, Enemy, RunState, ScenarioId } from "./game-data";
import { CACHES, DIFFICULTIES, DOORWAYS, EVIDENCE, GAS_POOLS, RESCUES, SCENARIOS, SPARK_TRAPS, STATIONS, TABLETS, WALLS, WORLD, clamp, distance, objectiveTarget } from "./game-data";

export function drawStoneWall(ctx:CanvasRenderingContext2D,w:{x:number;y:number;w:number;h:number}){
  const horizontal=w.w>=w.h;
  const center=w.x+w.w/2;
  const accent=center<384?"#7895a4":center<768?"#6f9aa6":center<1152?"#8d7fa6":"#b09668";
  ctx.save();
  ctx.shadowColor="rgba(0,0,0,.8)";ctx.shadowBlur=12;ctx.shadowOffsetX=5;ctx.shadowOffsetY=7;
  ctx.fillStyle="#05080b";ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  const stone=ctx.createLinearGradient(w.x,w.y,w.x+(horizontal?0:w.w),w.y+(horizontal?w.h:0));
  stone.addColorStop(0,"#3b4a53");stone.addColorStop(.18,"#26323a");stone.addColorStop(.72,"#141b21");stone.addColorStop(1,"#090d11");
  ctx.fillStyle=stone;ctx.fillRect(w.x,w.y,w.w,w.h);
  ctx.strokeStyle="rgba(2,4,6,.9)";ctx.lineWidth=2;
  const size=28;
  for(let y=w.y;y<w.y+w.h;y+=size){
    const offset=((y-w.y)/size)%2?size/2:0;
    for(let x=w.x-offset;x<w.x+w.w;x+=size){ctx.strokeRect(x,y,size,size);}
  }
  ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.strokeRect(w.x+1.5,w.y+1.5,w.w-3,w.h-3);
  ctx.fillStyle=accent;
  if(horizontal)ctx.fillRect(w.x+3,w.y+3,Math.max(0,w.w-6),4);else ctx.fillRect(w.x+3,w.y+3,4,Math.max(0,w.h-6));
  ctx.fillStyle="rgba(0,0,0,.62)";
  if(horizontal)ctx.fillRect(w.x+3,w.y+w.h-7,Math.max(0,w.w-6),5);else ctx.fillRect(w.x+w.w-7,w.y+3,5,Math.max(0,w.h-6));
  ctx.restore();
}

export function drawDoorway(ctx:CanvasRenderingContext2D,door:typeof DOORWAYS[number],time:number){
  const horizontal=door.axis==="horizontal",pulse=(Math.sin(time*3.4+door.x*.01+door.y*.01)+1)/2;
  ctx.save();
  ctx.fillStyle=`rgba(55,225,194,${.14+pulse*.08})`;ctx.fillRect(door.x,door.y,door.w,door.h);
  ctx.strokeStyle="#62f0d3";ctx.lineWidth=2;ctx.setLineDash([8,5]);ctx.lineDashOffset=-time*18;ctx.strokeRect(door.x+2,door.y+2,door.w-4,door.h-4);ctx.setLineDash([]);
  ctx.fillStyle="rgba(83,235,208,.72)";
  if(horizontal){for(let x=door.x+8;x<door.x+door.w-5;x+=15)ctx.fillRect(x,door.y+5,7,door.h-10);}
  else{for(let y=door.y+8;y<door.y+door.h-5;y+=15)ctx.fillRect(door.x+5,y,door.w-10,7);}
  ctx.shadowColor="#55f0d0";ctx.shadowBlur=12;ctx.fillStyle="#d7fff7";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText("통로",door.x+door.w/2,door.y+door.h/2);
  ctx.restore();
}

export function drawHero(ctx:CanvasRenderingContext2D,x:number,y:number,fx:number,fy:number,t:number,flash:number,suitTier=1,moving=false,difficulty:Difficulty="elementary"){
  const stride=moving?Math.sin(t*12)*5:0,bob=moving?Math.abs(Math.sin(t*12))*-2:Math.sin(t*3)*.8,suits=["#e3b83d","#55c5cf","#e6edf0","#ae79e8"],suit=suits[clamp(suitTier-1,0,3)],aura=difficulty==="high"?"#b47cff":difficulty==="middle"?"#70d9e5":"#72e5a5";
  ctx.save();ctx.translate(x,y+bob);ctx.fillStyle="rgba(0,0,0,.52)";ctx.beginPath();ctx.ellipse(0,22,moving?21:22,8,0,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.22;ctx.strokeStyle=aura;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,5,26+Math.sin(t*4)*2,31+Math.sin(t*4)*2,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
  ctx.strokeStyle="#090e13";ctx.lineWidth=6;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-6,18);ctx.lineTo(-8-stride*.45,27);ctx.moveTo(6,18);ctx.lineTo(8+stride*.45,27);ctx.stroke();ctx.strokeStyle="#6b5428";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-9-stride*.45,27);ctx.lineTo(-2-stride*.45,27);ctx.moveTo(2+stride*.45,27);ctx.lineTo(9+stride*.45,27);ctx.stroke();
  ctx.fillStyle="#19313a";ctx.strokeStyle="#071015";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-17,-1,10,24,4);ctx.fill();ctx.stroke();ctx.fillStyle="#5dd5de";ctx.fillRect(-14,3,3,13);
  if(flash>0){ctx.shadowColor="#ff5a52";ctx.shadowBlur=24;}
  const armor=ctx.createLinearGradient(-13,-3,14,24);armor.addColorStop(0,"#fff1b1");armor.addColorStop(.18,suit);armor.addColorStop(.72,difficulty==="high"?"#5b3d84":"#755c27");armor.addColorStop(1,"#1a2025");ctx.fillStyle=armor;ctx.strokeStyle="#081016";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-13,-2,26,25,7);ctx.fill();ctx.stroke();
  ctx.fillStyle="#27353c";ctx.beginPath();ctx.roundRect(-17,0,7,10,3);ctx.roundRect(10,0,7,10,3);ctx.fill();ctx.stroke();ctx.fillStyle=aura;ctx.fillRect(-9,2,18,3);
  ctx.fillStyle="#173e49";ctx.strokeStyle="#081015";ctx.beginPath();ctx.arc(-12,9,7,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#efffff";ctx.font="bold 7px sans-serif";ctx.textAlign="center";ctx.fillText(`G${suitTier}`,-12,11);
  const helmet=ctx.createRadialGradient(-5,-16,2,0,-10,18);helmet.addColorStop(0,"#fff7c8");helmet.addColorStop(.28,suit);helmet.addColorStop(1,"#28323a");ctx.fillStyle=helmet;ctx.strokeStyle="#071015";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-11,16,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#102b34";ctx.beginPath();ctx.roundRect(-12,-17,24,11,5);ctx.fill();ctx.strokeStyle=aura;ctx.lineWidth=2;ctx.stroke();const visor=ctx.createLinearGradient(-10,-15,10,-8);visor.addColorStop(0,"#d9ffff");visor.addColorStop(.45,"#5ed6e8");visor.addColorStop(1,"#17677d");ctx.fillStyle=visor;ctx.beginPath();ctx.roundRect(-9,-14,18,6,3);ctx.fill();ctx.fillStyle="rgba(255,255,255,.75)";ctx.fillRect(-6,-13,7,1.5);
  ctx.strokeStyle="#b8f5ff";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(10,3);ctx.lineTo(21+fx*4,-12+fy*4);ctx.stroke();ctx.strokeStyle="#225b68";ctx.lineWidth=2;ctx.stroke();ctx.shadowColor="#5fe7f2";ctx.shadowBlur=15;ctx.fillStyle="#bafaff";ctx.beginPath();ctx.arc(22+fx*4,-14+fy*4,6,0,Math.PI*2);ctx.fill();ctx.fillStyle="#287485";ctx.beginPath();ctx.arc(22+fx*4,-14+fy*4,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
}

export function drawEnemy(ctx:CanvasRenderingContext2D,e:Enemy,t:number,scenarioId:ScenarioId,difficulty:Difficulty){
  const bob=Math.sin(t*4+e.phase)*5;
  ctx.save();ctx.translate(e.x,e.y+bob);
  const boss=e.kind==="boss"; const radius=boss?45:e.kind==="crawler"?22:26;
  const bossColor=SCENARIOS[scenarioId].bossColor;
  const glow=ctx.createRadialGradient(0,0,4,0,0,radius*1.5);
  glow.addColorStop(0,boss?`${bossColor}e8`:"rgba(88,183,130,.88)");glow.addColorStop(1,"rgba(16,32,29,0)");
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,radius*1.5,0,Math.PI*2);ctx.fill();
  if(e.kind==="crawler"){ctx.strokeStyle=difficulty==="high"?"#b97df0":"#74c69c";ctx.lineWidth=4;ctx.lineCap="round";for(let i=0;i<3;i++){const yy=-4+i*8,wave=Math.sin(t*7+e.phase+i)*4;ctx.beginPath();ctx.moveTo(-10,yy);ctx.lineTo(-25-wave,yy+8);ctx.lineTo(-31,yy+15);ctx.moveTo(10,yy);ctx.lineTo(25+wave,yy+8);ctx.lineTo(31,yy+15);ctx.stroke();}ctx.fillStyle="#254e42";ctx.strokeStyle="#8dd5b0";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,3,19,16,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#162e29";ctx.beginPath();ctx.arc(0,-10,13,0,Math.PI*2);ctx.fill();ctx.stroke();}else{ctx.fillStyle=boss?bossColor:"#3c7d63";ctx.beginPath();ctx.arc(0,-5,radius,Math.PI,0);ctx.quadraticCurveTo(radius,18,radius*.45,23);ctx.quadraticCurveTo(8,12,0,28+Math.sin(t*6+e.phase)*5);ctx.quadraticCurveTo(-8,12,-radius*.45,23);ctx.quadraticCurveTo(-radius,17,-radius,-5);ctx.fill();ctx.strokeStyle=boss?"#ffd07e":"#7cc9a2";ctx.lineWidth=boss?3:2;ctx.stroke();}
  ctx.shadowColor="#d9ff95";ctx.shadowBlur=10;ctx.fillStyle="#eaffba";ctx.beginPath();ctx.roundRect(-11,-9,7,5,2);ctx.roundRect(4,-9,7,5,2);ctx.fill();ctx.shadowBlur=0;
  if(boss){ctx.fillStyle="#f1cf70";ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI+i*Math.PI/4;ctx.lineTo(Math.cos(a)*35,Math.sin(a)*31-10);ctx.lineTo(Math.cos(a+.18)*50,Math.sin(a+.18)*45-10);}ctx.fill();ctx.fillStyle=popupBossEmblem(scenarioId);ctx.beginPath();ctx.arc(0,5,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff0bd";ctx.lineWidth=2;ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#fff0bd";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(SCENARIOS[scenarioId].boss,0,-61);}
  const ratio=Math.max(0,e.hp/e.maxHp);ctx.fillStyle="#12161a";ctx.fillRect(-radius,-radius-14,radius*2,5);ctx.fillStyle=boss?"#e45d5d":"#62d596";ctx.fillRect(-radius,-radius-14,radius*2*ratio,5);
  ctx.restore();
}

export function popupBossEmblem(scenarioId:ScenarioId){return scenarioId==="kitchen"?"#ffdf75":scenarioId==="restaurant"?"#a7ef74":scenarioId==="camping"?"#ff8b3f":"#9c8dff";}

export function drawScenarioProps(ctx:CanvasRenderingContext2D,scenarioId:ScenarioId,time:number){
  ctx.save();ctx.lineWidth=2;ctx.textAlign="center";
  if(scenarioId==="kitchen"){
    [[78,210],[470,438],[836,170],[1228,690]].forEach(([x,y],index)=>{ctx.fillStyle="#23323a";ctx.strokeStyle="#647b85";ctx.beginPath();ctx.roundRect(x,y,102,38,7);ctx.fill();ctx.stroke();ctx.fillStyle="#0b1216";ctx.beginPath();ctx.arc(x+29,y+17,10,0,Math.PI*2);ctx.arc(x+72,y+17,10,0,Math.PI*2);ctx.fill();ctx.strokeStyle=index%2?"#4fcad0":"#d49d46";ctx.beginPath();ctx.arc(x+29,y+17,5,0,Math.PI*2);ctx.arc(x+72,y+17,5,0,Math.PI*2);ctx.stroke();});
    ctx.strokeStyle="#9aa7a9";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(65,805);ctx.lineTo(325,805);ctx.lineTo(325,750);ctx.stroke();ctx.fillStyle="#d9ae4f";ctx.font="bold 9px sans-serif";ctx.fillText("급식실 가스 배관 B",195,829);
  }else if(scenarioId==="restaurant"){
    [[100,232],[505,455],[856,196],[1260,672]].forEach(([x,y],index)=>{ctx.fillStyle="#473a31";ctx.strokeStyle="#a4774c";ctx.beginPath();ctx.ellipse(x,y,45,25,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#2b2522";for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;ctx.fillRect(x+Math.cos(a)*58-9,y+Math.sin(a)*38-9,18,18);}ctx.fillStyle=index%2?"#7edc9a":"#d8c070";ctx.beginPath();ctx.arc(x,y-2,5,0,Math.PI*2);ctx.fill();});
    ctx.fillStyle="rgba(112,198,92,.1)";ctx.fillRect(0,740,WORLD.w,150);ctx.strokeStyle="rgba(132,231,107,.36)";ctx.setLineDash([15,10]);ctx.beginPath();ctx.moveTo(50,825);ctx.lineTo(1480,825);ctx.stroke();ctx.setLineDash([]);
  }else if(scenarioId==="camping"){
    [[120,270],[535,430],[1010,190],[1290,720]].forEach(([x,y],index)=>{ctx.fillStyle=index%2?"#315451":"#664e2c";ctx.strokeStyle=index%2?"#72c4b2":"#e1aa57";ctx.beginPath();ctx.moveTo(x-48,y+28);ctx.lineTo(x,y-42);ctx.lineTo(x+48,y+28);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle="rgba(255,255,255,.35)";ctx.beginPath();ctx.moveTo(x,y-42);ctx.lineTo(x,y+28);ctx.stroke();ctx.fillStyle="#ffd676";ctx.shadowColor="#ff9e32";ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+58,y+18,6+Math.sin(time*5+index)*2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;});
  }else{
    [[110,228],[480,445],[830,175],[1210,690]].forEach(([x,y],index)=>{ctx.fillStyle="#203443";ctx.strokeStyle="#6ca8c9";ctx.beginPath();ctx.roundRect(x,y,105,47,5);ctx.fill();ctx.stroke();ctx.fillStyle="#74d6ff";for(let i=0;i<4;i++){const light=.4+.6*Math.sin(time*3+i+index);ctx.globalAlpha=light;ctx.fillRect(x+12+i*21,y+12,11,7);}ctx.globalAlpha=1;ctx.fillStyle="#0a1820";ctx.fillRect(x+13,y+28,78,7);});
    ctx.strokeStyle="#66869a";ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(42,780);ctx.bezierCurveTo(350,710,620,850,920,760);ctx.bezierCurveTo(1120,710,1300,780,1500,730);ctx.stroke();ctx.strokeStyle="#9ccbe2";ctx.lineWidth=2;ctx.stroke();
  }
  ctx.restore();
}

export function drawDynamicBlock(ctx:CanvasRenderingContext2D,run:RunState,time:number){
  if(run.eventType!=="block"||run.eventTimer<=0)return;const pulse=(Math.sin(time*8)+1)/2;ctx.save();ctx.translate(724,676);ctx.shadowColor="#f0673f";ctx.shadowBlur=16+pulse*12;ctx.fillStyle="#32140e";ctx.strokeStyle="#ff8a58";ctx.lineWidth=4;ctx.beginPath();ctx.roundRect(0,0,88,116,7);ctx.fill();ctx.stroke();ctx.strokeStyle="#ffc06b";ctx.lineWidth=6;for(let y=14;y<105;y+=25){ctx.beginPath();ctx.moveTo(8,y);ctx.lineTo(80,y+18);ctx.stroke();}ctx.fillStyle="#fff0c3";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("통로 폐쇄",44,58);ctx.restore();
}

export function drawBossTelegraph(ctx:CanvasRenderingContext2D,run:RunState,time:number,difficulty:Difficulty){
  const boss=run.enemies.find(e=>e.kind==="boss"&&e.hp>0);if(!boss||run.bossPatternWait>1.25)return;const progress=1-clamp(run.bossPatternWait/1.25,0,1),scenario=SCENARIOS[run.scenarioId],rings=difficulty==="high"?3:2;ctx.save();ctx.translate(boss.x,boss.y);ctx.shadowColor=scenario.bossColor;ctx.shadowBlur=18;ctx.strokeStyle=`${scenario.bossColor}${Math.round((.4+progress*.5)*255).toString(16).padStart(2,"0")}`;ctx.setLineDash([12,8]);ctx.lineDashOffset=-time*30;for(let i=0;i<rings;i++){ctx.lineWidth=3+i;ctx.beginPath();ctx.arc(0,0,72+i*48-progress*18,0,Math.PI*2);ctx.stroke();}ctx.setLineDash([]);ctx.fillStyle="#fff0c7";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("위험 패턴 예고",0,-78-rings*15);ctx.restore();
}

export function drawRespawnPortal(ctx:CanvasRenderingContext2D,e:Enemy,t:number){
  const remaining=Math.max(0,e.respawnWait),progress=1-clamp(remaining/7,0,1),pulse=(Math.sin(t*8+e.phase)+1)/2,radius=22+progress*19+pulse*4;
  ctx.save();ctx.translate(e.spawnX,e.spawnY);ctx.globalAlpha=.48+progress*.5;ctx.shadowColor="#b56cff";ctx.shadowBlur=18+progress*22;
  const glow=ctx.createRadialGradient(0,0,2,0,0,radius+18);glow.addColorStop(0,"rgba(235,210,255,.7)");glow.addColorStop(.28,"rgba(161,75,224,.5)");glow.addColorStop(1,"rgba(58,18,94,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,radius+18,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle="#d99aff";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,8,radius,radius*.42,t*.8,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="#7d3dc2";ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,8,radius*.72,radius*.27,-t*1.1,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<9;i++){const a=t*1.7+i*Math.PI*2/9,rr=radius+7+(i%3)*5;ctx.fillStyle=i%2?"#e8b7ff":"#9f65e4";ctx.beginPath();ctx.arc(Math.cos(a)*rr,8+Math.sin(a)*rr*.42,2+(i%2),0,Math.PI*2);ctx.fill();}
  ctx.shadowBlur=0;ctx.fillStyle="#f3dbff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(remaining>0?`${Math.ceil(remaining)}초 후 재출현`:"균열 개방",0,-29);ctx.restore();
}

export function drawLeakSource(ctx:CanvasRenderingContext2D,run:RunState,time:number){
  const scenario=SCENARIOS[run.scenarioId],visible=run.detectedLeak||run.pulseAge<1.1,pulse=(Math.sin(time*7)+1)/2;
  if(!visible)return;ctx.save();ctx.translate(scenario.leak.x,scenario.leak.y);ctx.globalAlpha=run.detectedLeak?1:.56;
  ctx.shadowColor=scenario.color;ctx.shadowBlur=18+pulse*15;ctx.strokeStyle=scenario.color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,24+pulse*6,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="#eafff7";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-16,-8);ctx.lineTo(-5,-2);ctx.lineTo(-12,11);ctx.lineTo(1,5);ctx.lineTo(8,17);ctx.lineTo(15,4);ctx.stroke();
  ctx.shadowBlur=0;ctx.fillStyle="#e9fff9";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText(run.detectedLeak?"누출원 특정":"탐지 반응",0,-37);ctx.restore();
}

export function drawBossShield(ctx:CanvasRenderingContext2D,e:Enemy,time:number,shielded:boolean){
  if(!shielded)return;const pulse=(Math.sin(time*5)+1)/2;ctx.save();ctx.translate(e.x,e.y);ctx.strokeStyle=`rgba(108,224,238,${.52+pulse*.3})`;ctx.lineWidth=5;ctx.shadowColor="#62dce9";ctx.shadowBlur=20;ctx.beginPath();ctx.arc(0,0,58+pulse*4,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#d7fbff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("SAFE 행동으로 브레이크",0,-72);ctx.restore();
}

export function drawStation(ctx:CanvasRenderingContext2D,station:typeof STATIONS[number],done:boolean,t:number){
  const pulse=1+Math.sin(t*3)*.08;
  ctx.save();ctx.translate(station.x,station.y);ctx.scale(pulse,pulse);
  ctx.shadowColor=done?"#67e2a8":station.color;ctx.shadowBlur=20;
  ctx.fillStyle=done?"#286c51":"#222932";ctx.strokeStyle=done?"#8af0bb":station.color;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(22,-10);ctx.lineTo(18,18);ctx.lineTo(0,28);ctx.lineTo(-18,18);ctx.lineTo(-22,-10);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=done?"#d7ffe9":"#f7e7b2";ctx.font=`bold ${station.mark.length>2?10:16}px sans-serif`;ctx.textAlign="center";ctx.fillText(done?"✓":station.mark,0,5);
  ctx.shadowBlur=0;ctx.fillStyle="#e9edf2";ctx.font="bold 10px sans-serif";ctx.fillText(station.label,0,43);
  ctx.restore();
}

export function drawTablet(ctx:CanvasRenderingContext2D,tablet:typeof TABLETS[number],done:boolean,t:number){
  const pulse=1+Math.sin(t*2.5+tablet.x)*.06;ctx.save();ctx.translate(tablet.x,tablet.y);ctx.scale(pulse,pulse);
  ctx.shadowColor=done?"#65d9a0":tablet.color;ctx.shadowBlur=18;ctx.fillStyle=done?"#244e3d":"#282234";ctx.strokeStyle=done?"#75d6a6":tablet.color;ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-18,23);ctx.lineTo(-14,-25);ctx.lineTo(14,-25);ctx.lineTo(18,23);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=done?"#d8ffe9":"#eadfff";ctx.font=`bold ${tablet.mark.length>1?13:18}px sans-serif`;ctx.textAlign="center";ctx.fillText(done?"✓":tablet.mark,0,4);
  ctx.shadowBlur=0;ctx.fillStyle="#e9e1f2";ctx.font="bold 10px sans-serif";ctx.fillText(tablet.label,0,40);ctx.restore();
}

export function drawEvidence(ctx:CanvasRenderingContext2D,item:(typeof EVIDENCE)[ScenarioId][number],collected:boolean,time:number){
  const pulse=(Math.sin(time*4+item.x*.01)+1)/2;ctx.save();ctx.translate(item.x,item.y);ctx.globalAlpha=collected?.32:1;ctx.fillStyle="rgba(3,9,12,.72)";ctx.beginPath();ctx.ellipse(0,14,25,8,0,0,Math.PI*2);ctx.fill();ctx.shadowColor=collected?"#59db9a":"#63e6f2";ctx.shadowBlur=collected?5:16+pulse*8;ctx.strokeStyle=collected?"#4f8b70":"#75f0ef";ctx.lineWidth=3;ctx.fillStyle=collected?"#17372b":"#12313a";ctx.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,x=Math.cos(a)*(22+pulse*2),y=Math.sin(a)*(22+pulse*2);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle=collected?"#8ab7a4":"#e7ffff";ctx.font="bold 15px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(collected?"✓":item.icon,0,1);ctx.fillStyle=collected?"#6d8d80":"#c9f3f0";ctx.font="bold 8px sans-serif";ctx.fillText(collected?"증거 기록됨":item.label,0,37);ctx.restore();
}

export function drawCache(ctx:CanvasRenderingContext2D,cache:typeof CACHES[number],opened:boolean){
  ctx.save();ctx.translate(cache.x,cache.y);ctx.fillStyle="rgba(0,0,0,.5)";ctx.beginPath();ctx.ellipse(0,13,20,7,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=opened?"#3b3d3f":"#76511f";ctx.strokeStyle=opened?"#6e7374":"#d5a548";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-19,-12,38,28,5);ctx.fill();ctx.stroke();
  ctx.fillStyle=opened?"#24282a":"#edc769";ctx.fillRect(-4,-3,8,9);ctx.restore();
}

export function drawRescue(ctx:CanvasRenderingContext2D,rescue:typeof RESCUES[number],done:boolean,t:number){
  ctx.save();ctx.translate(rescue.x,rescue.y+Math.sin(t*3+rescue.x)*2);ctx.globalAlpha=done?.34:1;ctx.fillStyle=done?"#245442":"#25313a";ctx.strokeStyle=done?"#5fc493":"#e0b866";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-8,15,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.font="22px sans-serif";ctx.textAlign="center";ctx.fillText(done?"✓":rescue.icon,0,0);ctx.fillStyle="#ddd7c9";ctx.font="bold 9px sans-serif";ctx.fillText(done?"대피 완료":rescue.label,0,28);ctx.restore();
}

export function drawSparkTrap(ctx:CanvasRenderingContext2D,trap:typeof SPARK_TRAPS[number],time:number,forced=false,reducedFx=false,difficulty:Difficulty="elementary"){
  const cfg=DIFFICULTIES[difficulty],cycle=(time*cfg.trapTempo+trap.phase)%4,active=forced||cycle<cfg.trapWindow,warning=!forced&&cycle>3.05,pulse=(Math.sin(time*(reducedFx?4:13)+trap.phase)+1)/2,scale=cfg.trapRadius/46;
  ctx.save();ctx.translate(trap.x,trap.y);ctx.scale(scale,scale);
  const base=ctx.createRadialGradient(0,0,4,0,0,42);base.addColorStop(0,active?"#fff6ad":warning?"#e8a43f":"#625636");base.addColorStop(.35,active?"#ffae32":warning?"#8d521e":"#303237");base.addColorStop(1,"#101317");ctx.fillStyle=base;ctx.strokeStyle=active?"#fff08a":warning?"#ffad42":"#746844";ctx.lineWidth=active?4:2;
  ctx.beginPath();for(let i=0;i<8;i++){const a=-Math.PI/2+i*Math.PI/4,x=Math.cos(a)*38,y=Math.sin(a)*38;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle=active?"rgba(255,245,135,.94)":warning?"rgba(255,156,54,.76)":"rgba(120,105,64,.42)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,24,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=active?"#2a1605":warning?"#291608":"#8b7b4d";ctx.font="bold 22px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("⚡",0,2);
  if(warning||forced){const ring=46+pulse*10;ctx.shadowColor="#ff8a26";ctx.shadowBlur=reducedFx?10:24;ctx.strokeStyle=`rgba(255,132,33,${.4+pulse*.45})`;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,ring,0,Math.PI*2);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,ring+12,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;ctx.fillStyle="#ffb24d";ctx.font="bold 9px sans-serif";ctx.fillText(forced?"전기 스파크!":"점화 경고",0,61);}
  if(active){
    const glow=ctx.createRadialGradient(0,0,8,0,0,82);glow.addColorStop(0,"rgba(255,248,183,.72)");glow.addColorStop(.35,"rgba(255,166,45,.34)");glow.addColorStop(1,"rgba(255,75,18,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,82,0,Math.PI*2);ctx.fill();
    ctx.lineCap="round";for(let bolt=0;bolt<(reducedFx?3:7);bolt++){const a=bolt*Math.PI*2/(reducedFx?3:7)+Math.sin(time*8+bolt)*.12;ctx.shadowColor=bolt%2?"#ff6a24":"#fff4a4";ctx.shadowBlur=reducedFx?7:18;ctx.strokeStyle=bolt%2?"#ff8b32":"#fff0a0";ctx.lineWidth=bolt%2?4:3;ctx.beginPath();ctx.moveTo(Math.cos(a)*10,Math.sin(a)*10);for(let step=1;step<=4;step++){const radius=step*18,jitter=Math.sin(time*(reducedFx?5:22)+bolt*4+step)*7;const side=a+Math.PI/2;ctx.lineTo(Math.cos(a)*radius+Math.cos(side)*jitter,Math.sin(a)*radius+Math.sin(side)*jitter);}ctx.stroke();}
    ctx.shadowBlur=0;for(let i=0;i<(reducedFx?6:16);i++){const a=i*Math.PI*2/(reducedFx?6:16)+time*2.7,radius=46+(i%4)*10+Math.sin(time*9+i)*7;ctx.fillStyle=i%3?"#ff9b35":"#fff1a3";ctx.beginPath();ctx.arc(Math.cos(a)*radius,Math.sin(a)*radius,2+(i%3),0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle=`rgba(255,225,100,${.75-pulse*.25})`;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,54+pulse*24,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

export function drawMinimap(ctx:CanvasRenderingContext2D,run:RunState,camera:{x:number;y:number},time:number){
  const x=785,y=56,w=155,h=96,sx=w/WORLD.w,sy=h/WORLD.h;ctx.save();ctx.fillStyle="rgba(7,9,12,.92)";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#8b7548";ctx.lineWidth=1;ctx.strokeRect(x-.5,y-.5,w+1,h+1);
  if(run.eventType==="sensor"&&run.eventTimer>0){ctx.fillStyle="rgba(22,9,31,.96)";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#e36aff";ctx.setLineDash([5,4]);ctx.strokeRect(x+5,y+5,w-10,h-10);ctx.setLineDash([]);ctx.fillStyle="#f0b9ff";ctx.font="bold 10px sans-serif";ctx.textAlign="center";ctx.fillText("SENSOR 03 · OFFLINE",x+w/2,y+h/2);ctx.fillStyle="#8e6b99";ctx.font="bold 7px sans-serif";ctx.fillText("현장 표지와 방향 화살표 사용",x+w/2,y+h/2+15);ctx.restore();return;}
  ["#23343c","#20363b","#302b3a","#393124"].forEach((color,index)=>{ctx.fillStyle=color;ctx.fillRect(x+index*384*sx,y,384*sx,h);});
  ctx.fillStyle="#94a9b4";WALLS.forEach(v=>ctx.fillRect(x+v.x*sx,y+v.y*sy,Math.max(1.5,v.w*sx),Math.max(1.5,v.h*sy)));
  ctx.fillStyle="#52efd0";DOORWAYS.forEach(v=>ctx.fillRect(x+v.x*sx,y+v.y*sy,Math.max(2,v.w*sx),Math.max(2,v.h*sy)));
  if(run.detectedLeak){const leak=SCENARIOS[run.scenarioId].leak;ctx.fillStyle="#ff665a";ctx.beginPath();ctx.arc(x+leak.x*sx,y+leak.y*sy,3,0,Math.PI*2);ctx.fill();}
  STATIONS.forEach((s,i)=>{ctx.fillStyle=run.completed.has(s.id)?"#5dd79a":i===run.completed.size?"#efc95f":"#76674a";ctx.beginPath();ctx.arc(x+s.x*sx,y+s.y*sy,3,0,Math.PI*2);ctx.fill();});
  TABLETS.forEach(s=>{ctx.fillStyle=run.knowledge.has(s.id)?"#58c995":"#aa7de0";ctx.fillRect(x+s.x*sx-1.5,y+s.y*sy-1.5,3,3);});
  EVIDENCE[run.scenarioId].forEach(item=>{ctx.fillStyle=run.evidence.has(item.id)?"#4e7867":"#6ce3e8";ctx.beginPath();ctx.arc(x+item.x*sx,y+item.y*sy,2.5,0,Math.PI*2);ctx.fill();});
  const target=objectiveTarget(run),blink=.55+Math.sin(time*6)*.45;ctx.strokeStyle=`rgba(255,216,91,${blink})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(x+target.x*sx,y+target.y*sy,5+blink*3,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#ffe47c";ctx.font="bold 7px sans-serif";ctx.fillText("NEXT",x+target.x*sx+7,y+target.y*sy-5);
  ctx.strokeStyle="rgba(105,215,231,.56)";ctx.strokeRect(x+camera.x*sx,y+camera.y*sy,960*sx,576*sy);ctx.fillStyle="#e8fdff";ctx.beginPath();ctx.arc(x+run.player.x*sx,y+run.player.y*sy,3.5,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#1b7180";ctx.stroke();ctx.fillStyle="#e0d2ae";ctx.font="bold 7px sans-serif";ctx.textAlign="left";ctx.fillText("탐사 지도",x+5,y+9);
  ctx.fillStyle="rgba(6,10,13,.88)";ctx.beginPath();ctx.roundRect(x,y+h+6,w,24,5);ctx.fill();ctx.strokeStyle="rgba(125,151,162,.55)";ctx.stroke();ctx.font="bold 8px sans-serif";ctx.textBaseline="middle";
  ctx.fillStyle="#94a9b4";ctx.fillRect(x+7,y+h+13,9,9);ctx.fillStyle="#d8e6ec";ctx.fillText("벽",x+20,y+h+18);
  ctx.fillStyle="#52efd0";ctx.fillRect(x+48,y+h+13,9,9);ctx.fillStyle="#d8fff7";ctx.fillText("통로",x+61,y+h+18);
  ctx.fillStyle="#2d4148";ctx.fillRect(x+99,y+h+13,9,9);ctx.fillStyle="#d8e6ec";ctx.fillText("바닥",x+112,y+h+18);ctx.restore();
}

function drawParticles(ctx:CanvasRenderingContext2D,run:RunState){
  for(const p of run.particles){
    const ratio=clamp(p.life/p.maxLife,0,1);
    ctx.globalAlpha=ratio;ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size*ratio,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

export function drawWorld(ctx:CanvasRenderingContext2D,run:RunState,time:number,reducedFx=false,difficulty:Difficulty="elementary",suitTier=1){
  const camera={x:clamp(run.player.x-480,0,WORLD.w-960),y:clamp(run.player.y-288,0,WORLD.h-576)};
  if(run.shake>0){const mag=run.shake*(reducedFx?3:9);camera.x+=(Math.random()-.5)*mag;camera.y+=(Math.random()-.5)*mag;}
  const scenario=SCENARIOS[run.scenarioId];
  ctx.clearRect(0,0,960,576);ctx.fillStyle="#0c0e12";ctx.fillRect(0,0,960,576);ctx.save();ctx.translate(-camera.x,-camera.y);
  ctx.fillStyle="#18232a";ctx.fillRect(0,0,WORLD.w,WORLD.h);
  const startX=Math.floor(camera.x/32)*32,startY=Math.floor(camera.y/32)*32;
  const floorPalettes=[["#2c3d45","#273840"],["#294046","#253a40"],["#393342","#332e3c"],["#433a2d","#3d3428"]];
  for(let y=startY;y<Math.min(WORLD.h,camera.y+608);y+=32){for(let x=startX;x<Math.min(WORLD.w,camera.x+992);x+=32){const odd=((x/32)+(y/32))%2,zone=Math.min(3,Math.floor(x/384));ctx.fillStyle=floorPalettes[zone][odd];ctx.fillRect(x,y,32,32);ctx.strokeStyle="rgba(169,198,207,.13)";ctx.strokeRect(x+.5,y+.5,31,31);}}
  ctx.strokeStyle="rgba(181,221,228,.16)";ctx.lineWidth=2;[384,768,1152].forEach(x=>{ctx.beginPath();ctx.moveTo(x,32);ctx.lineTo(x,928);ctx.stroke();});
  ctx.fillStyle="rgba(222,231,223,.18)";ctx.font="bold 28px Georgia,serif";ctx.textAlign="center";[[190,90,"서부 배관실"],[550,90,"환기 기록실"],[935,90,"실험 저장고"],[1325,90,"야외 인계구역"]].forEach(z=>ctx.fillText(String(z[2]),Number(z[0]),Number(z[1])));
  GAS_POOLS.forEach((pool,index)=>{if(!scenario.poolIndices.includes(index))return;const radius=pool.r*run.gasLevel,reveal=run.pulseAge<1.1?1:.42,alpha=clamp(run.gasLevel*.31*reveal,.025,.5);const g=ctx.createRadialGradient(pool.x,pool.y,3,pool.x,pool.y,radius);g.addColorStop(0,`${scenario.color}${Math.round(alpha*255).toString(16).padStart(2,"0")}`);g.addColorStop(.68,`${scenario.color}${Math.round(alpha*.58*255).toString(16).padStart(2,"0")}`);g.addColorStop(1,`${scenario.color}00`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(pool.x,pool.y,radius,0,Math.PI*2);ctx.fill();const motes=reducedFx?5:11;for(let i=0;i<motes;i++){const a=i*2.399+index*.8+time*(.13+i%3*.025),rr=radius*(.18+(i%7)/8),mx=pool.x+Math.cos(a)*rr,my=pool.y+Math.sin(a*.83)*rr*.56-Math.sin(time*.8+i)*10;ctx.fillStyle=`${scenario.color}${run.pulseAge<1.1?"aa":"55"}`;ctx.beginPath();ctx.arc(mx,my,2+(i%3),0,Math.PI*2);ctx.fill();}if(run.pulseAge<1.1){ctx.strokeStyle=`${scenario.color}88`;ctx.setLineDash([8,7]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(pool.x,pool.y,radius*.72,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}});
  if(run.guidePath.length&&(run.guideAge>0||difficulty==="elementary")){ctx.save();ctx.globalAlpha=difficulty==="elementary"?.78:clamp(run.guideAge/3,0,.85);ctx.strokeStyle="#63f2d1";ctx.shadowColor="#4de7c4";ctx.shadowBlur=reducedFx?6:15;ctx.lineWidth=difficulty==="elementary"?9:6;ctx.lineCap="round";ctx.setLineDash([8,15]);ctx.lineDashOffset=-time*45;ctx.beginPath();run.guidePath.forEach((p,index)=>index?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.setLineDash([]);ctx.restore();}
  drawScenarioProps(ctx,run.scenarioId,time);WALLS.forEach(w=>drawStoneWall(ctx,w));DOORWAYS.forEach(door=>drawDoorway(ctx,door,time));drawDynamicBlock(ctx,run,time);
  [[90,100],[310,390],[430,110],[680,580],[815,90],[1080,700],[1190,110],[1460,580]].forEach(([x,y],i)=>{const g=ctx.createRadialGradient(x,y,0,x,y,60);g.addColorStop(0,i%2?"rgba(67,161,191,.22)":"rgba(225,177,66,.16)");g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.fillRect(x-65,y-65,130,130);ctx.fillStyle=i%2?"#4bb3ce":"#c89c3e";ctx.fillRect(x-3,y-7,6,14);});
  if(run.scenarioId==="kitchen"&&run.pulseAge<1.1){[{x:118,y:792},{x:312,y:786}].forEach((decoy,index)=>{ctx.save();ctx.translate(decoy.x,decoy.y);ctx.strokeStyle="rgba(128,177,181,.58)";ctx.setLineDash([5,5]);ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,20+Math.sin(time*5+index)*3,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#91a8aa";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("정상 배관",0,-27);ctx.restore();});}
  drawLeakSource(ctx,run,time);EVIDENCE[run.scenarioId].forEach(item=>drawEvidence(ctx,item,run.evidence.has(item.id),time));CACHES.forEach(c=>drawCache(ctx,c,run.caches.has(c.id)));RESCUES.forEach(r=>{drawRescue(ctx,r,run.rescued.has(r.id),time);if(run.rescued.has(r.id)&&run.rescueMarkerAge>0){ctx.save();ctx.translate(r.x,r.y);ctx.strokeStyle="rgba(104,242,189,.8)";ctx.shadowColor="#52e5a9";ctx.shadowBlur=16;ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(0,0,38+Math.sin(time*6)*4,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="#bfffe4";ctx.font="bold 8px sans-serif";ctx.textAlign="center";ctx.fillText("구조 비콘 · 안전구역 전송",0,-48);ctx.restore();}});
  STATIONS.forEach(s=>drawStation(ctx,s,run.completed.has(s.id),time));TABLETS.forEach(s=>drawTablet(ctx,s,run.knowledge.has(s.id),time));
  SPARK_TRAPS.forEach(trap=>drawSparkTrap(ctx,trap,time,run.sparkBurst>0,reducedFx,difficulty));
  run.enemies.filter(e=>e.hp<=0&&e.respawnable).forEach(e=>drawRespawnPortal(ctx,e,time));run.enemies.filter(e=>e.hp>0).forEach(e=>{drawEnemy(ctx,e,time,run.scenarioId,difficulty);if(e.kind==="boss")drawBossShield(ctx,e,time,run.bossBreak<5);});drawBossTelegraph(ctx,run,time,difficulty);
  if(run.droneAge>0){ctx.save();ctx.translate(run.player.x+Math.cos(time*4)*42,run.player.y+Math.sin(time*4)*20-24);ctx.shadowColor="#6fe9ff";ctx.shadowBlur=14;ctx.fillStyle="#9bf1ff";ctx.strokeStyle="#174856";ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(-15,-8,30,16,5);ctx.fill();ctx.stroke();ctx.fillStyle="#efffff";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText("AUTO",0,3);ctx.restore();}
  if(run.shieldAge>0){const pulse=Math.sin(time*6)*3;ctx.strokeStyle="rgba(110,235,255,.8)";ctx.shadowColor="#54dce9";ctx.shadowBlur=16;ctx.lineWidth=5;ctx.beginPath();ctx.arc(run.player.x,run.player.y,31+pulse,0,Math.PI*2);ctx.stroke();ctx.shadowBlur=0;}
  if(run.ventAge>0){ctx.save();ctx.strokeStyle="rgba(116,245,182,.72)";ctx.lineWidth=4;for(let i=0;i<3;i++){const a=time*2+i*Math.PI*2/3,r=50+i*14;ctx.beginPath();ctx.arc(run.player.x,run.player.y,r,a,a+1.3);ctx.stroke();}ctx.restore();}
  if(run.pulseAge<.5){const p=run.player;const radius=28+run.pulseAge*(255+run.knowledge.size*28);ctx.strokeStyle=`rgba(99,220,238,${1-run.pulseAge*2})`;ctx.lineWidth=5;ctx.beginPath();ctx.arc(p.x,p.y,radius,0,Math.PI*2);ctx.stroke();}
  drawParticles(ctx,run);
  drawHero(ctx,run.player.x,run.player.y,run.player.facingX,run.player.facingY,time,run.hitFlash,suitTier,run.player.moving,difficulty);ctx.restore();
  const px=run.player.x-camera.x,py=run.player.y-camera.y;const shade=ctx.createRadialGradient(px,py,difficulty==="elementary"?120:88,px,py,difficulty==="high"?345:420);shade.addColorStop(0,"rgba(2,4,8,0)");shade.addColorStop(.62,difficulty==="high"?"rgba(8,2,12,.19)":"rgba(2,4,8,.12)");shade.addColorStop(1,difficulty==="elementary"?"rgba(2,12,9,.5)":difficulty==="high"?"rgba(14,1,19,.74)":"rgba(2,4,8,.62)");ctx.fillStyle=shade;ctx.fillRect(0,0,960,576);drawMinimap(ctx,run,camera,time);
  const target=objectiveTarget(run),tx=target.x-camera.x,ty=target.y-camera.y;if(tx<26||tx>934||ty<45||ty>545){const angle=Math.atan2(ty-py,tx-px),cx=clamp(px+Math.cos(angle)*230,55,905),cy=clamp(py+Math.sin(angle)*165,68,520);ctx.save();ctx.translate(cx,cy);ctx.rotate(angle+Math.PI/2);ctx.shadowColor="#ffd95e";ctx.shadowBlur=15;ctx.fillStyle="#ffe071";ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(14,12);ctx.lineTo(0,7);ctx.lineTo(-14,12);ctx.closePath();ctx.fill();ctx.restore();ctx.fillStyle="#fff0b0";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.fillText(`${Math.round(distance(run.player.x,run.player.y,target.x,target.y)/10)}m`,cx,cy+31);}
  if(run.hitFlash>0){ctx.fillStyle=`rgba(190,30,30,${run.hitFlash*.25})`;ctx.fillRect(0,0,960,576);}
}
