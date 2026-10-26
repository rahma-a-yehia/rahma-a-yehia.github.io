(() => {
'use strict';
const $ = id => document.getElementById(id);
const ids=['welcome','introCat','menu','garden','sky','sea','under'];
const flowers=[
 {id:'daisy',name:'White Daisy',latin:'Bellis perennis',energy:'PEACE',title:'The Art of Doing Nothing',message:"You don't have to fill every minute with something important.\nSometimes a quiet moment is important enough.",cat:"This one's especially good at taking naps. I approve.",take:'Keep this little peace'},
 {id:'rose',name:'Pink Rose',latin:'Rosa',energy:'APPRECIATION',title:'The Beauty of Being You',message:"Some people make the world a little nicer simply by being part of it.\nI hope you know that you're one of those people to me.",cat:'Be careful. Roses are beautiful, but they have boundaries. Respectable.',take:'Keep this little warmth'},
 {id:'lavender',name:'Lavender',latin:'Lavandula',energy:'REST',title:'Permission to Rest',message:"You don't always have to be the strong one.\nYou don't have to have everything figured out.\nEven your mind deserves a quiet afternoon.",cat:'Excellent choice. This flower understands my entire lifestyle.',take:'Keep this little calm'},
 {id:'sunflower',name:'Sunflower',latin:'Helianthus annuus',energy:'HOPE',title:'A Little More Light',message:"Some days are cloudy.\nSome days you can't see what's coming next.\nBut a difficult chapter isn't the whole story.\nThere are still wonderful things you haven't met yet.",cat:'This one insists on facing the light. Very optimistic. Slightly exhausting.',take:'Keep this little hope'},
 {id:'tulip',name:'Red Tulip',latin:'Tulipa',energy:'COURAGE',title:'The Quiet Kind of Brave',message:"Courage doesn't always look like winning.\nSometimes it looks like trying again.\nSometimes it looks like admitting you're tired.\nAnd sometimes it looks like simply making it through today.",cat:'I once stood up to a vacuum cleaner. I understand courage.',take:'Keep this little courage'},
 {id:'hydrangea',name:'Blue Hydrangea',latin:'Hydrangea macrophylla',energy:'UNDERSTANDING',title:"You Don't Have to Explain Everything",message:"Not every feeling needs an explanation.\nNot every silence means something is wrong.\nYou can have complicated days and still be appreciated, exactly as you are.",cat:'Humans use an awful lot of words. Sometimes sitting together works just fine.',take:'Keep this little understanding'}
];
const fireflyLines=[
 'I hope something makes you laugh today.',
 "You're allowed to have an off day.",
 'Good things can arrive quietly.',
 'Somewhere, someone is genuinely glad they met you.',
 "Just a reminder: you're doing better than you might think."
];
const prog=[
 'One little piece of light.','The garden is getting brighter.','Halfway to something lovely.',
 'I think the cat is impressed.','Just one little surprise left.',
 "You've found them all. But something else is blooming..."
];
const saved=(()=>{try{return JSON.parse(localStorage.getItem('morfy-somewhere-soft-v2'))||{}}catch{return {}}})();
const state={mode:'welcome',catStep:0,flowers:new Set(Array.isArray(saved.flowers)?saved.flowers:[]),fireflies:new Set(Array.isArray(saved.fireflies)?saved.fireflies:[]),golden:!!saved.golden,resting:false,swimming:false,float:false,underQuiet:false,lookingUp:false,moveTimeout:null,toastTimeout:null,modalDone:null,seaAction:0,px:50,py:79};
const scene=$('scene'),pic=$('scenePicture'),audio=$('rahmaAudio'),modal=$('modal');
const sceneVideo=$('sceneVideo');
const loopVideos={sky:'assets/videos/sky.mp4',sea:'assets/videos/sea.mp4',under:'assets/videos/underwater.mp4'};
let videoScene='';
sceneVideo.addEventListener('loadeddata',()=>{if(loopVideos[state.mode]===sceneVideo.getAttribute('src'))sceneVideo.classList.add('playing');});
sceneVideo.addEventListener('error',()=>{sceneVideo.classList.remove('playing');});
function updateSceneVideo(mode){
 const path=loopVideos[mode];
 if(!path){sceneVideo.pause();sceneVideo.classList.remove('playing');return;}
 if(videoScene!==mode){
   sceneVideo.pause();sceneVideo.classList.remove('playing');
   videoScene=mode;sceneVideo.src=path;sceneVideo.load();
 }
 // Muted inline playback is allowed without a second tap on iOS/Android.
 sceneVideo.muted=true;sceneVideo.defaultMuted=true;sceneVideo.loop=true;
 sceneVideo.play().then(()=>{if(state.mode===mode)sceneVideo.classList.add('playing')}).catch(()=>{
    // keep beautiful still artwork if the phone disallows motion / data-saver.
    sceneVideo.classList.remove('playing');
 });
}

function save(){try{localStorage.setItem('morfy-somewhere-soft-v2',JSON.stringify({flowers:[...state.flowers],fireflies:[...state.fireflies],golden:state.golden}))}catch{}}
function safeText(t){return String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>el.classList.remove('show'),3400)}
function hideModal(perform=true){modal.classList.add('hidden');const then=state.modalDone;state.modalDone=null;if(perform&&typeof then==='function')then()}
function showModal(html,done=null){state.modalDone=done;$('modalContent').innerHTML=html;modal.classList.remove('hidden')}
$('modalX').onclick=()=>hideModal();modal.querySelector('[data-close]').onclick=()=>hideModal();
function quitVoice(){audio.pause();try{audio.currentTime=0}catch{}$('voicePause').classList.add('hidden');$('voicePlay').classList.remove('hidden');$('voicePlay').textContent='♫ Listen to Rahma';$('voicePlay').onclick=startVoice;$('voiceReplay').classList.add('hidden');$('voiceCaption').textContent='';}
function nav(mode){
 if(!ids.includes(mode))return;
 clearTimeout(state.moveTimeout);
 if(state.mode==='sky'&&mode!=='sky')quitVoice();
 state.mode=mode;
 ids.forEach(x=>$(x).classList.toggle('active',x===mode));
 scene.className='scene scene-'+mode;
 $('topbar').classList.toggle('hidden',!['garden','sky','sea','under'].includes(mode));
 $('dock').classList.toggle('hidden',!['garden','sky','sea','under'].includes(mode));
 document.querySelectorAll('#dock button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
 if(mode==='sky'){$('sky').classList.remove('resting');$('skyBefore').classList.remove('hidden');$('skyResting').classList.add('hidden');$('skyRestMessage').textContent='Nothing to accomplish. Just the sky above you.';state.resting=false;}
 if(mode==='sea'){$('seaSwimming').classList.toggle('hidden',!state.swimming);$('jumpBtn').classList.toggle('hidden',state.swimming);$('seaDialogue').classList.toggle('hidden',state.swimming);}
 if(mode==='under'){$('underPhrase').classList.add('hidden');$('under').classList.remove('quiet');state.lookingUp=false;state.underQuiet=false;}
 if(mode==='garden')paintGarden();
 if(mode==='menu')updateCollection();
 if(mode==='introCat'){state.catStep=0;renderCatIntro();}
 updateSceneVideo(mode);
 startWater(mode==='sea'||mode==='under');
}
$('enterBtn').addEventListener('click',()=>nav('introCat'));
const catScenes=[
 ['Well, hello there.',"I was wondering when you'd arrive.",'Nice to meet you, little cat'],
 ['Welcome to your little corner of the world.',"There's no rush here. No deadlines. No wrong turns.",'That sounds nice'],
 ["I'll show you around.",'Just a few lovely things waiting to be discovered.','Let\'s go']
];
function renderCatIntro(){const a=catScenes[state.catStep];$('catIntroTitle').textContent=a[0];$('catIntroLine').textContent=a[1];$('catNextBtn').innerHTML=safeText(a[2])+' <span>→</span>'}
$('catNextBtn').onclick=()=>{if(++state.catStep<catScenes.length)renderCatIntro();else nav('menu')};
$('homeBtn').onclick=()=>nav('menu');$('collectionBtn').onclick=openCollection;
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>nav(b.dataset.mode)));
function updateCollection(){const n=state.flowers.size;$('collectionCount').textContent=n+'/6';$('gardenCount').textContent=n+' / 6';$('menuProgress').textContent=`✿ Your collection: ${n} of 6 flowers`;$('goldenShortcut').classList.toggle('hidden',!state.golden);$('menuTitle').innerHTML=saved.flowers?.length?'Welcome back,<br><em>MORFY.</em>':'Where would you like<br>to go, <em>MORFY?</em>'}
$('goldenShortcut').onclick=showGolden;
function moveTo(x,y){state.px=x;state.py=y;$('playerAvatar').style.left=x+'%';$('playerAvatar').style.top=y+'%';$('catSprite').style.left=Math.min(94,x+7)+'%';$('catSprite').style.top=Math.min(92,y+3)+'%';}
function paintGarden(){updateCollection();moveTo(state.px,state.py);document.querySelectorAll('.flower-hotspot').forEach(b=>b.classList.toggle('collected',state.flowers.has(b.dataset.flower)));document.querySelectorAll('.firefly').forEach(b=>b.classList.toggle('seen',state.fireflies.has(Number(b.dataset.firefly))))}
function getSpot(el){return {x:parseFloat(el.style.getPropertyValue('--x'))||50,y:parseFloat(el.style.getPropertyValue('--y'))||50}}
function findFlower(id){const f=flowers.find(x=>x.id===id);if(!f)return;
 if(state.flowers.has(id)){showFlower(f,true);return;}
 const b=document.querySelector(`[data-flower="${id}"]`),v=getSpot(b);moveTo(Math.max(10,Math.min(90,v.x-7)),Math.max(20,Math.min(90,v.y+7)));toast('Just a few steps towards the '+f.name+'...');clearTimeout(state.moveTimeout);state.moveTimeout=setTimeout(()=>{if(state.mode==='garden')showFlower(f)},920);
}
document.querySelectorAll('.flower-hotspot').forEach(b=>b.addEventListener('click',()=>findFlower(b.dataset.flower)));
$('guideBtn').onclick=()=>{const next=flowers.find(f=>!state.flowers.has(f.id));if(next){toast('🐈 Follow me. I know where the next flower is.');findFlower(next.id)}else showGolden()};
function showFlower(f,already=false){showModal(`<img class="modal-art" src="assets/flowers/${f.id}.svg" alt="${safeText(f.name)}"><div class="eyebrow">${f.energy}</div><h2>${safeText(f.title)}</h2><h3>${safeText(f.name)} · ${safeText(f.latin)}</h3><p>${safeText(f.message)}</p><p class="catsay">🐈 ${safeText(f.cat)}</p><button class="btn btn-primary" id="collectIt">${already?'Back to the garden':safeText(f.take)} ✧</button>`);
 $('collectIt').onclick=()=>{
  if(!already){state.flowers.add(f.id);save();paintGarden();toast(prog[state.flowers.size-1]);}
  const complete=!already&&state.flowers.size===6&&!state.golden;
  hideModal(false);if(complete){state.golden=true;save();setTimeout(showGolden,650)}
 };
}
function showGolden(){showModal(`<div class="eyebrow">THE LITTLE SURPRISE YOU FOUND</div><img class="modal-art golden-art" src="assets/flowers/golden.svg" alt="Golden flower"><h2>The Golden Flower</h2><h3>A Little Something to Keep</h3><p>You found peace, warmth, rest, hope, courage, and understanding.\nBut here's the funny thing...\nYou didn't have to earn any of those things.\nYou deserved them before you even arrived.</p><button id="takeGolden" class="btn btn-primary">Take the Golden Flower ✨</button>`);
 $('takeGolden').onclick=showLetter;
}
function showLetter(){showModal(`<div class="eyebrow">JUST A LITTLE SOMETHING</div><h2>For MORFY,</h2><p>I know I can't make every difficult day disappear.\nI can't promise the world will always be gentle.\nBut I can remind you that your presence matters, that your efforts are seen, and that you don't always have to carry everything on your own.\n\nI made this little place hoping it might give you a smile, a quiet minute, or simply something different to think about.\n\nNo special occasion. No reason you need to figure out.\nJust a little something because you're important to me.</p><div class="signature">With care, Rahma ♡</div><button id="letterBack" class="btn btn-primary">Keep exploring</button><button id="letterStay" class="btn btn-ghost">Visit the garden</button>`);
 $('letterBack').onclick=()=>{hideModal(false);nav('menu');toast('This little place isn\'t going anywhere. Come back whenever you like.')};$('letterStay').onclick=()=>{hideModal(false);nav('garden')};
}
function openCollection(){let cards=flowers.map(f=>`<button class="flower-mini ${state.flowers.has(f.id)?'':'locked'}" data-view-flower="${f.id}"><img src="assets/flowers/${f.id}.svg" alt=""><span>${safeText(f.name)}</span></button>`).join('');
 showModal(`<div class="eyebrow">A LITTLE GARDEN OF YOUR OWN</div><h2>My Flowers</h2><p>${state.flowers.size} of 6 little pieces of light</p><div class="flower-grid">${cards}</div><p>Every flower keeps a little story for you.</p>${state.golden?'<button id="collectionGolden" class="btn btn-primary">✧ My Golden Flower</button>':''}<button id="closeCollection" class="btn btn-ghost">Keep exploring</button>`);
 $('closeCollection').onclick=()=>hideModal(false);document.querySelectorAll('[data-view-flower]').forEach(b=>b.addEventListener('click',()=>{const f=flowers.find(f=>f.id===b.dataset.viewFlower);if(state.flowers.has(f.id))showFlower(f,true);else toast('This flower is still waiting in the garden.')}));if(state.golden)$('collectionGolden').onclick=showGolden;
}
document.querySelectorAll('[data-firefly]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.firefly);if(state.fireflies.has(i))return;state.fireflies.add(i);save();b.classList.add('seen');showModal(`<div style="font:66px Georgia;color:#ffe7a4;text-shadow:0 0 35px #ffe5ac">✧</div><div class="eyebrow">A MEMORY FIREFLY</div><h2>A tiny reminder</h2><p>${safeText(fireflyLines[i])}</p><button id="fireflyClose" class="btn btn-primary">Keep wandering</button>`);$('fireflyClose').onclick=()=>{hideModal(false);if(state.fireflies.size===5)toast('🐈 You collected all the tiny lights. I knew you were curious.')}}));
$('bench').onclick=()=>{showModal(`<div style="font-size:72px">🐈</div><div class="eyebrow">QUIET COMPANY</div><h2>Sit with me.</h2><p>You know what I like about humans?\nActually, quite a few things.\nWarm laps. Comfortable furniture. The occasional snack.\nBut I think my favorite thing is that you can keep each other company. Even without saying anything.</p><h3>Good company doesn't always need a conversation.</h3><button id="petCat" class="btn btn-primary">Pet the cat</button><button id="catStay" class="btn btn-ghost">Stay a little longer</button>`);$('petCat').onclick=()=>toast('Prrrrrr... ♡');$('catStay').onclick=()=>hideModal(false)};
// SKY AND REAL ORIGINAL RECORDING. NO LOOPS, NO RESTART WHILE AUDIO PLAYS.
$('lieDownBtn').onclick=()=>{state.resting=true;scene.classList.add('resting');$('sky').classList.add('resting');setTimeout(()=>{if(state.mode==='sky'&&state.resting){$('skyBefore').classList.add('hidden');$('skyResting').classList.remove('hidden');}},1200)};
async function startVoice(){audio.loop=false;audio.volume=.85;try{audio.pause();audio.currentTime=0;await audio.play();$('voicePlay').classList.add('hidden');$('voicePause').classList.remove('hidden');$('voiceReplay').classList.remove('hidden');$('voiceCaption').textContent='A little message from Rahma, just for you.';}catch(err){$('voiceCaption').textContent='Your message couldn\'t play. Tap to try again.';}}
$('voicePlay').onclick=startVoice;$('voiceReplay').onclick=startVoice;
$('voicePause').onclick=()=>{audio.pause();$('voicePause').classList.add('hidden');$('voicePlay').textContent='▶ Continue listening';$('voicePlay').classList.remove('hidden');$('voicePlay').onclick=async()=>{try{await audio.play();$('voicePlay').classList.add('hidden');$('voicePause').classList.remove('hidden')}catch{$('voiceCaption').textContent='Tap again to play.'}}};
audio.addEventListener('ended',()=>{$('voicePlay').classList.add('hidden');$('voicePause').classList.add('hidden');$('voiceReplay').classList.remove('hidden');$('voiceCaption').textContent='The words stay with you. ♡';$('skyRestMessage').textContent='And just in case you forget... You matter more than you know.'});
$('skyGetUp').onclick=()=>{quitVoice();scene.classList.remove('resting');$('sky').classList.remove('resting');state.resting=false;nav('menu')};
// SEA
$('jumpBtn').onclick=()=>{state.swimming=true;scene.classList.add('swimming');$('seaSwimming').classList.remove('hidden');$('seaDialogue').classList.add('hidden');$('jumpBtn').classList.add('hidden');toast('You made a splash. The cat pretends not to be impressed.');};
const swimLines=['Looks like you\'ve made some new friends.',"There's something beautiful about not knowing exactly what comes next.",'Nothing to catch up with. Nowhere you need to be.', 'The water is warmer where the sun touches it.'];
$('swimAroundBtn').onclick=()=>{$('seaText').textContent=swimLines[(++state.seaAction)%swimLines.length];const s=scene.querySelector('.scene-picture');s.animate([{transform:'scale(1.11) translateX(0)'},{transform:'scale(1.16) translateX(1.3%)'},{transform:'scale(1.11) translateX(0)'}],{duration:3500,easing:'ease-in-out'})};
$('seaFloatBtn').onclick=()=>{state.float=!state.float;$('seaFloatBtn').textContent=state.float?'Keep swimming':'Float on the waves';$('seaText').textContent=state.float?'Nothing to catch up with. Nowhere you need to be.':'The sea is here whenever you want it.'};
$('diveBtn').onclick=()=>nav('under');
// UNDERWATER
$('lookUpBtn').onclick=()=>{state.lookingUp=!state.lookingUp;scene.classList.toggle('looking-up',state.lookingUp);$('underPhrase').classList.toggle('hidden',!state.lookingUp);$('lookUpBtn').textContent=state.lookingUp?'Look around ↓':'Look up at the sky ↑';toast(state.lookingUp?'Same sky. Different point of view.':'A different world just beneath the waves.')};
$('fishBtn').onclick=()=>toast('Oh, hello there, little stranger. 🐟');
$('underQuietBtn').onclick=()=>{state.underQuiet=!state.underQuiet;$('under').classList.toggle('quiet',state.underQuiet);toast(state.underQuiet?'Just you, the water, and a little wonder.':'Welcome back.')};
$('backSeaBtn').onclick=()=>nav('sea');
// Touch look-around parallax (no blocking scroll/touch navigation)
let lastLook=0;document.addEventListener('pointermove',e=>{if(Date.now()-lastLook<22)return;lastLook=Date.now();if(state.mode!=='sky'||!state.resting)return;const mx=(e.clientX/innerWidth-.5)*7,my=(e.clientY/innerHeight-.5)*5;pic.style.transform=`scale(1.17) translate(${mx}px,${my}px)`},{passive:true});
// Keyboard accessibility for garden and escape dialog.
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){if(!modal.classList.contains('hidden'))hideModal();else if(['garden','sky','sea','under'].includes(state.mode))nav('menu');return;}
 if(state.mode==='garden'&&!e.repeat){let x=state.px,y=state.py;if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')x-=5;else if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')x+=5;else if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')y-=5;else if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')y+=5;else return;e.preventDefault();moveTo(Math.min(94,Math.max(6,x)),Math.min(90,Math.max(18,y)))}
});
// PERFORMANCE: procedural ambient stars and water-drift visuals are lightweight canvas 2D.
const stars=$('stars'),ambient=$('fireflyField');
let randSeed=46810;const rnd=()=>{randSeed=(randSeed*1664525+1013904223)>>>0;return randSeed/4294967296};
for(let i=0;i<125;i++){let el=document.createElement('i');el.className='star';let size=rnd()<.075?2.9:.8+rnd()*1.5;el.style.cssText=`left:${rnd()*100}%;top:${rnd()*68}%;width:${size}px;height:${size}px;--speed:${2+rnd()*5}s;--opacity:${.2+rnd()*.8};animation-delay:${-rnd()*9}s`;stars.appendChild(el)}
for(let i=0;i<31;i++){let el=document.createElement('i');el.className='ambient-firefly';el.style.cssText=`--x:${rnd()*100}%;--y:${30+rnd()*65}%;--dx:${-13+rnd()*26}px;--dy:${-25+rnd()*24}px;--t:${3+rnd()*6}s;animation-delay:${-rnd()*9}s`;ambient.appendChild(el)}
const canvas=$('waterCanvas'),ctx=canvas.getContext('2d',{alpha:true});let raf=0,activeWater=false,tLast=0,W=0,H=0;
const oceanFish=Array.from({length:26},()=>({x:rnd(),y:.43+rnd()*.48,phase:rnd()*Math.PI*2,size:4+rnd()*11,speed:.003+rnd()*.004,color:rnd()<.6?'#bde7f1':'#f5ca9a'}));
const particles=Array.from({length:100},()=>({x:rnd(),y:rnd(),s:.5+rnd()*1.3,v:.0008+rnd()*.002}));
function resizeCanvas(){const dpr=Math.min(devicePixelRatio||1,1.5);W=canvas.clientWidth;H=canvas.clientHeight;canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
window.addEventListener('resize',resizeCanvas,{passive:true});resizeCanvas();
function startWater(on){activeWater=on;if(on&&!raf)raf=requestAnimationFrame(drawWater);if(!on&&raf){cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,W,H)}}
function drawWater(ms){if(!activeWater){raf=0;return}if(ms-tLast<38){raf=requestAnimationFrame(drawWater);return}tLast=ms;const t=ms/1000;ctx.clearRect(0,0,W,H);const underwater=state.mode==='under';
 if(underwater){
  // Dappled light shafts beneath a moving surface.
  for(let j=0;j<8;j++){const x=(j+.5)/8*W+Math.sin(t*.4+j)*24;let g=ctx.createLinearGradient(x,0,x+Math.sin(t*.3+j)*45,H);g.addColorStop(0,'rgba(206,235,255,.12)');g.addColorStop(1,'rgba(38,156,184,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-8,0);ctx.lineTo(x+15,0);ctx.lineTo(x+92,H);ctx.lineTo(x-112,H);ctx.closePath();ctx.fill()}
  for(const p of particles){let y=(p.y+t*p.v)%1;ctx.fillStyle='rgba(212,240,249,.39)';ctx.beginPath();ctx.arc(p.x*W+Math.sin(t*.5+p.y*19)*6,y*H,p.s,0,Math.PI*2);ctx.fill()}
 } else {
  for(let i=0;i<34;i++){const y=H*(.58+i*.016);const x=((i*171)+Math.sin(t*.6+i*.7)*95+W)%W;ctx.strokeStyle=`rgba(239,241,224,${.035+(i%4)*.018})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-23,y);ctx.quadraticCurveTo(x,y+Math.sin(t*.9+i)*4,x+39,y-1);ctx.stroke();}
 }
 // Organic tiny fish silhouettes at varying depths and swimming speed.
 for(const f of oceanFish){let x=((f.x+t*f.speed+Math.sin(t*.3+f.phase)*.015)%1)*W,y=(f.y+Math.sin(t*.83+f.phase)*.014)*H;ctx.save();ctx.translate(x,y);ctx.scale(f.size/10,f.size/10);ctx.globalAlpha=underwater?.43:.18;ctx.fillStyle=underwater?f.color:'#b8dae2';ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-16+Math.sin(t*4+f.phase)*2,-6);ctx.lineTo(-16+Math.sin(t*4+f.phase)*2,6);ctx.closePath();ctx.fill();ctx.restore();}
 raf=requestAnimationFrame(drawWater)
}
window.addEventListener('pagehide',()=>{quitVoice();startWater(false);sceneVideo.pause()});
updateCollection();paintGarden();
})();
