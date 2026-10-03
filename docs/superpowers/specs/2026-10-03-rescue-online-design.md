# 救援大冒险：两人联网与触控防误触

用户已确认两人联网房间方案，强调“不能卡”，并追加“双击不要放大，操作不要弹出网页菜单”。这是现有游戏新增网络子系统；交付是两个公网设备可实际合作，不能以服务器健康检查代替游戏验收。

## 体验

首页提供“联网双人”，创建房间或输入6位房间号加入。人数严格为2；创建者控制奇奇，加入者控制蒂蒂。每台设备都使用现有1P键盘、一个手柄或触屏；联网中不能通过2P按键操纵队友。两人在线后房主开始。显示房间号、自己角色、连接状态和延迟。等待区与暂停区可退出房间；第三人收到明确满员提示。

11区、分支、箱子和扔队友、敌人、8Boss、奖励房和结局沿用现有规则。房主选择已由本房完成记录解锁的下一站；本房从0区开始，入口分数/收集/生命由服务器记录，重试不重复保留本区临时奖励。联网数据不覆盖原单机入口存档。两人断开或一人暂停时队伍暂停；短时掉线自动重连并恢复原角色，恢复连接后手动继续。任一人明确退出则结束该房，队友可返回首页重新组队。

## 同步与响应

新增独立 Node WebSocket 服务，浏览器仍本地渲染3D，服务器只计算现有核心模拟。服务器60Hz推进、20Hz广播动态状态，不反复传输场景装饰和静态地图。输入固定1/60秒命令，按序号排队、消费和确认；跳跃/举投边沿只消费一次，不能因重传丢包或暂停连续触发。超量队列、失联输入和背压必须有界；不积累迟到状态包。

本机移动/跳跃/举投基于真实 core 做预测，按服务器确认序号重放未确认输入。服务器决定伤害、收集、胜负和区域进度。队友/世界采用短缓冲插值，大纠正（复活、换区、被托举）立即切换，普通小位置纠正平滑。不能把无限回滚、所有画面等服务器回包或反复重建 Three.js 场景作为同步方法。同一局的权威state对象引用保持稳定，避免现有音效/粒子按对象身份重放事件；只有真正start/retry/next创建新模拟才增加room.run并更换state对象。暂停epoch或奖励房转场不重置该局事件去重。传给scene的视觉state同局也保持对象引用，并消费权威events；clear停止预测而不因暂停更换视觉对象。关卡静态对象引用按区域稳定，动态快照不触发全景重建。预测期间 HUD 与持久化只使用权威状态。

网络输入和输出都有固定上限，至少覆盖200ms RTT、额外抖动与重连；已确认的预测历史丢弃。断线清输入/声音并停止预测，不得猜测队友状态或自动续战。上下文丢失/隐藏/冻结同步暂停并标记本设备未准备；GPU恢复/页面返回后重新准备，但不得由另一人提前解除未恢复设备的暂停。

## 性能验收

纯预测测试在延迟权威更新时当帧移动/跳跃，并在真实确认后收敛，无重复举投。真实两浏览器在200ms往返延迟条件下测量本机输入响应，目标小于100ms；记录实际值。测量活跃街区每端动态状态平均带宽，目标不超过80KiB/s；预测队列不超过120条，插值历史不超过8帧。服务器空闲等待/暂停房不推进模拟。输出帧落后时跳过旧快照。不能把渲染帧率和网络 RTT 混为同一数字；不声称实物手机/手柄性能已经测试。

## 触控

游戏app区域禁用双击放大、长按网页菜单、右键菜单和文字选择。控制区拖动不滚动页面；保留已有viewport正常适配。用真实双击/触摸及右键事件验证默认行为阻止，不只检查CSS文本；手机窄屏按钮必须可点且不横溢。

## 部署与兼容

沿用已授权 GitHub PR→main→既有webhook链。独立服务监听127.0.0.1:8788，公开路径/rescue-ws；保留原/shooter-ws及其服务；未变更的运行时不因文档或另一个游戏部署而重启，避免杀掉现有房间。新服务只允许两个网站Origin，限制消息、房间、连接和队列。重连凭据仅客户端sessionStorage存储，不进入日志/诊断/页面属性/记忆。新增生产服务代码不镜像到公开docroot。沿用Three0.186.1与已有ws依赖，不新增第三方托管、付费服务或视频流。单人、本机双人、原射击联机与前轮奖励复活/GPU暂停修复保持有效。

## 实施接口

`rescue/net-codec.js`：`encodeFrame(state, metadata)`、`decodeFrame(packet, previous)`；metadata={epoch,tick,acks:[number,number],inputs:[input,input],room:{code,host,mode,members,run},includeStage:boolean}。packet.type为state，包含areaId/levelId、必要动态数据，includeStage时附静态level；decode返回可给core/scene消费的真实state，保留同区level引用。输入={move:number,up:boolean,down:boolean,jump:boolean,action:boolean}。

`rescue/server.mjs`：`createRescueServer({port=8788,host='127.0.0.1',origins, ...testOptions})` 返回{ready,address(),close()}；升级路径/rescue-ws。客户端协议：create；join{code,token?}；input{epoch,commands:[{seq,input}]}；ready{value}；start/pause/resume/retry；next{areaId}；finishBonus；leave；ping{at}。响应joined{code,slot,token}、state、error{message}、closed{message}、pong{at}。不允许客户端直接提交游戏状态。

`rescue/net-prediction.js`：`createPrediction({slot})` 返回{receive(state,{epoch,ack,inputs}),advance(input,dt),render(now?),clear(),diagnostics()}；advance返回{commands,state}，commands仅{seq,input}；render为仅视觉预测state，权威state由transport保留，二者不可混写。

`rescue/net-client.js`：`createRescueClient({onState,onStatus,url?,storage?})` 返回{create(),join(code),command(type,payload?),advance(input,dt),render(now?),suspend(ready=false),setReady(value),leave(),dispose(),diagnostics()}。onState(state,packet)，onStatus(status)；客户端持有只读authority、slot、room。epoch变化清预测、待发命令和插值。断线自动携token重连，禁止凭据出现在diagnostics。该接口可在Task2收敛后记录精确export并供UI任务使用。
