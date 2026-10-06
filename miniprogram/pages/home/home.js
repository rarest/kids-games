const {origin}=require('../../config.js');
Page({
 data:{loading:true,error:'',catalog:null,profileName:'访客 · 此设备',completed:{},sync:'此设备',units:[],recommended:null,completedCount:0,lessonCount:0,expandedUnit:'',pageOptions:[],pageIndex:0,selectedPage:null},
 async onShow(){
  const app=getApp();this.client=app.client;await app.ready;
  this.setData({profileName:this.client.profile?.nickname||'访客 · 此设备',sync:this.client.profile?(this.client.conflict?'需选择进度':this.client.pending?'待同步':'已同步'):'此设备'});
  if(!this.data.catalog)await this.load();else this.updateCatalog(this.data.catalog);
 },
 async load(){
  this.setData({loading:true,error:''});
  try{const catalog=await this.client.content('catalog.json');this.updateCatalog(catalog);this.setData({loading:false})}
  catch(error){this.setData({loading:false,error:error.message})}
 },
 updateCatalog(catalog){
  const progress=this.client.progress(),completed=progress.lessons||{};
  const units=catalog.units.map((unit,index)=>{
   const lessons=unit.lessons.map((lesson,lessonIndex)=>({...lesson,number:lessonIndex+1,completed:!!completed[lesson.id]?.completed,pagesLabel:lesson.pages.join('、')}));
   return {...unit,lessons,number:index+1,imageURL:origin+'/english/illustrations/u'+(index+1)+'.webp',completedCount:lessons.filter(lesson=>lesson.completed).length,lessonCount:lessons.length};
  });
  const lessons=units.flatMap(unit=>unit.lessons.map(lesson=>({...lesson,unitTitle:unit.zh,unitNumber:unit.number,imageURL:unit.imageURL})));
  const session=progress.session;
  const resumed=session&&Number.isInteger(session.index)&&session.index>=0&&(!session.steps||session.index<session.steps.length)?lessons.find(lesson=>lesson.id===session.lessonId):null;
  const next=lessons.find(lesson=>!lesson.completed);
  const recommended=resumed||next||lessons[0];
  const pageIndex=Math.min(this.data.pageIndex,Math.max(0,catalog.pages.length-1));
  this.setData({catalog,units,completed,completedCount:lessons.filter(lesson=>lesson.completed).length,lessonCount:lessons.length,recommended:recommended?{...recommended,resuming:!!resumed,reviewing:!resumed&&!next}:null,pageOptions:catalog.pages.map(page=>'第 '+page.page+' 页 · '+page.title),pageIndex,selectedPage:catalog.pages[pageIndex]||null});
 },
 toggleUnit(e){const id=e.currentTarget.dataset.id;this.setData({expandedUnit:this.data.expandedUnit===id?'':id})},
 selectPage(e){const index=Number(e.detail.value),page=this.data.catalog?.pages[index];if(page)this.setData({pageIndex:index,selectedPage:page})},
 openSelectedPage(){if(this.data.selectedPage)this.openPage({currentTarget:{dataset:{page:this.data.selectedPage.page}}})},
 openLesson(e){wx.navigateTo({url:'/pages/lesson/lesson?id='+encodeURIComponent(e.currentTarget.dataset.id)})},
 openPage(e){wx.navigateTo({url:'/pages/page/page?page='+e.currentTarget.dataset.page})},
 account(){wx.navigateTo({url:'/pages/account/account'})}
});
