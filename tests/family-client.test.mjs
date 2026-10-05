import test from 'node:test';
import assert from 'node:assert/strict';
import {accountError} from '../shared/family-client.js';
test('email configuration only blocks recovery; credential and username failures are actionable',()=>{
 assert.equal(accountError({status:503,data:{error:'Email service unavailable'}}),'旧邮箱的邮件找回服务暂不可用。');
 assert.equal(accountError({status:503,data:{error:'Database unavailable'}}),'连接暂时中断，请稍后再试。');
 assert.equal(accountError({status:401,data:{code:'INVALID_USERNAME_OR_PASSWORD'}}),'用户名或密码不正确。');
 assert.equal(accountError({status:400,data:{code:'INVALID_USERNAME'}}),'用户名需为6—64个字符，只能包含文字、数字、点、下划线或短横线。');
 assert.equal(accountError({status:400,data:{code:'USERNAME_IS_ALREADY_TAKEN'}}),'这个用户名已被使用，请换一个。');
});
