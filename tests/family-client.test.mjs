import test from 'node:test';
import assert from 'node:assert/strict';
import {accountError} from '../shared/family-client.js';
test('only an explicit email configuration failure produces the email setup message',()=>{assert.equal(accountError({status:503,data:{error:'Email service unavailable'}}),'邮件服务尚未配置，注册和密码找回暂不可用。');assert.equal(accountError({status:503,data:{error:'Database unavailable'}}),'连接暂时中断，请稍后再试。')});
