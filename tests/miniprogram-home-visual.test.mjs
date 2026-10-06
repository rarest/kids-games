import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const catalog=JSON.parse(readFileSync(new URL('../english/miniprogram-data/catalog.json',import.meta.url)));
const source=readFileSync(new URL('../miniprogram/pages/home/home.js',import.meta.url),'utf8');
function home(progress={lessons:{},session:null}) {
 let definition;
 const navigations=[];
 const client={profile:null,progress:()=>progress,content:async()=>catalog};
 const app={client,ready:Promise.resolve()};
 vm.runInNewContext(source,{Page:value=>definition=value,getApp:()=>app,wx:{navigateTo:({url})=>navigations.push(url)},require:path=>require(new URL('../miniprogram/pages/home/'+path,import.meta.url).pathname)});
 const page={...definition,data:structuredClone(definition.data),setData(value){Object.assign(this.data,value)}};
 return {page,navigations,setProgress(value){progress=value}};
}
test('today recommendation resumes a saved lesson and refreshes after completing it',async()=>{
 const first=catalog.units[0].lessons[0],second=catalog.units[0].lessons[1];
 const h=home({lessons:{},session:{lessonId:second.id,index:1,steps:[{},{}]}});
 await h.page.onShow();
 assert.equal(h.page.data.recommended.id,second.id);
 assert.equal(h.page.data.recommended.resuming,true);
 h.page.openLesson({currentTarget:{dataset:{id:h.page.data.recommended.id}}});
 assert.equal(h.navigations[0],'/pages/lesson/lesson?id=g3-upper-u1-l2');
 h.setProgress({lessons:{[second.id]:{completed:true}},session:null});
 await h.page.onShow();
 assert.equal(h.page.data.recommended.id,first.id);
 assert.equal(h.page.data.recommended.resuming,false);
 assert.equal(h.page.data.completedCount,1);
});
test('unit expansion and page picker open the selected textbook page',async()=>{
 const h=home();await h.page.onShow();
 h.page.toggleUnit({currentTarget:{dataset:{id:'g3-upper-u2'}}});
 assert.equal(h.page.data.expandedUnit,'g3-upper-u2');
 h.page.toggleUnit({currentTarget:{dataset:{id:'g3-upper-u2'}}});
 assert.equal(h.page.data.expandedUnit,'');
 h.page.selectPage({detail:{value:15}});
 assert.equal(h.page.data.selectedPage.page,17);
 h.page.openSelectedPage();
 assert.equal(h.navigations[0],'/pages/page/page?page=17');
 assert.equal(h.page.data.units[1].imageURL,'https://games.nblord.com/english/illustrations/u2.webp');
});
test('completed curriculum offers a review lesson and profile changes clear completion display',async()=>{
 const lessons=Object.fromEntries(catalog.units.flatMap(unit=>unit.lessons).map(lesson=>[lesson.id,{completed:true}]));
 const h=home({lessons,session:null});await h.page.onShow();
 assert.equal(h.page.data.recommended.reviewing,true);
 assert.equal(h.page.data.completedCount,36);
 h.setProgress({lessons:{},session:null});await h.page.onShow();
 assert.equal(h.page.data.completedCount,0);
 assert.equal(h.page.data.units[0].completedCount,0);
 assert.equal(h.page.data.recommended.reviewing,false);
});
test('cloud progress without rebuilt steps still resumes its known lesson',async()=>{
 const h=home({lessons:{},session:{lessonId:'g3-upper-u3-l4',index:5}});await h.page.onShow();
 assert.equal(h.page.data.recommended.id,'g3-upper-u3-l4');
 assert.equal(h.page.data.recommended.resuming,true);
});
async function lessonDisplay(id){
 let definition;
 const file=new URL('../miniprogram/pages/lesson/lesson.js',import.meta.url);
 const lesson=JSON.parse(readFileSync(new URL('../english/miniprogram-data/lessons/'+id+'.json',import.meta.url)));
 const client={identity:'guest',content:async()=>lesson,progress:()=>({version:1,lessons:{},items:{},session:null}),saveProgress(){},flush:async()=>{}};
 vm.runInNewContext(readFileSync(file,'utf8'),{Page:value=>definition=value,require:createRequire(file),wx:{},getApp:()=>({client})});
 const page={...definition,data:structuredClone(definition.data),setData(value){Object.assign(this.data,value)}};
 page.onLoad({id});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(page.data.loading,false);
 return {page,lesson};
}
test('guided scenes use unit illustration while story scenes preserve story-specific art',async()=>{
 const unit=await lessonDisplay('g3-upper-u3-l1');
 assert.equal(unit.page.data.lesson.imageURL,'https://games.nblord.com/english/illustrations/u3.webp');
 const story=await lessonDisplay('g3-upper-u3-l6');
 assert.equal(story.page.data.lesson.imageURL,'https://games.nblord.com'+story.lesson.image);
});
