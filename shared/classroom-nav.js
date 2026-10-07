export function mountClassroomNav({subject='',canLeave=()=>true,beforeLeave=()=>{}}={}){
 document.body.classList.add('classroom-page');
 const nav=document.createElement('nav');nav.className='classroom-nav';nav.setAttribute('aria-label','珠珠课堂学科');nav.innerHTML=`<a class="classroom-brand" href="/games/classroom.html">✦ 珠珠课堂</a><div><a data-subject="chinese" ${subject==='chinese'?'aria-current="page"':''} href="/games/chinese.html">语文</a><a data-subject="english" ${subject==='english'?'aria-current="page"':''} href="/games/english.html">英语</a><a data-subject="math" ${subject==='math'?'aria-current="page"':''} href="/games/math.html">数学</a></div><a class="classroom-parent" href="/account.html">家长中心</a>`;document.body.prepend(nav);
 nav.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;if(!canLeave()){event.preventDefault();return;}beforeLeave();});return nav;
}
