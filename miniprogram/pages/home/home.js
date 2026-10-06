const {absolute}=require('../../lib/view.js');
Page({
 data:{loading:true,sessionReady:false,error:'',catalog:null,profileName:'访客 · 此设备',completed:{},sync:'此设备',units:[],recommended:null,completedCount:0,lessonCount:0,expandedUnit:'',pageOptions:[],pageIndex:0,selectedPage:null,pageDirectoryOpen:false,pageGroups:[],pageGroupIndex:0,directoryPages:[]},
 async onShow(){
  const app=getApp(),epoch=this.showEpoch=(this.showEpoch||0)+1;this.hidden=false;this.client=app.client;this.setData({sessionReady:false});
  const catalogReady=this.data.catalog?Promise.resolve(this.updateCatalog(this.data.catalog)):this.load();
  await Promise.all([app.ready,catalogReady]);if(this.hidden||epoch!==this.showEpoch)return;
  this.setData({sessionReady:true});
  this.setData({profileName:this.client.profile?.nickname||'访客 · 此设备',sync:this.client.profile?(this.client.conflict?'需选择进度':this.client.pending?'待同步':'已同步'):'此设备'});
  if(this.data.catalog)this.updateCatalog(this.data.catalog);
 },
 onHide(){this.hidden=true;this.showEpoch=(this.showEpoch||0)+1},
 onUnload(){this.onHide()},
 useGuestStartup(){if(!this.data.sessionReady)getApp().useGuestStartup()},
 async load(){
  const epoch=this.showEpoch;this.setData({loading:true,error:''});
  try{const catalog=await this.client.content('catalog.json');if(this.hidden||epoch!==this.showEpoch)return;this.updateCatalog(catalog);this.setData({loading:false})}
  catch(error){if(!this.hidden&&epoch===this.showEpoch)this.setData({loading:false,error:error.message})}
 },
 updateCatalog(catalog){
  const progress=this.client.progress(),completed=progress.lessons||{};
  const units=catalog.units.map((unit,index)=>{
   const lessons=unit.lessons.map((lesson,lessonIndex)=>({...lesson,number:lessonIndex+1,completed:!!completed[lesson.id]?.completed,pagesLabel:lesson.pages.join('、')}));
   return {...unit,lessons,number:index+1,imageURL:absolute('/english/illustrations/u'+(index+1)+'.webp'),completedCount:lessons.filter(lesson=>lesson.completed).length,lessonCount:lessons.length};
  });
  const lessons=units.flatMap(unit=>unit.lessons.map(lesson=>({...lesson,unitTitle:unit.zh,unitNumber:unit.number,imageURL:unit.imageURL})));
  const session=progress.session;
  const resumed=session&&Number.isInteger(session.index)&&session.index>=0&&(!session.steps||session.index<session.steps.length)?lessons.find(lesson=>lesson.id===session.lessonId):null;
  const next=lessons.find(lesson=>!lesson.completed);
  const recommended=resumed||next||lessons[0];
  const pageGroups=[...catalog.units.map(u=>({id:u.id,title:u.zh})),{id:'appendix',title:'复习与附录'}].map(group=>({...group,pages:catalog.pages.filter(page=>(page.unitId||'appendix')===group.id)}));
  const pageIndex=Math.min(this.data.pageIndex,Math.max(0,catalog.pages.length-1));
  this.setData({pageGroups,pageGroupLabels:pageGroups.map(g=>g.title),directoryPages:pageGroups[this.data.pageGroupIndex]?.pages||[],catalog,units,completed,completedCount:lessons.filter(lesson=>lesson.completed).length,lessonCount:lessons.length,recommended:recommended?{...recommended,resuming:!!resumed,reviewing:!resumed&&!next}:null,pageOptions:catalog.pages.map(page=>'第 '+page.page+' 页 · '+page.title),pageIndex,selectedPage:catalog.pages[pageIndex]||null});
 },
 toggleUnit(e){const id=e.currentTarget.dataset.id;this.setData({expandedUnit:this.data.expandedUnit===id?'':id})},
 selectPage(e){const index=Number(e.detail.value),page=this.data.catalog?.pages[index];if(page)this.setData({pageIndex:index,selectedPage:page})},
 openPageDirectory(){const index=this.data.pageGroups.findIndex(g=>g.pages.some(p=>p.page===this.data.selectedPage?.page));this.setData({pageDirectoryOpen:true,pageGroupIndex:Math.max(0,index),directoryPages:this.data.pageGroups[Math.max(0,index)].pages})},
 closePageDirectory(){this.setData({pageDirectoryOpen:false})},
 selectPageGroup(e){const index=Number(e.detail.value),group=this.data.pageGroups[index];if(group)this.setData({pageGroupIndex:index,directoryPages:group.pages})},
 chooseDirectoryPage(e){const index=this.data.catalog.pages.findIndex(p=>p.page===Number(e.currentTarget.dataset.page));if(index>=0){this.selectPage({detail:{value:index}});this.closePageDirectory()}},
 stopSheetTap(){},
 openSelectedPage(){if(this.data.selectedPage)this.openPage({currentTarget:{dataset:{page:this.data.selectedPage.page}}})},
 openLesson(e){if(this.data.sessionReady)wx.navigateTo({url:'/pages/lesson/lesson?id='+encodeURIComponent(e.currentTarget.dataset.id)})},
 openPage(e){if(this.data.sessionReady)wx.navigateTo({url:'/pages/page/page?page='+e.currentTarget.dataset.page})},
 account(){wx.navigateTo({url:'/pages/account/account'})}
});
