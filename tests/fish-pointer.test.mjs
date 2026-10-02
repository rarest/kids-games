import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
test('fish touch position follows the logical canvas at the lower edge of a short landscape screen',async()=>{
 const html=await readFile(new URL('../games/fish.html',import.meta.url),'utf8');
 const source=html.match(/function pointerPos\(e\) \{([\s\S]*?)\n  \}/)[0];
 const context={W:568,H:320,canvas:{getBoundingClientRect:()=>({left:10,top:70,width:568,height:199})}};
 vm.createContext(context);vm.runInContext(source+';this.point=pointerPos({touches:[{clientX:294,clientY:249.1}]})',context);
 assert.ok(Math.abs(context.point.x-284)<.01);assert.ok(Math.abs(context.point.y-288)<.01);
});
