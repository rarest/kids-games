import {wordArt} from './course-art.js';
export function textbookSection(unit,esc,wholeBook=false){
 const pages=unit.textbookPages;if(!pages?.length)return '';
 return `<section class="textbook-section"><div class="page-classroom-heading"><h3>一页一页，学会词句</h3><p>听懂 → 练习 → 自己读一读</p></div><div class="textbook-controls"><label>课本页码<select id="textbookPage">${pages.map(p=>`<option value="${p.page}">第${p.page}页 · ${esc(p.title)}</option>`).join('')}</select></label><div class="page-nav"><button id="previousTextbookPage" class="secondary" aria-label="上一页">← 上一页</button><button id="nextTextbookPage" class="secondary" aria-label="下一页">下一页 →</button></div>${wholeBook?'<button id="showBookPages" class="text-button">查看全册页码</button>':''}<button id="readTextbookPage" class="listen-button">🔊 听本页</button><button id="stopTextbookReading" class="secondary" hidden>停止朗读</button></div><nav class="page-view-tabs" aria-label="本页学习方式">${[['reading','看图听读'],['practice','词句练习'],['speaking','开口朗读']].map(([id,label])=>`<button data-page-view="${id}" aria-pressed="${id==='reading'}">${label}</button>`).join('')}</nav><div id="textbookPageContent">${textbookPage(pages[0],esc)}</div></section>`;
}
export function pageWordGroups(page){
 const tokens=blocks=>new Set(blocks.flatMap(b=>b.lines.flatMap(l=>(l.en.toLowerCase().match(/[a-z]+/g)||[]))));
 const heading=tokens(page.blocks.filter(b=>b.kind==='heading')),body=tokens(page.blocks.filter(b=>b.kind!=='heading'));
 const primary=[],support=[];page.words.forEach((word,index)=>{const key=word.en.toLowerCase();(heading.has(key)&&!body.has(key)?support:primary).push({word,index})});return{primary,support};
}
export function textbookPage(page,esc){
 const groups=pageWordGroups(page);
 const cards=items=>items.map(({word:w,index:i})=>`<article class="page-word-card">${wordArt(w)}<button class="study-word" data-textbook-word="${esc(w.id)}"><strong>${esc(w.en)} 🔊</strong><span>${esc(w.ipa)}</span><small>${esc(w.zh)}</small></button><button class="text-button" data-page-speak="p${page.page}-word-${i}">读这个词 ↗</button></article>`).join('');
 const number=page.unitId?.match(/u(\d+)$/)?.[1];
 const art=number?`<img class="page-scene" src="/english/illustrations/u${number}.webp" alt="本单元情境插画" width="1536" height="1024" loading="lazy">`:'';
 return `<div class="page-reading-grid"><div class="page-reading-text">${art}${page.blocks.map((block,b)=>`<section class="textbook-block">${block.lines.length===1&&block.lines[0].en===block.title?'':`<h4>${esc(block.title)}</h4>`}${block.lines.map((line,i)=>`<div class="textbook-line"><strong>${esc(line.en)}</strong><p>${esc(line.zh)}</p>${line.tip?`<small>${esc(line.tip)}</small>`:''}${/[A-Za-z0-9]/.test(line.en)?`<div class="page-line-actions"><button class="listen-button" data-textbook-line="${b}:${i}" aria-label="朗读 ${esc(line.en)}">🔊 听示范</button><button class="text-button" data-page-speak="p${page.page}-line-${b}-${i}">读这句话 ↗</button></div>`:''}</div>`).join('')}</section>`).join('')}</div><aside class="page-word-panel"><h4>本页词语 <span>${page.words.length} 项</span></h4><p>先听，再看意思。每个词都可以练习和跟读。</p><div class="study-words textbook-words">${cards(groups.primary)}</div>${groups.support.length?`<details class="page-support-words"><summary>栏目用词 · ${groups.support.length} 个</summary><div class="study-words textbook-words">${cards(groups.support)}</div></details>`:''}</aside></div>`;
}
