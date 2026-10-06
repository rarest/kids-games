import {MicrophoneRecorder} from './speaking-audio.js';

const scoreNumber = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
export function validateAssessment(value) {
  if (value?.engine !== 'local-phoneme' || !scoreNumber(value.score) || !scoreNumber(value.accuracy) ||
      !scoreNumber(value.completeness) || !Number.isFinite(value.duration) || value.duration <= 0 || value.duration > 20 ||
      !Array.isArray(value.words) || !value.words.length || value.words.some(word => typeof word.word !== 'string' || !word.word.trim() || !scoreNumber(word.score))) {
    throw new Error('这次没有取得有效反馈。可以听听录音，再试一次。');
  }
  return value;
}

function serviceMessage(body, status) {
  const code = String(body?.error || body?.code || '').toLowerCase();
  if (/no_speech|no_result|unrecognized|silence|too_short/.test(code) || status === 422) return '这次没有听清声音。请靠近麦克风，读完后再点停止。';
  if (/busy|limit|rate/.test(code) || status === 429) return '练习的小伙伴有点多。请稍等一会，再点看发音反馈。';
  if (/unavailable|not_ready/.test(code) || status === 503) return '评分服务暂时没有准备好。你仍然可以录音、回听和重录。';
  return '这次没有取得反馈。请检查网络，稍后再点看发音反馈。';
}

export function mountSpeaking({root, target, speak = () => {}, stopAudio = () => {}, onResult = () => {}, onError = () => {}}) {
  if (!root || !target?.id || !target?.en) throw new Error('Speaking practice requires a root and textbook target');
  const panel = document.createElement('section');
  panel.className = 'speaking-panel'; panel.setAttribute('aria-label', '跟读练习');
  panel.innerHTML = `<div class="speaking-heading"><span class="speaking-page"></span><h3 class="speaking-target"></h3><p class="speaking-meaning"></p><p class="speaking-ipa"></p><p class="speaking-spoken-target" hidden></p></div>
    <p class="speaking-instruction">先听示范，再录一遍自己的声音。录好后可以回听，再看发音反馈。</p>
    <p class="speaking-status" data-speaking-status role="status" aria-live="polite">正在查看评分服务…</p>
    <div class="speaking-controls">
      <button type="button" data-speaking-action="listen">🔊 听示范</button>
      <button type="button" data-speaking-action="record" class="speaking-primary">🎙 开始录音</button>
      <button type="button" data-speaking-action="stop" hidden class="speaking-primary">■ 停止录音</button>
      <button type="button" data-speaking-action="play" hidden>▶ 听我的录音</button>
      <button type="button" data-speaking-action="retry" hidden>再读一次</button>
      <button type="button" data-speaking-action="cancel" hidden>取消</button>
      <button type="button" data-speaking-action="submit" hidden disabled class="speaking-score-button">✨ 看发音反馈</button>
      <button type="button" data-speaking-action="refresh" hidden>检查评分服务</button>
    </div>
    <div class="speaking-meter" hidden><canvas width="640" height="64" aria-hidden="true"></canvas><span class="speaking-time">0.0 / 20 秒</span></div>
    <div class="speaking-result" data-speaking-result aria-live="polite"></div>
    <details class="speaking-mic-details"><summary>麦克风与声音检查</summary><p class="speaking-mic-status" role="status">点开始录音后，声音指示会随你说话变化。</p><label class="speaking-mic-label">录音用的麦克风<select class="speaking-mic-select" aria-label="录音用的麦克风"><option value="">系统默认麦克风</option></select></label><p class="speaking-mic-help">Chrome 已记住允许或阻止时，不会再次弹窗。点地址栏左侧的网站设置，查看麦克风权限；也请检查电脑的输入设备和麦克风静音开关。这里的设备名称只在本页显示。</p></details>
    <details class="speaking-parent-details"><summary>家长提示：录音与自动反馈</summary><p class="speaking-parent-note">录音只在本页暂存。点击「看发音反馈」才会发送到我们网站的服务器，不保存录音；退出本页就丢弃。自动反馈用于跟读练习。</p></details>
    <audio hidden preload="metadata"></audio>`;
  const get = selector => panel.querySelector(selector);
  const buttons = Object.fromEntries(Array.from(panel.querySelectorAll('[data-speaking-action]'), button => [button.dataset.speakingAction, button]));
  get('.speaking-page').textContent = `第 ${target.page} 页 · ${target.kind === 'word' ? '单词' : '句子'}跟读`;
  get('.speaking-target').textContent = target.en;
  get('.speaking-meaning').textContent = target.zh || '';
  get('.speaking-ipa').textContent = target.ipa || ''; get('.speaking-ipa').hidden = !target.ipa;
  if (typeof target.say === 'string' && target.say.trim() !== target.en.trim()) {
    get('.speaking-spoken-target').textContent = `跟读内容：${target.say}`;
    get('.speaking-spoken-target').hidden = false;
  }
  const status = get('[data-speaking-status]'), result = get('[data-speaking-result]');
  const meter = get('.speaking-meter'), canvas = get('canvas'), time = get('.speaking-time'), player = get('audio');
  const micDetails = get('.speaking-mic-details'), micStatus = get('.speaking-mic-status'), micSelect = get('.speaking-mic-select');
  const context = canvas.getContext('2d');
  let dead = false, epoch = 0, state = 'idle', available = false, checkingReadiness = false, clip = null, clipURL = null, assessmentController;
  let levels = [], shownDuration = 0, hasFeedback = false, captureAttempted = false, inputEpoch = 0, permissionHintTimer;
  const readinessController = new AbortController();
  const message = text => { if (!dead) status.textContent = text; };
  const reportError = error => { try { onError(error); } catch {} };
  function update() {
    if (dead) return;
    const capturing = state === 'recording', asking = state === 'requesting', assessing = state === 'assessing';
    buttons.record.hidden = !!clip || capturing || asking;
    buttons.record.disabled = assessing;
    buttons.stop.hidden = !capturing;
    buttons.play.hidden = !clip; buttons.play.disabled = capturing || asking;
    buttons.retry.hidden = !clip; buttons.retry.disabled = assessing;
    buttons.cancel.hidden = state === 'idle';
    buttons.listen.hidden = capturing || asking || assessing;
    buttons.submit.hidden = !clip || capturing || asking;
    buttons.submit.disabled = !clip || clip.duration < 0.25 || clip.noInput || !available || capturing || asking || assessing;
    buttons.submit.textContent = assessing ? '正在听你的声音…' : '✨ 看发音反馈';
    buttons.refresh.hidden = available || checkingReadiness || capturing || asking;
    buttons.refresh.disabled = assessing;
    buttons.listen.disabled = capturing || asking || assessing;
    panel.dataset.speakingState = state;
    meter.hidden = !capturing && !clip;
    time.textContent = `${shownDuration.toFixed(1)} / 20 秒`;
    panel.setAttribute('aria-busy', assessing ? 'true' : 'false');
    micSelect.disabled = capturing || asking || assessing;
  }
  async function refreshInputs() {
    const token = ++inputEpoch;
    try {
      const permission = await navigator.permissions?.query({name:'microphone'}).catch(() => null);
      if (dead || token !== inputEpoch) return;
      if (permission?.state === 'denied') { micStatus.textContent = '麦克风被阻止：请在地址栏的网站设置中改为允许，再点开始录音。'; return; }
      if (permission?.state === 'prompt') { micStatus.textContent = '麦克风还未授权：点开始录音，在浏览器提示中选择允许。'; return; }
      const devices = await navigator.mediaDevices?.enumerateDevices();
      if (dead || token !== inputEpoch || !devices) return;
      const selected = micSelect.value;
      micSelect.replaceChildren(new Option('系统默认麦克风', ''));
      for (const [i,device] of devices.filter(device => device.kind === 'audioinput' && device.deviceId).entries()) micSelect.add(new Option(device.label || `麦克风 ${i+1}`, device.deviceId));
      if (Array.from(micSelect.options).some(option => option.value === selected)) micSelect.value = selected;
    } catch { /* Browsers without the permissions/device-list APIs can still record. */ }
  }
  micDetails.addEventListener('toggle', () => { if (micDetails.open) refreshInputs(); });
  micSelect.addEventListener('change', () => { if (!micSelect.disabled) {micStatus.textContent='已选择麦克风。点开始录音，说一句话检查声音指示。';} });
  function drawMeter() {
    if (!context) return;
    const width = canvas.width, height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#cddbd0'; context.fillRect(0, height / 2 - 1, width, 2);
    context.fillStyle = '#3f8966';
    const barWidth = width / 80;
    levels.slice(-80).forEach((level, index) => {
      const barHeight = Math.max(3, Math.min(height - 6, level * height * 4));
      context.fillRect(index * barWidth, (height - barHeight) / 2, barWidth - 2, barHeight);
    });
  }
  function pausePlayback() { player.pause(); buttons.play.textContent = '▶ 听我的录音'; }
  function dropClip() {
    pausePlayback(); player.removeAttribute('src'); player.load();
    if (clipURL) URL.revokeObjectURL(clipURL);
    clipURL = null; clip = null; shownDuration = 0; levels = []; hasFeedback = false; result.replaceChildren();
  }
  const recorder = new MicrophoneRecorder({
    onInput(input) { if(dead)return;micStatus.textContent=`已连接：${input.label || '系统默认麦克风'}。${input.muted ? '麦克风当前没有输入，请检查静音开关。' : '说一句话，看看声音指示是否变化。'}`;refreshInputs(); },
    onProgress({duration, level}) { if (dead || state !== 'recording') return; shownDuration = duration; levels.push(level); drawMeter(); if(duration>=1.5&&levels.every(value=>value<0.003)){message('还没有采到明显的声音。请检查麦克风选择和静音开关，再靠近一些。');micStatus.textContent='没有采到声音：可选择其他麦克风，并检查电脑输入音量和静音开关。';micDetails.open=true;}else if(level>=0.003){message('收到你的声音了！读完后点「停止录音」。');micStatus.textContent='已检测到声音，麦克风正在正常输入。';} update(); },
    onLimit() { if (state === 'recording') stopRecording(); },
    onError(error) {if(dead)return;state='idle';message(error.message);micStatus.textContent=error.message;micDetails.open=true;reportError(error);update();}
  });
  function cancel() {
    epoch++; clearTimeout(permissionHintTimer); assessmentController?.abort(); recorder.cancel(); dropClip(); state = 'idle';captureAttempted=false;
    message(available ? '听一遍示范，准备好了就开始录音。' : '评分服务暂时没有准备好。你可以先录音和回听。'); update();
  }
  async function startRecording() {
    if (dead || state === 'requesting' || state === 'recording' || state === 'assessing') return;
    epoch++; const token = epoch;captureAttempted=true;
    dropClip(); stopAudio(); state = 'requesting'; message('请允许使用麦克风，然后开始读。最多可以录 20 秒。'); update();
    const hintTimer=setTimeout(()=>{if(!dead&&token===epoch&&state==='requesting'){message('正在等待麦克风。请查看地址栏的权限提示；也可以点取消后重新开始。');micDetails.open=true;}},10000);permissionHintTimer=hintTimer;
    try {
      const started = await recorder.start({deviceId:micSelect.value});
      clearTimeout(hintTimer);
      if (dead || token !== epoch || !started) return;
      state = 'recording'; message('正在录音。读完后点「停止录音」。'); update();
    } catch (error) {
      clearTimeout(hintTimer);
      if (dead || token !== epoch) return;
      state = 'idle';
      message(error.name === 'NotAllowedError' ? '麦克风没有获准使用。请点地址栏左侧的网站设置，把麦克风改为允许，再开始录音。' :
        error.name === 'NotFoundError' ? '没有找到麦克风。请连接麦克风后再试。' : error.message?.startsWith('这个浏览器') || error.message?.startsWith('麦克风音频') ? error.message : '暂时不能录音。请检查麦克风和浏览器权限后再试。');
      micStatus.textContent=status.textContent;micDetails.open=true;
      reportError(error); update();
    }
  }
  function stopRecording() {
    if (dead || state !== 'recording') return;
    clip = recorder.stop(); state = 'recorded';
    if (!clip) { cancel(); return; }
    clip.noInput=clip.rms<0.003&&!levels.some(level=>level>=0.003);
    clipURL = URL.createObjectURL(clip.blob); player.src = clipURL; shownDuration = clip.duration;
    message(clip.duration < 0.25 ? '录音太短了。请点「再读一次」，读完后再停止。' :
      clip.noInput ? '这次没有录到明显的声音。请检查下方麦克风设置，再点「再读一次」。' :
      available ? '录好了！点黄色「看发音反馈」按钮，查看这次结果。' : '录好了！可以听自己的录音。评分服务暂时没有准备好。');
    if(clip.noInput){micStatus.textContent='没有采到声音：请选择正确的麦克风，检查静音开关和电脑输入音量。';micDetails.open=true;}
    update(); (clip.noInput?micDetails:buttons.submit).scrollIntoView({block:'nearest',behavior:'instant'});
  }
  async function play() {
    if (!clip || dead) return;
    if (!player.paused) { pausePlayback(); return; }
    stopAudio();
    const token = epoch;
    try {
      await player.play();
      if (dead || token !== epoch) return;
      buttons.play.textContent = '暂停回放';
    } catch (error) { if (!dead && token === epoch) { message('暂时播放不了录音。可以再点一次回听。'); reportError(error); } }
  }
  player.addEventListener('ended', pausePlayback);
  function showResult(value) {
    result.replaceChildren();
    const encouragement = document.createElement('p'); encouragement.className = 'speaking-encouragement';
    encouragement.textContent = value.score >= 80 ? '读得很认真！听一听示范，继续练习吧。' : '你已经完成一次练习！听听示范，再慢慢读一遍。';
    result.append(encouragement);
    const headline = document.createElement('p'); headline.className = 'speaking-score-summary'; headline.textContent = `这次练习 ${Math.round(value.score)} 分`; result.append(headline);
    const weakest = value.words.reduce((a, b) => b.score < a.score ? b : a);
    const nextPractice = document.createElement('p'); nextPractice.className = 'speaking-next-practice';
    nextPractice.textContent = weakest.score < 80 ? `下一小步：再听示范，练一练 ${weakest.word}。` : '下一小步：换一个词或句子，继续读一读。'; result.append(nextPractice);
    const details = document.createElement('details'); details.className = 'speaking-score-details';
    const summary = document.createElement('summary'); summary.textContent = '看看每个词的反馈'; details.append(summary); result.append(details);
    const scores = document.createElement('div'); scores.className = 'speaking-scores';
    for (const [label, number] of [['练习得分', value.score], ['发音贴合度', value.accuracy], ['完成度', value.completeness]]) {
      const item = document.createElement('p'), title = document.createElement('span'), score = document.createElement('strong');
      title.textContent = label; score.textContent = `${Math.round(number)}${label === '练习得分' ? ' 分' : '%'}`;
      item.append(title, score); scores.append(item);
    }
    details.append(scores);
    const note = document.createElement('p'); note.className = 'speaking-feedback-note';
    note.textContent = '发音贴合度比较录音与示范的音素（声音单位）。这是自动练习反馈，专有名字的发音可能需要老师帮助。'; details.append(note);
    const words = document.createElement('ul'); words.className = 'speaking-word-feedback';
    for (const word of value.words) {
      const row = document.createElement('li'), title = document.createElement('strong'), hint = document.createElement('span');
      title.textContent = word.word;
      hint.textContent = `${Math.round(word.score)}% · ${word.score >= 80 ? '继续保持' : word.errorType === 'omission' || word.errorType === 'Omission' ? '再把这个词读完整' : '听听这个词，再试一次'}`;
      row.append(title, hint); words.append(row);
    }
    details.append(words);
  }
  async function assess() {
    if (dead || buttons.submit.disabled || state === 'assessing') return;
    const token = ++epoch, controller = new AbortController(); assessmentController = controller;
    state = 'assessing'; result.replaceChildren(); pausePlayback(); message('正在听你的声音，请稍等。'); update();
    const timeout = setTimeout(() => controller.abort(), 90000);
    try {
      const response = await fetch(`/api/english/pronunciation?target=${encodeURIComponent(target.id)}`, {
        method: 'POST', headers: {'Content-Type': 'audio/wav'}, body: clip.blob, signal: controller.signal
      });
      const body = await response.json();
      if (dead || token !== epoch) return;
      if (!response.ok || body?.error) {
        if (response.status === 503) available = false;
        throw new Error(serviceMessage(body, response.status));
      }
      const value = validateAssessment(body); hasFeedback = true; showResult(value); result.scrollIntoView({block:'nearest',behavior:'instant'}); message('这次练习有反馈了！可以回听，或者再读一次。');
      try { onResult(value); } catch {}
    } catch (error) {
      if (dead || token !== epoch) return;
      message(error.name === 'AbortError' ? '这次等得有点久。请稍后再点看发音反馈，录音还在。' : error instanceof TypeError ? '网络暂时没有连上。录音还在，可以稍后再点看发音反馈。' : error.message || '这次没有取得反馈，请稍后再试。');
      reportError(error);
    } finally {
      clearTimeout(timeout);
      if (!dead && token === epoch) { state = 'recorded'; update(); }
    }
  }
  const actions = {record: startRecording, stop: stopRecording, cancel, retry: () => { cancel(); startRecording(); }, play, submit: assess, refresh: checkReadiness,
    listen: () => { const token = epoch; pausePlayback(); stopAudio(); Promise.resolve().then(() => { if (!dead && token === epoch && state !== 'requesting' && state !== 'recording') return speak(target, target.wordId); }).catch(error => { if (!dead && token === epoch) { message('示范音频暂时播放不了，请稍后再试。'); reportError(error); } }); }};
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-speaking-action]');
    if (button && panel.contains(button) && !button.disabled) actions[button.dataset.speakingAction]?.();
  });
  root.replaceChildren(panel); update(); checkReadiness();
  async function checkReadiness() {
    if (dead || checkingReadiness) return;
    checkingReadiness = true; update();
    try {
      const response = await fetch('/api/english/speech-status', {signal: readinessController.signal});
      if (!response.ok) throw new Error('Speech status unavailable');
      const body = await response.json();
      if (dead) return;
      available = body.enabled === true && body.provider === 'local-phoneme';
      if (state === 'idle' && !captureAttempted) message(available ? '听一遍示范，准备好了就开始录音。' : '评分服务暂时没有准备好。你可以先录音和回听。');
      else if (state === 'recorded' && clip?.duration >= 0.25 && !clip.noInput) message(available ? '录好了！先回听，准备好了就点「看发音反馈」。' : '评分服务暂时没有准备好。你仍然可以回听和重录。');
    } catch {
      if (!dead) { available = false; if ((state === 'idle' && !captureAttempted) || (state === 'recorded' && clip?.duration >= 0.25 && !clip.noInput)) message('评分服务暂时没有连上。你可以先录音和回听。'); }
    } finally { checkingReadiness = false; update(); }
  }
  function destroy() {
    if (dead) return;
    dead = true; epoch++; inputEpoch++; clearTimeout(permissionHintTimer); readinessController.abort(); assessmentController?.abort(); recorder.cancel(); dropClip();
    window.removeEventListener('pagehide', destroy); window.removeEventListener('beforeunload', destroy); panel.remove();
  }
  window.addEventListener('pagehide', destroy); window.addEventListener('beforeunload', destroy);
  return {destroy,canLeave(){if(state==='requesting'||state==='recording'||state==='assessing'||clip&&!hasFeedback){message('先完成这次录音和反馈，或点「取消」丢弃录音，再切换。');return false;}return true;}};
}
