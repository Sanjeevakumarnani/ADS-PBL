/* ══════════════════════════════════════════════════
   SORTING ALGORITHM ANALYZER — JavaScript Engine
   ══════════════════════════════════════════════════
   • Hero canvas animation
   • Real sorting visualizer (step-by-step, animated)
   • JS implementations of all 6 algorithms (generator-based)
   • Performance analyzer with bar charts
   ══════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════
   HERO CANVAS — animated bar preview
═══════════════════════════════════════ */
(function heroAnim() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const N = 28;
  let bars = Array.from({length: N}, () => Math.random() * 0.75 + 0.1);
  let sorted = Array.from({length: N}, (_, i) => i);
  let step = 0, dir = 1, t = 0, highlight = [-1, -1];

  // Bubble sort steps for the hero animation
  let steps = [];
  (function genSteps() {
    let a = [...bars];
    for (let i = 0; i < N - 1; i++)
      for (let j = 0; j < N - i - 1; j++) {
        steps.push([j, j+1, false]);
        if (a[j] > a[j+1]) { let tmp=a[j]; a[j]=a[j+1]; a[j+1]=tmp; steps.push([j,j+1,true]); }
      }
  })();

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const bw = (W - N * 3) / N;
    bars.forEach((v, i) => {
      const bh = v * (H - 20);
      const x  = i * (bw + 3);
      const y  = H - bh;
      let col = '#6366f1';
      if (i === highlight[0]) col = '#f97316';
      if (i === highlight[1]) col = '#ef4444';
      const grad = ctx.createLinearGradient(x, y, x, H);
      grad.addColorStop(0, col);
      grad.addColorStop(1, col + '44');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 3);
      ctx.fill();
    });
  }

  let si = 0;
  function tick() {
    if (si < steps.length) {
      const [a, b, sw] = steps[si++];
      highlight = [a, b];
      if (sw) { let tmp = bars[a]; bars[a] = bars[b]; bars[b] = tmp; }
      if (si % 3 === 0) draw();
    } else {
      highlight = [-1, -1];
      draw();
      setTimeout(() => {
        bars = Array.from({length: N}, () => Math.random() * 0.75 + 0.1);
        steps = [];
        let a2 = [...bars];
        for (let i = 0; i < N - 1; i++)
          for (let j = 0; j < N - i - 1; j++) {
            steps.push([j, j+1, false]);
            if (a2[j] > a2[j+1]) { let t=a2[j]; a2[j]=a2[j+1]; a2[j+1]=t; steps.push([j,j+1,true]); }
          }
        si = 0;
      }, 2000);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ═══════════════════════════════════════
   VISUALIZER
═══════════════════════════════════════ */
const VIZ = (() => {
  const canvas = document.getElementById('vizCanvas');
  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // State
  let arr = [], N = 40;
  let frames = [];      // sequence of {arr, colors, cmp, swp}
  let frameIdx = 0;
  let playing = false;
  let paused  = false;
  let animId  = null;
  let startMs = 0;
  let cmpCount = 0, swpCount = 0;

  const COLORS = {
    normal:    '#60a5fa',
    compare:   '#f97316',
    swap:      '#ef4444',
    sorted:    '#22c55e',
    pivot:     '#a855f7',
    highlight: '#facc15',
  };

  const speedMap = [0, 300, 120, 50, 15, 1]; // ms per frame

  function getSpeed() {
    return speedMap[+document.getElementById('speedRange').value] || 50;
  }

  /* ── Array Generators ── */
  function makeArray(type, n) {
    const a = Array.from({length: n}, (_, i) => i + 1);
    switch (type) {
      case 'random':   return a.sort(() => Math.random() - 0.5);
      case 'nearly':   { let b = [...a]; for (let i=0;i<n*0.1;i++){let x=~~(Math.random()*n),y=~~(Math.random()*n);[b[x],b[y]]=[b[y],b[x]];} return b; }
      case 'reverse':  return a.reverse();
      case 'few':      return Array.from({length: n}, () => ~~(Math.random() * 5) + 1);
      default:         return a.sort(() => Math.random() - 0.5);
    }
  }

  /* ── Frame Recording ── */
  function snap(a, colors, cmp, swp) {
    frames.push({ arr: [...a], colors: {...colors}, cmp, swp });
  }

  /* ── Algorithm Frame Generators ── */
  function genBubble(a) {
    let n = a.length, cmp = 0, swp = 0;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        cmp++;
        snap(a, {[j]: 'compare', [j+1]: 'compare', ...solidRange(j+1, n-1, 'sorted', i)}, cmp, swp);
        if (a[j] > a[j+1]) {
          [a[j], a[j+1]] = [a[j+1], a[j]]; swp++; swapped = true;
          snap(a, {[j]: 'swap', [j+1]: 'swap', ...solidRange(j+1, n-1, 'sorted', i)}, cmp, swp);
        }
      }
      if (!swapped) break;
    }
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  function genSelection(a) {
    let n = a.length, cmp = 0, swp = 0;
    for (let i = 0; i < n - 1; i++) {
      let minI = i;
      for (let j = i + 1; j < n; j++) {
        cmp++;
        snap(a, {[i]: 'highlight', [minI]: 'pivot', [j]: 'compare', ...solidRange(0, i-1, 'sorted', 0)}, cmp, swp);
        if (a[j] < a[minI]) minI = j;
      }
      if (minI !== i) { [a[i], a[minI]] = [a[minI], a[i]]; swp++; }
      snap(a, {[i]: 'sorted', ...solidRange(0, i-1, 'sorted', 0)}, cmp, swp);
    }
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  function genInsertion(a) {
    let n = a.length, cmp = 0, swp = 0;
    for (let i = 1; i < n; i++) {
      let key = a[i], j = i - 1;
      snap(a, {[i]: 'pivot', ...solidRange(0, i-1, 'sorted', 0)}, cmp, swp);
      while (j >= 0) {
        cmp++;
        snap(a, {[i]: 'pivot', [j]: 'compare', ...solidRange(0, i-1, 'sorted', 0)}, cmp, swp);
        if (a[j] > key) { a[j+1] = a[j]; swp++; j--; }
        else break;
      }
      a[j+1] = key;
      snap(a, {...solidRange(0, i, 'sorted', 0)}, cmp, swp);
    }
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  function genMerge(a) {
    let cmp = 0, swp = 0;
    function merge(l, m, r) {
      let L = a.slice(l, m+1), R = a.slice(m+1, r+1), i = 0, j = 0, k = l;
      while (i < L.length && j < R.length) {
        cmp++;
        snap(a, {[l+i]: 'compare', [m+1+j]: 'compare'}, cmp, swp);
        if (L[i] <= R[j]) { a[k++] = L[i++]; }
        else              { a[k++] = R[j++]; }
        swp++; snap(a, {[k-1]: 'swap'}, cmp, swp);
      }
      while (i < L.length) { a[k++] = L[i++]; swp++; snap(a, {[k-1]: 'sorted'}, cmp, swp); }
      while (j < R.length) { a[k++] = R[j++]; swp++; snap(a, {[k-1]: 'sorted'}, cmp, swp); }
    }
    function ms(l, r) {
      if (l >= r) return;
      let m = (l + r) >> 1;
      ms(l, m); ms(m+1, r); merge(l, m, r);
    }
    ms(0, a.length - 1);
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  function genQuick(a) {
    let cmp = 0, swp = 0;
    function partition(lo, hi) {
      let pivot = a[hi], i = lo - 1;
      snap(a, {[hi]: 'pivot'}, cmp, swp);
      for (let j = lo; j < hi; j++) {
        cmp++; snap(a, {[j]: 'compare', [hi]: 'pivot'}, cmp, swp);
        if (a[j] <= pivot) {
          i++; [a[i], a[j]] = [a[j], a[i]]; swp++;
          snap(a, {[i]: 'swap', [j]: 'swap', [hi]: 'pivot'}, cmp, swp);
        }
      }
      [a[i+1], a[hi]] = [a[hi], a[i+1]]; swp++;
      snap(a, {[i+1]: 'sorted'}, cmp, swp);
      return i + 1;
    }
    function qs(lo, hi) {
      if (lo >= hi) return;
      let p = partition(lo, hi);
      qs(lo, p-1); qs(p+1, hi);
    }
    qs(0, a.length - 1);
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  function genHeap(a) {
    let n = a.length, cmp = 0, swp = 0;
    function heapify(sz, i) {
      let largest = i, l = 2*i+1, r = 2*i+2;
      if (l < sz) { cmp++; if (a[l] > a[largest]) largest = l; }
      if (r < sz) { cmp++; if (a[r] > a[largest]) largest = r; }
      if (largest !== i) {
        [a[i], a[largest]] = [a[largest], a[i]]; swp++;
        snap(a, {[i]: 'swap', [largest]: 'swap'}, cmp, swp);
        heapify(sz, largest);
      }
    }
    for (let i = ~~(n/2)-1; i >= 0; i--) heapify(n, i);
    for (let i = n-1; i > 0; i--) {
      [a[0], a[i]] = [a[i], a[0]]; swp++;
      snap(a, {[0]: 'swap', [i]: 'sorted'}, cmp, swp);
      heapify(i, 0);
    }
    snap(a, allColor(a, 'sorted'), cmp, swp);
  }

  /* ── Helpers ── */
  function allColor(a, c) {
    return Object.fromEntries(a.map((_, i) => [i, c]));
  }
  function solidRange(from, to, c, offset) {
    let o = {};
    for (let i = from; i <= to; i++) o[i] = c;
    return o;
  }

  /* ── Draw Frame ── */
  function drawFrame(frame) {
    const { arr, colors, cmp, swp } = frame;
    const n = arr.length;
    const bw = (W - 4) / n;
    const max = Math.max(...arr);

    ctx.clearRect(0, 0, W, H);

    arr.forEach((v, i) => {
      const bh = (v / max) * (H - 20);
      const x  = i * bw + 2;
      const y  = H - bh;
      const c  = colors[i] || 'normal';
      const col = COLORS[c] || COLORS.normal;

      const grad = ctx.createLinearGradient(x, y, x, H);
      grad.addColorStop(0, col);
      grad.addColorStop(1, col + '33');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, Math.max(bw - 2, 1), bh, 2);
      ctx.fill();
    });

    document.getElementById('vizCmp').textContent    = `Comparisons: ${cmp}`;
    document.getElementById('vizSwp').textContent    = `Swaps: ${swp}`;
    document.getElementById('vizTime').textContent   = `Time: ${(performance.now() - startMs).toFixed(1)} ms`;
    document.getElementById('vizStatus').textContent = playing && !paused ? '▶ Running' : (paused ? '⏸ Paused' : '✔ Done');
  }

  /* ── Playback ── */
  let lastFrame = 0;
  function playLoop(ts) {
    if (!playing || paused) return;
    if (ts - lastFrame >= getSpeed()) {
      lastFrame = ts;
      if (frameIdx < frames.length) {
        drawFrame(frames[frameIdx++]);
        animId = requestAnimationFrame(playLoop);
      } else {
        playing = false;
        document.getElementById('btnPause').disabled = true;
        document.getElementById('vizStatus').textContent = '✔ Done';
      }
    } else {
      animId = requestAnimationFrame(playLoop);
    }
  }

  /* ── API ── */
  function generate() {
    N = +document.getElementById('sizeRange').value;
    document.getElementById('sizeLabel').textContent = N;
    const type = document.getElementById('arrayType').value;
    arr = makeArray(type, N);
    frames = []; frameIdx = 0; playing = false; paused = false;
    if (animId) cancelAnimationFrame(animId);
    document.getElementById('btnPause').disabled = true;
    document.getElementById('vizStatus').textContent = 'Ready';
    drawFrame({ arr, colors: {}, cmp: 0, swp: 0 });
  }

  function start() {
    const algo = document.getElementById('algoSelect').value;
    frames = []; frameIdx = 0;
    const a = [...arr];
    const fns = { bubble: genBubble, selection: genSelection, insertion: genInsertion, merge: genMerge, quick: genQuick, heap: genHeap };
    fns[algo](a);
    playing = true; paused = false;
    startMs = performance.now();
    document.getElementById('btnPause').disabled = false;
    animId = requestAnimationFrame(playLoop);
  }

  function pause() {
    paused = !paused;
    document.getElementById('btnPause').textContent = paused ? '▶ Resume' : '⏸ Pause';
    if (!paused) animId = requestAnimationFrame(playLoop);
  }

  function reset() {
    playing = false; paused = false;
    if (animId) cancelAnimationFrame(animId);
    frameIdx = 0; frames = [];
    document.getElementById('btnPause').disabled = true;
    document.getElementById('btnPause').textContent = '⏸ Pause';
    document.getElementById('vizStatus').textContent = 'Ready';
    drawFrame({ arr, colors: {}, cmp: 0, swp: 0 });
  }

  // Controls
  document.getElementById('btnGenerate').onclick = generate;
  document.getElementById('btnStart').onclick    = () => { if (frames.length === 0 || frameIdx >= frames.length) start(); else { playing=true; paused=false; document.getElementById('btnPause').disabled=false; animId=requestAnimationFrame(playLoop); } };
  document.getElementById('btnPause').onclick    = pause;
  document.getElementById('btnReset').onclick    = reset;
  document.getElementById('sizeRange').oninput   = () => { document.getElementById('sizeLabel').textContent = document.getElementById('sizeRange').value; };
  document.getElementById('speedRange').oninput  = () => { const labels = ['','Very Slow','Slow','Medium','Fast','Instant']; document.getElementById('speedLabel').textContent = labels[+document.getElementById('speedRange').value]; };

  generate(); // initial
})();

/* ═══════════════════════════════════════
   ANALYZER
═══════════════════════════════════════ */
(function analyzer() {
  let currentArr = [];

  /* ── JS sorting implementations with metric counting ── */
  function runAll(arr) {
    const algos = [
      { name: 'Bubble Sort',    complexity: 'O(n²)',           fn: bubbleMetric    },
      { name: 'Selection Sort', complexity: 'O(n²)',           fn: selectionMetric },
      { name: 'Insertion Sort', complexity: 'O(n²)',           fn: insertionMetric },
      { name: 'Merge Sort',     complexity: 'O(n log n)',      fn: mergeMetric     },
      { name: 'Quick Sort',     complexity: 'Avg O(n log n)',  fn: quickMetric     },
      { name: 'Heap Sort',      complexity: 'O(n log n)',      fn: heapMetric      },
    ];
    return algos.map(a => {
      const copy = [...arr];
      const t0 = performance.now();
      const { cmp, swp } = a.fn(copy);
      const ms = performance.now() - t0;
      return { name: a.name, complexity: a.complexity, cmp, swp, ms };
    });
  }

  function bubbleMetric(a) {
    let cmp=0, swp=0, n=a.length;
    for(let i=0;i<n-1;i++){let sw=false;for(let j=0;j<n-i-1;j++){cmp++;if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];swp++;sw=true;}}if(!sw)break;}
    return {cmp,swp};
  }
  function selectionMetric(a) {
    let cmp=0,swp=0,n=a.length;
    for(let i=0;i<n-1;i++){let m=i;for(let j=i+1;j<n;j++){cmp++;if(a[j]<a[m])m=j;}if(m!==i){[a[i],a[m]]=[a[m],a[i]];swp++;}}
    return {cmp,swp};
  }
  function insertionMetric(a) {
    let cmp=0,swp=0,n=a.length;
    for(let i=1;i<n;i++){let k=a[i],j=i-1;while(j>=0){cmp++;if(a[j]>k){a[j+1]=a[j];swp++;j--;}else break;}a[j+1]=k;}
    return {cmp,swp};
  }
  function mergeMetric(a) {
    let cmp=0,swp=0;
    function merge(l,m,r){let L=a.slice(l,m+1),R=a.slice(m+1,r+1),i=0,j=0,k=l;while(i<L.length&&j<R.length){cmp++;if(L[i]<=R[j])a[k++]=L[i++];else a[k++]=R[j++];swp++;}while(i<L.length){a[k++]=L[i++];swp++;}while(j<R.length){a[k++]=R[j++];swp++;}}
    function ms(l,r){if(l>=r)return;let m=(l+r)>>1;ms(l,m);ms(m+1,r);merge(l,m,r);}
    ms(0,a.length-1);return {cmp,swp};
  }
  function quickMetric(a) {
    let cmp=0,swp=0;
    function part(lo,hi){let p=a[hi],i=lo-1;for(let j=lo;j<hi;j++){cmp++;if(a[j]<=p){i++;[a[i],a[j]]=[a[j],a[i]];swp++;}}[a[i+1],a[hi]]=[a[hi],a[i+1]];swp++;return i+1;}
    function qs(lo,hi){if(lo>=hi)return;let p=part(lo,hi);qs(lo,p-1);qs(p+1,hi);}
    qs(0,a.length-1);return {cmp,swp};
  }
  function heapMetric(a) {
    let cmp=0,swp=0,n=a.length;
    function heapify(sz,i){let lg=i,l=2*i+1,r=2*i+2;if(l<sz){cmp++;if(a[l]>a[lg])lg=l;}if(r<sz){cmp++;if(a[r]>a[lg])lg=r;}if(lg!==i){[a[i],a[lg]]=[a[lg],a[i]];swp++;heapify(sz,lg);}}
    for(let i=~~(n/2)-1;i>=0;i--)heapify(n,i);
    for(let i=n-1;i>0;i--){[a[0],a[i]]=[a[i],a[0]];swp++;heapify(i,0);}
    return {cmp,swp};
  }

  /* ── Preview bars ── */
  function updatePreview(arr) {
    const wrap = document.getElementById('previewBars');
    wrap.innerHTML = '';
    if (!arr.length) return;
    const max = Math.max(...arr);
    const bw  = Math.max(5, Math.min(28, Math.floor(wrap.offsetWidth / arr.length) - 3));
    const maxH = 48;
    arr.slice(0, 200).forEach(v => {
      const d = document.createElement('div');
      d.className = 'preview-bar';
      d.style.height  = `${(v / max) * maxH}px`;
      d.style.width   = `${bw}px`;
      d.title = v;
      wrap.appendChild(d);
    });
  }

  /* ── Parse input ── */
  function parseInput() {
    const raw = document.getElementById('manualInput').value.trim();
    if (!raw) return null;
    const nums = raw.split(/[\s,]+/).map(Number).filter(n => !isNaN(n) && isFinite(n));
    return nums.length ? nums : null;
  }

  document.getElementById('btnRandom').onclick = () => {
    const n   = Math.min(10000, Math.max(1, +document.getElementById('randSize').value || 20));
    const max = Math.max(1, +document.getElementById('randMax').value  || 100);
    currentArr = Array.from({length: n}, () => ~~(Math.random() * max) + 1);
    document.getElementById('manualInput').value = '';
    updatePreview(currentArr);
  };

  document.getElementById('manualInput').oninput = () => {
    const a = parseInput();
    if (a) { currentArr = a; updatePreview(a); }
  };

  document.getElementById('btnAnalyze').onclick = () => {
    const parsed = parseInput();
    if (parsed) currentArr = parsed;
    if (!currentArr.length) { alert('Please enter or generate an array first.'); return; }
    const results = runAll(currentArr);
    renderResults(results, currentArr.length);
  };

  /* ── Render results ── */
  function renderResults(results, n) {
    document.getElementById('resultSize').textContent = n;
    document.getElementById('resultsArea').style.display = 'block';

    const minCmp  = Math.min(...results.map(r => r.cmp));
    const minSwp  = Math.min(...results.map(r => r.swp));
    const minTime = Math.min(...results.map(r => r.ms));
    const maxCmp  = Math.max(...results.map(r => r.cmp));
    const maxSwp  = Math.max(...results.map(r => r.swp));
    const maxTime = Math.max(...results.map(r => r.ms));

    // find overall best
    const bestIdx = results.indexOf(results.reduce((b, r) => r.ms < b.ms ? r : b, results[0]));

    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    const emojis = ['🫧','🎯','📌','🔀','⚡','🏔️'];

    results.forEach((r, i) => {
      const tr = document.createElement('tr');
      if (i === bestIdx) tr.classList.add('best-row');

      const rating = rateAlgo(r, minCmp, maxCmp, minSwp, maxSwp, minTime, maxTime);
      const stars  = '★'.repeat(rating) + '☆'.repeat(5 - rating);

      tr.innerHTML = `
        <td>${emojis[i]} <strong>${r.name}</strong></td>
        <td class="${r.cmp === minCmp ? 'cell-best' : ''}">${r.cmp.toLocaleString()}</td>
        <td class="${r.swp === minSwp ? 'cell-best' : ''}">${r.swp.toLocaleString()}</td>
        <td class="${r.ms  <= minTime * 1.05 ? 'cell-best' : (r.ms === maxTime ? 'cell-worst' : '')}">${r.ms.toFixed(4)} ms</td>
        <td><span class="badge ${i < 3 ? 'red' : 'green'}">${r.complexity}</span></td>
        <td class="rating-stars" style="color:#f59e0b;font-size:1rem">${stars}</td>`;
      tbody.appendChild(tr);
    });

    // badges
    const best = results[bestIdx];
    document.getElementById('resultBadges').innerHTML = `
      <span class="badge green">🏆 Fastest: ${best.name} (${best.ms.toFixed(3)} ms)</span>
      <span class="badge purple">🔢 Fewest Comparisons: ${results.find(r=>r.cmp===minCmp).name}</span>
      <span class="badge blue">🔄 Fewest Swaps: ${results.find(r=>r.swp===minSwp).name}</span>`;

    // Charts
    renderChart('cmpChart',  results, r => r.cmp,  'Comparisons');
    renderChart('swpChart',  results, r => r.swp,  'Swaps/Movements');
    renderChart('timeChart', results, r => r.ms,   'Time (ms)');

    document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function rateAlgo(r, minC, maxC, minS, maxS, minT, maxT) {
    const scoreC = maxC === minC ? 1 : 1 - (r.cmp - minC) / (maxC - minC);
    const scoreS = maxS === minS ? 1 : 1 - (r.swp - minS) / (maxS - minS);
    const scoreT = maxT === minT ? 1 : 1 - (r.ms  - minT) / (maxT - minT);
    const avg    = (scoreC + scoreS + scoreT) / 3;
    return Math.max(1, Math.round(avg * 5));
  }

  /* ── Custom bar chart ── */
  function renderChart(id, results, valFn, label) {
    const canvas = document.getElementById(id);
    const ctx    = canvas.getContext('2d');
    const W = canvas.offsetWidth || 300;
    const H = 200;
    canvas.width  = W;
    canvas.height = H;

    const vals = results.map(valFn);
    const max  = Math.max(...vals) || 1;
    const pad  = { top: 10, right: 10, bottom: 50, left: 48 };
    const cw   = (W - pad.left - pad.right) / vals.length;
    const ch   = H - pad.top - pad.bottom;

    ctx.clearRect(0, 0, W, H);

    // background
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, W, H);

    // grid lines
    ctx.strokeStyle = 'rgba(99,102,241,.12)';
    ctx.lineWidth   = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + ch * (1 - i/4);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      ctx.fillStyle = '#64748b'; ctx.font = '10px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(fmtNum(max * i/4), pad.left - 4, y + 4);
    }

    const palette = ['#f97316','#8b5cf6','#22d3ee','#22c55e','#f59e0b','#ec4899'];
    const labels  = results.map(r => r.name.split(' ')[0]);

    vals.forEach((v, i) => {
      const bh = (v / max) * ch;
      const x  = pad.left + i * cw + cw * 0.1;
      const bw = cw * 0.8;
      const y  = pad.top + ch - bh;
      const col = palette[i];

      const grad = ctx.createLinearGradient(x, y, x, pad.top + ch);
      grad.addColorStop(0, col);
      grad.addColorStop(1, col + '44');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, bw, bh, 4);
      ctx.fill();

      // value label
      ctx.fillStyle = '#e2e8f0'; ctx.font = 'bold 9px sans-serif'; ctx.textAlign = 'center';
      if (bh > 16) ctx.fillText(fmtNum(v), x + bw/2, y + 13);

      // x label
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif';
      ctx.fillText(labels[i], x + bw/2, H - 6);
    });
  }

  function fmtNum(n) {
    if (n >= 1e6) return (n/1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n/1e3).toFixed(1) + 'K';
    return n.toFixed(n < 1 ? 3 : 0);
  }

  // Initial preview with sample data
  currentArr = [64, 25, 12, 22, 11, 90, 45, 3, 77, 55, 38, 61, 17, 84, 29];
  document.getElementById('manualInput').value = currentArr.join(' ');
  updatePreview(currentArr);
})();
