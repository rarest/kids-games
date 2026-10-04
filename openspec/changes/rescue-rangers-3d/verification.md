# 松鼠大战三维重制验证记录

## 当前状态

- 用户已确认方案并授权开始实现、接入游戏厅及发布。
- 游戏已通过 [PR #35](https://github.com/rarest/kids-games/pull/35) 合并发布；游戏发布提交 `0b9b1c551fb7ca69fdeee965da4fe5467f8917e5`。主站及备用站真实浏览器验收均 2/2，通过后记录结果。
- 基线 `npm run test:unit` 372/372 通过，0 失败（`/tmp/rescue-baseline-unit.log`）。
- 公网现有跑酷页面实际 Three.js 渲染 ready、无 Runtime 错误；游戏清单、HTML、bundle 与本地基线一致。
- 原版 11 张区域地图与世界路线截图用于新制作三维场景；完整游戏已加入公网大厅，共 12 款游戏。
- 沿用现有 webhook 部署链，源站自动更新到游戏发布提交；`games-webhook.service` 与 `shooter-coop.service` 的用户服务均 active。
- 首页插画生成请求被图像服务拒绝，没有生成或使用任何该请求的图片。决定首页使用实时三维游戏场景，避免让插画阻挡功能实现。

## 已落实接口补充

- 可操作奖励房：主关通过后（J 除外）进入 `status='bonus'`，`state.level` 切为奖励房，保留原始 `state.areaLevel`；倒计时或正常退出后 cleared，并按原 area id 结算。渲染层须跟踪真实 `state.level` 切换。
- `state.platforms` 为动态平台坐标；`state.level.platforms` 是静态原始数据。渲染运动平台读取前者。
- `state.pickups` 包括花、星、橡果和 Zipper，箱子内容物通过正常物理规则生成；不以测试专用函数强行授予。
- 真实手柄接口与双手柄输入可以测试，当前没有连接实物手柄；最终区分标准 API 适配证据和实物验收。

## 已完成并审查的实现

- 纯模拟、11 个独立区域、原分支顺序和 8 类 Boss 已完成。首次完整单元检查 413/413；其后球恢复修复专项 49/49。B/G 球恢复到 authored 支撑平台，已通过正常落地、走近、拾起和再次上投的实际模拟回归。
- 完整关卡几何遍历使用真实 move/jump 输入；该专项移除危险物及战斗实体以隔离几何。完整带敌人、危险物及 Boss 的独立验收证据见下文，不将几何检查当作战斗通关。
- 3D 角色、物体、12 类敌人、8 类 Boss、逐关地标和背景已完成，任务范围 `de97a33..1227c93`。基础 core/render 专项 66/66，后续椅子/粒子修复 renderer 19/19；独立任务评审及修复复审通过。
- 实际查看 11 个主题的原生 WebGL 图片；最终托箱、毛虫、机器人、肥猫坐椅图片在 `/tmp/rescue-evidence/`。三轮所有主题 GPU 资源检查稳定在 7 geometries/9 textures，共享池 7/274/6；椅子后实际场景对象池检查仍稳定，最终整页 GPU 检查留给集成验收。
- 粒子首次空帧后在远处被错误裁剪的缺陷已修复；回归使用真实 Three Frustum、首帧空实例和 x=100 的实际粒子，没有源文本断言或替身模型。
- 原图关卡跨度、主要折返和垂直路线保留；个别平台几何、物件密度及 AI 时间采用近似，详见 `rescue/REFERENCE.md`。不声称 ROM 逐帧或逐像素一致。
- 游戏页面、双人键盘/触控、标准手柄 API、音效、奖励/地图/结局和进度存储已接通，提交 `4a998c9`、`b3f7c1e`。input/profile 11/11、真实页面专项 12/12，原生额外 smoke 1/1；独立任务审查及后续修复复审均已通过。
- 页面覆盖六种宽窄横竖尺寸；短横屏使用实际全高三维场景及边缘控制，568×320 和 568×280 图片已查看。正常首页/开始/暂停/返回四轮 GPU 资源保持 5 geometries/7 textures，共享池 7/84/5、67 entities，没有增长。
- 构建保留 esbuild 的原始 Three GLSL 文本，重复构建 SHA 一致。`.gitattributes` 只对生成文件 `rescue/bundle.js` 关闭 whitespace 判错；普通源码检查仍开启。完整原始生成物审查包保留，源码审查包仅替换这一生成块为字节数及 SHA，发布前须再次逐字节核对构建。
- 双人加命的死亡复活缺陷已修复：两条奖励路径共用规则，死亡队友在当前检查点恢复三心与正常短无敌；活着的角色只增加命数。四项纯输入回归从全部失败变为 4/4，通过完整核心专项 53/53；提交 `82d87b3`，独立复审通过。正常输入重现及修复日志保留在 `/tmp/rescue-extra-life-root-red.log`、`/tmp/rescue-task1-fix2-*.log`。
- Task3 收尾修复：独立最高分存档和终态音效新增检查通过，input/profile 12/12；真实 Web Audio 的结束声音保留到自然结束，普通暂停立即停音。受影响页面专项 7/7，包括六尺寸、原生纵向触控、存储、资源、生命周期和实际音频。
- 网页从合法 C 区入口存档恢复（先前 0/A 完成记录为正常存档 fixture），保留原出生点、平台、敌人和机关，用原生键实际完成 C 区、奖励房收花、结算、解锁 D、进入下一站并刷新继续；通过 1/1（180 秒墙钟）。中途使用正常检查点重生，实际状态没有外部坐标、生命或通关写入。日志 `/tmp/rescue-task3-r1-native-C.log`，截图 `native-C-bonus/complete/unlocked-map.png` 已查看。这是原生 C→D 恢复/结算验证，完整11区模拟记录另列。
- 原生路线准备时的移动平台边缘自动操作错误，以及测试选择器误命中 canvas 属性，分别保留调试日志；修正测试路线和选择器后通过，没有据此改动关卡或物理。
- Task3 修复提交 `4720e53`，独立复审确认四项缺口及纵向触控均解决。现行 constructor/instance API 已在设计中正式记录；构建 SHA 为 `8389ef503b7c33092b7c0bcf95c49898212362d705affb4bc703f9e439cb4ac8`，重复构建一致。随后大厅、全战役回归和全项目检查已完成，结果见下文。

## 带战斗的实际输入通关证据

2026-10-03 在当前纯模拟版本重新运行私有诊断输入程序，完整保留 authored 平台、物件、敌人、危险物及 Boss。真实状态仅通过 `stepGame` 接收输入；没有修改位置、生命、无敌时长、敌人列表或直接设为通关。

- 0/A/C/E/F/G/H/I/J：正常单人出生点进入，正常移动/跳跃、举箱/投掷、球攻击及奖励房行走退出，九区均 `cleared`，日志 `/tmp/rescue-nine-occupied.log`。
- B：正常单人，等待水龙头危险窗口，使用克隆状态前瞻选择真正输入，五次实际球命中并通过奖励房；`cleared`，剩余 2 命/1 心，日志 `/tmp/rescue-B-occupied.log`。前瞻没有写入被验证的真实状态。
- D：正常双人，P1 实际行走攻击并耗尽自身生命后，输入转到仍位于原出生点的 P2；P2 实际走过关卡、利用正常检查点复活、打完 Boss 并通过奖励房；`cleared`，P2 剩余 2 命/2 心，日志 `/tmp/rescue-D-coop-occupied.log`。没有把 P2 移到 Boss 或重新排序玩家数组。
- 私有程序现已整理为可移植的 `tests/rescue-occupied-driver.mjs` 和 `tests/rescue-occupied.test.mjs`。真实 11 区全部 cleared，八 Boss 每只实际命中记录均为 hp 4→3→2→1→0；非 J 区进入并正常走完奖励房，J 直接达到 `ending=true`。D 仍按实际双人模式验证，其他十区单人；不把这项纯模拟覆盖写成完整网页通关或 D 单人证据。专项日志 `/tmp/rescue-occupied-green.log`（1/1，36.7 秒）。

## 游戏厅与全项目门禁

- 大厅目录新增「松鼠大作战」，原有 11 项对象保持一致，目录总数变为 12；HTML 入口、本地 bundle 和资源版本保持同源。
- 新原生集成测试先确认卡片缺失而失败，接入后实际搜索、点击卡片、开始、移动、拾取 s1 和投掷、刷新继续、返回首页和大厅，通过。测试复用正常外部域名参数 `GAMES_TEST_ORIGIN`，上线后将执行同一玩家路径。
- 最终 J 在完整 authored 模拟中通过五次球命中击败肥猫并结算，再用主页面共用的 `rescue/completion.js` 在真实 DOM 验证「朋友获救了！」、6400 分及「再去探险」。这是模拟结局加生产展示函数验收，不声称原生网页从 0 玩到 J。故意错分支的 mutation 测试能实际发现错误文案，恢复正确分支后通过。
- 两项原生集成通过 2/2，日志 `/tmp/rescue-integration-green.log`。最终构建与原始 esbuild 内存重建字节一致，SHA `59a8ec4049becfa431ef62dec90b388a8d20eef1d859d90cc746e32504e41ff9`。
- 完整 `npm run test:unit` 457/457、0 fail/skip，通过（49.85 秒，`/tmp/rescue-final-unit.log`）。完整 `npm run test:browser` exit 0：22 个串行脚本、59/59 测试、0 fail/cancelled/skipped（`/tmp/rescue-final-browser.log`）。原有 20 个游戏脚本及新增 rescue 页面脚本保留，再追加集成脚本。原生 C 本轮 91.98 秒完成，实际 400 分/2 花/2 命携带到 D 且刷新保留；新一轮/重试清零当前分数而保留最高分。

- Task4 实施提交 `532c4c9`，独立任务审查通过。整分支审查范围 `323c2a9..da89f75` 发现 1 个 Important 及 4 个 Minor，已在单次修复波次 `ecee285` 全部处理，独立复审确认五项全部解决、无新增问题；已发布并完成双域真实操作验收。完整门禁对应修复前版本，末轮修复按影响范围重新检查。

## 整分支复核

- Important：合法双人 D 区入口存档 `lives=[0,2]`，首页改选单人后从地图进入，原控制器只复制死亡 P1，造成无法行动且保存时原入口被归一化为 null。独立 Chromium 原生点击和按键已重现，分数 2000/花 3 的入口丢失；已通关区域和最高分保留。完整复核没有重复运行全套门禁。
- 同批修复范围包括木箱消耗后重叠目标多命中、通用敌人测试依赖名称元数据、三处美术/渲染模块长行格式，以及结算→地图→返回时遗失结算面板。四项为 Minor，均已在一次修复波次处理。
- J 控制器调用已独立核对：真实核心结局状态进入 `complete()`，把同一真实 state 交给生产展示函数，没有遗漏的 J 专属页面分支。公开验收随后在双域完成，结果见下文。

## 公网发布与真实操作

2026-10-03（北京时间）上线：主入口 [松鼠大作战](https://games.nblord.com/games/rescue.html)，备用入口 [松鼠大作战备用站](https://games.596996.xyz/games/rescue.html)。游戏厅目录可搜索实际卡片。

- PR #35 合并于 UTC 2026-10-02 18:05:09，游戏发布提交 `0b9b1c551fb7ca69fdeee965da4fe5467f8917e5`。服务器由真实 push webhook 自动拉取、同步、重载；没有另建部署链。发布后源仓库干净，两个既有用户服务 active。
- 同一原生集成检查设置实际 `GAMES_TEST_ORIGIN`，关闭本地服务：主域名 2/2、23.96 秒；备用域名 2/2、25.76 秒。实际搜索大厅、点击游戏、开始、移动从 x2.881 到 x4.801、拾取 s1、真实投掷、刷新继续从区域入口 x2.881 恢复，再正常返回 12 款游戏大厅。两端 WebGL 正常、三维几何实际渲染，异常列表均为空。
- 两域另检查真实 J 模拟结果经过线上共用生产展示函数形成 DOM 结局；这项范围仍为完整模拟加实际 DOM，不称为网页从 0 到 J 的完整战役。
- 每域六份公开资源均 HTTP 200 且 SHA 与最终文件完全一致；下表为两域共同值。首次 Python urllib 回读返回 403，随后 curl 和实际 Chromium 均正常；资源核对使用 curl 成功结果，未因此修改线上服务。
- 主站截图已实际查看举箱，备用站截图已实际查看刷新继续；证据 `/tmp/rescue-evidence/public-main/`、`/tmp/rescue-evidence/public-secondary/`（hall-search/native-pickup/native-throw/reloaded-continue.png、result.json、ending.json）。原生日志 `/tmp/rescue-public-main.log`、`/tmp/rescue-public-secondary.log`；资源 `/tmp/rescue-evidence/public-resource-hashes.json`。

| 文件 | 双域共同 SHA-256 |
| --- | --- |
| `games.js` | `dc7f3dff8a1548a480b6314d21b780a57f6b02c463774d492780aec330e6c89c` |
| `index.html` | `813c5aa947d02723378500eb89c0bcb60f47bba350dc84ca073c798d6bc6381b` |
| `games/rescue.html` | `bb0b8c4f99750781c35405f80b6cafa1ef9c723631a3cc7fda0ffa9284330aed` |
| `rescue/bundle.js` | `8a2a601e96d4be3655519fed584235251941cb3b56a2653e87fbeb9b67fa41fd` |
| `rescue/style.css` | `04410de360c5122a27100e6b88467b17991659287929e6ac770fed8f1168f395` |
| `rescue/completion.js` | `5df33e10283c0dcf1a854fcb3a44910f2dfd8e461c7624f02ed17c7e63a94aac` |

## 授权与验收

用户“完整复刻一个加入 games.nblord.com”，确认 2.5D、完整战役与本地双人后回复“开始吧”。实现、测试、PR、合并和上线验收按这一授权连续推进。

## 实施决定与判断错误时的影响

按发生顺序保留控制器作出的决定，最终游戏结果及证据见前文。

| 决定 | 理由及判断错误时的影响 |
| --- | --- |
| 复用已核对干净的 linked worktree，创建独立 rescue 分支，保留原分支 | 避免在现有 worktree 内再次套 worktree；如果误判为干净，可能覆盖未提交工作，因此先核对实际状态。 |
| 按已批准方案直接执行，不重复询问实施方法和阶段权限 | 用户已说“开始吧”，实现到上线的授权延续；如果范围理解错误，会造成多余工作，需以本次明确的游戏交付范围复核。 |
| 用原地图截图作布局参考、新制作三维资产，不搭 ROM 模拟器 | 符合批准的二维物理加三维画面；个别像素、物件密度及 AI 时序为近似，具体记录在 REFERENCE.md。 |
| 保留原版相对地图跨度和主要区段间距，不把长区压缩成半长 | 保护原有横向行程和垂直路线；间距判断错会影响难度与行程，需要重做相关地图。 |
| 两套独立键盘、标准 A/B/Start 手柄和纵向触屏摇杆，断连不挪动另一名玩家 | 保证同屏双人不抢按键；习惯其他键位的玩家需参考屏幕帮助。 |
| 肥猫保持真实战斗高度，用纯装饰椅子支撑坐姿 | 不改变球命中与 Boss 坐标；如果装饰轮廓不合适，只需返工椅子美术。 |
| 上方向为上投，下方向为蹲藏或配合跳跃下穿 | 按绑定设计解决“up/down throws”的草案歧义；如果以后需要下投，须明确新增核心动作和说明。 |
| 完整原始 diff 保留，审查副本只把生成 bundle 块替换成字节数和 SHA | 源模块完整审查，避免压缩 Three 占满上下文；若生成关系不符，字节一致重建检查会阻止发布。 |
| 用单一路径 Git whitespace 属性保留 esbuild 原始 GLSL，不改生成字符串空白 | 普通源码仍检查；手改生成物即使被该属性遮住，也必须由重建 SHA 检查发现。 |
| 将三个私有模块契约正式修订为已集成的 constructor/instance API | 保留稳定手柄绑定、状态身份事件游标和显式存储失败；没有既有外部消费者，未来若按旧草案接入需调整签名。 |
| 原生解锁验收从合法 C 区入口存档恢复，再真实操作到 D 并刷新 | 隔离缺失的网页结算链路，完整战役另有实际输入回归；若前置 fixture 与真实存档不同，会影响恢复结论，需由存档及战役检查共同核对，不能声称浏览器已完成 0/A。 |
| 终态音效可自然结束，普通暂停/隐藏/离页仍立即停全部声音 | 解决 clear 声音被先停音或重复 activate 截断；如果调用顺序回退，真实 oscillator 生命周期检查须发现。 |
| J 用真实完整模拟结局，加主页面共用的生产完成函数在真实 DOM 验收 | 验证同一文案分支，C 已实际走完页面结算与下一站；若出现仅 J 的控制器分支问题，须由最终调用方审查发现，不称为浏览器从 0 玩到 J。 |
| 双人转单人时沿用存活角色剩余生命，保留累计成绩并遵守新人数选择 | 避免创建全死游戏、丢弃入口存档或免费恢复三命；继续按钮仍恢复原人数，未切模式仍保留耗尽的角色槽位。如果玩家期望不同的转换规则，只需调整转换交互，原入口统计必须保留。 |

| 按已授权的 PR、合并和 webhook 路径发布，沿用全包结果与修复后专项 | 用户明确要求接入并上线，main 分支已核对；不重复询问既定选择或重跑无改动套件。如果误解发布意图，会产生多余版本，因此核对原请求与精确 PR HEAD 后合并。 |

## 末轮修复检查

- 修复提交 `ecee285`；核心/关卡/战役/输入/存档 69/69，真实几何及渲染 19/19，完整带战斗 11 区回归 1/1，合计 89 项受影响单元检查通过。原生页面 8/8，通过四组人数转换、原人数继续、真实 C→奖励→结算→地图返回→再选 D→选项返回→刷新继续。没有重复无改动的其他游戏全套检查。
- RED：消耗物四组纯输入全部按预期失败；模式转换及真实 C 结算返回两项原生页面均实际失败。GREEN 日志 `/tmp/rescue-final-core-green.log`、`/tmp/rescue-final-render-green.log`、`/tmp/rescue-final-occupied-green.log`、`/tmp/rescue-final-browser-green.log`，均 0 fail/cancelled/skipped；原生异常列表为空。
- 美术三模块只展开格式，逐文件 esbuild transform 前后字节相同。通用敌人断言检查真实部件与空间关系；把鸟临时错路由到狗的测试副本按预期失败，没有据此声称原生产模型有错误。
- 最终 bundle 与独立原始 esbuild 重建逐字节一致，SHA `8a2a601e96d4be3655519fed584235251941cb3b56a2653e87fbeb9b67fa41fd`。Task4 全包门禁的旧 SHA59a8 和此处最终 SHA 区分记录。

- 整分支 Important 及四项 Minor 的独立复审全部 ADDRESSED，没有新增 Critical/Important 或范围外问题；九个修复文件 SHA 与报告一致，格式前后字节等价由复审再次独立核对。已更新远端 main，仍为 `323c2a9`，没有需要调和的其他提交。

## 用户请求的上线后试玩（2026-10-03）

用户要求“你试玩下，看有没什么bug”。从实际主域名独立 Chromium 开始双人新局，原生操作托队友/上抛、举箱蹲藏、跳跃投掷、三轮画质和暂停操作、绘图上下文丢失/恢复、返回主页继续；记录 `/tmp/rescue-evidence/playtest/result.json` 与截图。基本交互无异常。

发现两处新缺陷：

1. 奖励房仍保存主关 checkpoint，加命复活队友时位置在房间外，被当作正常出口而提前结算。纯输入 fixture 中 P2 正常掉坑至0命，P1 正常收9星/49花、经过 x40检查点并进入奖励房，收下一朵花即 cleared。直接收奖励星的路径也复现；没有写入运行中的位置或生命。已加入两项回归，修复前2/2按预期失败。
2. 真实 WebGL 失去上下文后，页面仍 playing；主站原生按住移动并调用正常 WEBGL_lose_context，3.5秒不可见期间 x3.841→11.124、三心→一心。恢复也不自动暂停。记录 `/tmp/rescue-evidence/playtest/context-probe.json`；运行时异常为空。

线上两项新回归均按预期失败：GPU丢失后 phase为playing而非paused；实际双人C入口存档48花/9星、[3,0]生命，随后真实按键闯过C，奖励花加命使页面变成complete而非bonus。初次诊断使用49花，在C内先转换出第10星，没有触发奖励房边界；调整为48花后正确复现，不把初次未触发写成失败。日志 `/tmp/rescue-playtest-browser-red.log`。

修复最小范围为当前奖励房安全检查点及绘图丢失暂停/恢复渲染；资源版本升级 `20261003rescue2`。受影响单元90/90及完整带战斗11区回归1/1通过，合计91项。真实页面的键盘双人、六视口触控、GPU丢失恢复和实际C奖励复活四项通过。生命周期检查初次因 Chrome 导航期间 Runtime.evaluate 报“Inspected target navigated or closed”失败，等待函数仅重试导航/上下文替换瞬态错误，单独重跑冻结与 BFCache 原生返回1/1通过；没有修改游戏逻辑来处理该测试脚本竞争。日志 `/tmp/rescue-playtest-unit-green.log`、`/tmp/rescue-playtest-occupied-green.log`、`/tmp/rescue-playtest-browser-green.log`、`/tmp/rescue-playtest-navigation-green.log`。

原始 esbuild 独立重建与提交 bundle 逐字节相同，SHA-256 `ba14929a3d257789be7784bb21998a084eb87317fc2779f881f7d31dd5faac8b`；`git diff --check` 通过。此处是发布前检查；最终发布核验见下文。

独立复核发现一项 Important：GPU 丢失期间 frozen/active 返回后点 Resume，600ms 内模拟时间0.083→0.675、x2.881→7.141且音频恢复；证据 `/tmp/rescue-playtest-independent-gpu-race-review.json`。根代理补充 Resume、Esc、真实页面冻结/返回与按住D的回归，当前初修版本按预期1/1失败（`/tmp/rescue-playtest-gpu-race-red.log`）；以统一 activate 的暂停 guard 及 restartLoop 的真实 contextLost guard 修正，避免新区域开始和生命周期绕过。原生键盘双人、冻结/BFCache及加强GPU三项3/3通过（`/tmp/rescue-playtest-gpu-race-green.log`）。独立复审该 Important 为 ADDRESSED，无新增 Critical/Important/Minor；最终原始 esbuild 字节匹配已核对。公网发布核验已完成，见下文。


### 试玩修复的公网验收

- 修复 [PR #37](https://github.com/rarest/kids-games/pull/37) 于 `2026-10-03T02:42:07Z` 合并，main `c7673ebb9314f1fb5b2f923d49f368be6cb9a173`。沿用既有 webhook，无手工替换生产文件。
- 实际服务器 `/home/ubuntu/games-site` HEAD 与合并提交一致；仓库和 docroot bundle SHA 均为 `ba14929a3d257789be7784bb21998a084eb87317fc2779f881f7d31dd5faac8b`；用户层 `games-webhook.service` 与 `shooter-coop.service` 均 active。
- 两个公网域名各6资源全部 HTTP200且与当前源码字节一致，记录 `/tmp/rescue-playtest-public-hashes.log`、`/tmp/rescue-evidence/public-resource-hashes.json`。页面资源版本 `20261003rescue2`。
- 主域名 `GAMES_TEST_ORIGIN=https://games.nblord.com node --test --test-concurrency=1 --test-name-pattern='native GPU|native bonus teammate' tests/rescue-browser.mjs` 原生两项2/2通过，日志 `/tmp/rescue-playtest-public-main.log`。真实 GPU 丢失期间 Resume/Esc/冻结返回均保持暂停，渲染恢复后需玩家继续且不重放旧移动。合法双人入口48花/9星/[3,0]生命，经实际按键闯C、奖励花转第10星，队友在当前房间地板复活，奖励阶段保留并能继续收花至正常出口。实际恢复与奖励复活截图 `/tmp/rescue-evidence/ui/playtest-context-restored.png`、`/tmp/rescue-evidence/ui/playtest-bonus-revived.png`，根代理已查看。
- 备用域名 `GAMES_TEST_ORIGIN=https://games.596996.xyz RESCUE_EVIDENCE_DIR=/tmp/rescue-evidence/playtest/public-secondary node --test tests/rescue-integration-browser.mjs` 2/2通过，日志 `/tmp/rescue-playtest-public-secondary.log`。真实游戏厅搜索/点击、举箱/扔出、入口保存与刷新继续、回到12游戏厅；实际占满J的完整物理输入结局交给生产DOM呈现器验证。本次没有将后者称作原生键盘闯完J。
- 两域名原生检查异常列表为空。本轮没有实物手柄连接；未声称验证硬件。没有重跑未受影响的其他游戏全套门禁。

## 用户反馈的箱子怪辨识度（2026-10-03）

用户反馈“开始就有个箱子会吃人，没看出是怪”。现有12类敌人中的 mimic 使用普通木箱加脸；真实摄像机方向射线表明眼睛中心前方先命中 wooden-box/diagonal-brace。旧伪装状态还隐藏眼睛，攻击嘴高0.13、没有开合，正常视角不容易认出。

局部修复：独立箱体与后侧铰接箱盖，大眼前移到木板前；等待时保留警觉眼神，lunge 时箱盖咬合、张嘴露出上下牙和舌头。普通可举箱子沿用原模型。未改 core、伤害、追击距离、关卡布局或存档。资源版本 `20261003rescue3`。

验证：
- 新增实际摄像机方向射线（含双向朝向、等待/攻击状态）及开嘴/活动牙齿的真实几何回归，两项修复前按预期2/2失败（`/tmp/rescue-mimic-render-red.log`），完整渲染套件21/21通过（`/tmp/rescue-mimic-render-green.log`）。
- 真实模型 WebGL 对比 `/tmp/rescue-mimic-preview/after.png`，由源码构造普通箱、警觉箱子怪和攻击箱子怪；这是临时美术预览，不是新增生产界面，根代理已查看。
- 开场正常键盘从起点举箱扔向机器狗、跳过台阶和缺口，到 x49.104 正常触发街区 mimic lunge，无运行时异常。日志 `/tmp/rescue-mimic-native-local-green.log`、截图及状态 `/tmp/rescue-evidence/mimic/local/`，根代理已查看。暂停截图仅暂时隐藏 DOM 暂停遮罩以观察实际渲染帧；没有改游戏状态、位置或生命。初次临时驱动未跳第一台阶，在 x11.124 停住而超时；补上正常跳跃后通过，没有把该驱动问题称为游戏缺陷。
- 原生键盘、暂停、双人协作专项1/1通过（`/tmp/rescue-mimic-native-regression.log`）。未重跑不受影响的物理战役或其他游戏整套检查。
- 原始 esbuild 独立重建与 bundle 逐字节相同，SHA-256 `40d40eaeb6c21578872505f4c220812a68fb55d7c81ded0774ab091858425e75`。`git diff --check`通过。此处是发布前检查，独立复核和公网验收见下文。


### 箱子怪修复发布与实际遇敌

- 独立复核无 Critical/Important/Minor；已核对木板前的眼睛、后铰链咬合和共享池生命周期，没有扩展到其他敌人或玩法。
- [PR #39](https://github.com/rarest/kids-games/pull/39) 于 `2026-10-03T03:00:02Z` 合并，main `a389197024f4dd7079f8fd7ea8b4e57884283cf6`，原 webhook 正常部署。服务器仓库 HEAD 一致，docroot bundle SHA `40d40eaeb6c21578872505f4c220812a68fb55d7c81ded0774ab091858425e75`；两项用户层服务仍 active。
- 两域名各6资源 HTTP200、与本地逐字节一致，日志 `/tmp/rescue-mimic-public-hashes.log`，记录 `/tmp/rescue-evidence/mimic/public-resource-hashes.json`；页面资源版本 `20261003rescue3`。
- 主站原生按键从起点正常举箱/投掷和跳跃，在 x49.164 触发箱子怪实际 lunge，怪位置x52.900，未损失生命，异常列表为空。日志 `/tmp/rescue-mimic-native-public.log`、状态和截图 `/tmp/rescue-evidence/mimic/public/`。根代理已查看原生接近与攻击截图，等待露眼、攻击张嘴露牙均可见；仅暂停截图遮罩临时隐藏，不改运行中游戏状态。


## 两设备联网验收（online2 已发布，软件渲染压力复核仍有未通过项）

房间 UI、两端独立原生键盘/触控、托举物体和队友、投掷、暂停/重连、GPU/页面生命周期与本机存档隔离已有专项通过记录。app 的可信右键被阻止，双击后 visualViewport.scale 保持不变。新增服务仅监听 `127.0.0.1:8788`，原射击服务保持 `8787`；首次版本已由控制器沿原 webhook 发布 PR41（`20261003rescue-online1`）；下述为发布前验收记录，最终小修复状态见本节末。

Task 4 在默认真实街区使用两台独立 320×568 Chromium、默认 auto 画质自然暖机（早期版本最低 DPR0.75，最终版本最低 DPR0.5），完整 Three.js/SwiftShader 绘制，relay 每方向100ms加±10ms有序抖动。可信 keydown 的 event.timeStamp、监听器收到及实际场景绘制后坐标变动均采用浏览器 performance 时钟，另记 CDP往返。原始版本开局约358ms触发350ms保护；一次显式手动恢复也再次暂停。新增每个有效 playing epoch 正常中性首包后，客户端/服务21项和附加准备状态、bonus、terminal、发送失败矩阵通过，预期旧输入不再产生技术提示，但软件绘制仍约100ms/帧，原生开局仍失败。该版本手动恢复后首样本120.10ms（其中输入排队113.80ms），未达到<100ms。

临时副本仅关闭 MSAA 的单变量完整场景试验，实际 antialias=false/SAMPLES=0，首样本55.90/45.20ms，当时帧60.4/64.44ms、drawCalls152/triangles72940；约20.39秒又发生输入超时暂停，未完成连续一分钟。这个单变量副本不记为性能通过。之后经授权保留完整场景，仅关闭 MSAA 并降低 auto DPR 下限至0.5；精细与流畅档原分辨率和阴影规则不变。低分辨率细节变软，已查看完整街景截图确认角色、箱子仍可辨认。

部署隔离检查2/2通过：真实临时git仓库运行原脚本，副作用工具路径在执行前逐个确认属于可执行 shim。正常文档、浏览器资源和dev依赖更新保留双服务；仅对应runtime/unit或生产依赖变化触发必要动作。失败注入先检出“runtime重启成功、proxy重载失败后重跑又重启”的RED，再使用 `.git/games-deploy` 内按成功阶段更新的指纹和pending标记达到GREEN；包括pull后rsync失败恢复、reload失败只重试proxy、npm失败不被已移动HEAD掩盖。没有生产SSH或服务部署操作。

最终正式 bundle 的 `task-4-green-native-final.log`：两台320×568独立 Chromium、真实 SwiftShader，双向100ms加有序±10ms；两端实际autoDPR0.5、antialias=false/SAMPLES=0，完整默认街区152drawCalls/72940triangles。可信事件到实际绘制首样本41.60/38.90ms，其中监听器到绘制6.30/4.70ms；CDP往返176.60/204.61ms另计。额外自然适配耗时主机48.90ms、客机4984.12ms，客机从0.75适配到0.5，未强制质量值。连续61.497秒、36次原生输入、3693server ticks、每端1231动态帧/29.249KiB/s，无暂停或静态场景重发。两端实际绘制1492/1471帧（24.26/23.92fps）；playing RAF p95均50.1ms，最大116.7/116.6ms，主运行epoch最大input转发间隔114.87/108.61ms。分钟后的原生长按跳跃和队友投掷各产生一次权威事件，暂停、手动恢复、原席重连通过，技术notice为空。这里记录软件绘制实测，不将其称为实体手机或手柄测试。

同样前置准备与测量顺序的真实负对照 `task-4-red-unpredicted-metric.log`，临时副本仅取消本地预测并重新构建，首响应351.70/395.80ms，明确在<100ms响应断言失败。早先负对照的startup360ms暂停、以及350.10/466.30ms读数后连续性失败均保留，未冒充响应断言RED。原始性能失败、实验、最终结果与未发布事项见本地 Task4报告；公网两域名的资源、服务与真实双人操作由控制器审查后继续执行。

最终受影响检查：全部救援单位与射击联网检查136/136通过；两行scene改动后绘制单位22/22通过；原生GPU丢失/恢复、页面冻结/BFCache/重连与窗口buffer尺寸检查2/2通过。最终独立esbuild与已提交候选bundle逐字节一致，SHA256 `d314bc0bf46af64be47ed167e42cd71fdb143c567fc2d1ac5134f69474034ba5`，diff及shell/新测试语法检查通过。


### 联网发布前审查与交付门槛

Task1/2/3/4分别通过规格和代码审查；Task3复审确认内部拥堵后的准备恢复和离房状态清理已处理。Task4审查及整分支终审（abb63cb..a45e0c0）均为Critical0/Important0/Minor0，可合并。Task1单独codec bonus引用断言的可选细化，由已有真实客户端bonus及预测身份回归覆盖；Task3迟到旧epoch提示已由服务端仅静默丢弃正安全整数旧版本输入处理。

根代理独立重建bundle逐字节一致，最终SHA-256 `d314bc0bf46af64be47ed167e42cd71fdb143c567fc2d1ac5134f69474034ba5`。正式原生响应41.60/38.90ms、61.497墙钟秒、3693ticks、每端29.249KiB/s及取消预测351.70/395.80ms的同指标RED均核对原始日志；136项相关单位检查之后仅两行scene改动，受影响render22项和GPU/resize2项再次通过。实际条件为320×568双Chromium/SwiftShader、自动DPR0.5、200msRTT及有序抖动；约24fps及画面细节变软是该软件渲染样本的实际代价，手动high/low分辨率阴影规则保留。

首次部署沿原webhook，在合并前将完全一致的已审查新deploy脚本放回原路径并保留模式775，防止旧Bash缓冲的无条件重启影响射击房间。部署后仍需实际生产HEAD、服务、双域资产和公网同源双设备检查；此处记录的是已完成发布前门槛。额外完整街区按键路线驱动已到达实验室后耗尽生命，随后对齐路线的另一尝试在前段触发一次输入超时暂停，原因正在核对；两者均未冒充完整通关或连续性通过。


### 公网无效入房退出后的 auto 适配修复（2026-10-03）

已发布 PR41 的备用站原生 canonical 检查在无效入房→退出→开局后停在 tick21/epoch3，证据 `/tmp/rescue-evidence/public-secondary-native.log`。源码质量控制器每次恢复同一 auto 选项都把实测低 DPR 和关闭阴影重置。最终局部修复只让已处于 auto 时再次设置 auto 提前返回，保留当前 DPR、阴影和观测窗口；切换档位、精细/流畅档、350ms 保护和场景规则不改。canonical 导航/重连三个等待条件仅增加 nullable JSON 诊断保护，实际 `null` 时继续等，不吞无效 JSON 和游戏异常。

新增实际控制器回归先 RED（0.5→1.6/阴影 false→true），再 render23/23 GREEN；涵盖观测窗口、快速 auto 初始画质及 high/low→auto 重置规则。日志 `/tmp/rescue-final-quality-red.log`、`/tmp/rescue-final-render-green.log`。正式 esbuild 和独立重建逐字节一致；新 bundle SHA256 `a1544fec8965d46a56252557a0c87ca38e18768574bdeeaa7c6039a0dcb33de4`。缓存版本在游戏厅脚本、目录救援链接、页面 CSS/bundle 统一为 `20261003rescue-online2`。

一次临时 canonical 首项副本使用改后本地实际页面、真实 WebSocket 服务与200ms RTT、每方向±10ms有序抖动；保留共享工具默认 auto/320×568，没有强制 DPR、场景状态或开局自动恢复。无效入房退出前后客机 DPR0.75、阴影 false，首个实际移动事件到绘制9.4/35.6ms；开局无 stale 暂停。原 canonical 禁用方向键、各端1P键、队友/箱子托举投掷、触控、刷新原席和手动继续均走到。最后显式离房主机回 home，客机仍暂停并显示主机断开，整项1/1失败；未把该延迟转发器尾部失败改称完整通过，未扩大服务或转发器修复。日志 `/tmp/rescue-final-native-canonical.log`、临时驱动 `/tmp/rescue-final-native-canonical.mjs`。最终修复尚未发布，公网最终回读由控制器执行。

受目录链接缓存版本影响的原生游戏厅专项1/1通过：搜索点击新链接、举箱投掷、保存入口、刷新继续和回到12游戏厅。日志 `/tmp/rescue-final-hall.log`。三个 canonical 原表达式验证 JSON null→false、真实已连接席位→true、损坏 JSON 仍抛异常，未放宽 gameplay 判断。最终差异/语法检查通过。


### 同轮授权的延迟测试转发器关闭顺序修复

最小实际原生 leave→graceful close RED 明确记录：relay 收到 leave25169.109ms，未记录 forwardedAt；downstream close25173.802ms时 upstream 已 CLOSING，upstream close25175.208ms。100ms入站延迟中的 leave 尚未转发，客机只收到主机断开并暂停；这是测试转发器关闭顺序缺陷。证据 `/tmp/rescue-final-relay-close-red.log`、对应 JSON。

仅 `tests/rescue-online-harness.mjs` 调整正常关闭经同一入站有序队列排在已收到消息之后；异常1006或已 closing/closed仍立即关闭。peer 保留在清理集合直到 upstream 实际 close；结束清理先取消队列定时器，再终止仍被跟踪的两端连接。安全 trace只增加 close方向/时间/code，不输出joined重连凭据。生产 client/server、350ms保护、bundle和绘图规则均不再改动。

唯一 corrected canonical200ms RTT完整原生流程的原断言全部执行通过：无效入房退出保持 DPR0.75/阴影关闭，首次移动19.7/32.3ms，无开局 stale；禁用方向键、各端1P、托举物体/队友与投掷、触控、暂停/手动继续、刷新原席、本机保存字节/选项、会话清除、双方退出 home及两端 errors[]通过。但末尾附加 close诊断误取了刷新前旧槽0连接关闭时间35129.662/35243.710ms，最终leave实际属于新槽0连接50081.246→forward50192.221ms，故整项记录仍1/1FAIL，不能称整体GREEN。完整安全room/input/frame trace保留 `/tmp/rescue-final-native-canonical-green.log`，执行驱动同名`.mjs`；按具体peer修正的诊断另存 `/tmp/rescue-final-native-canonical-diagnostics-fixed.mjs`，未重复整套运行。

追加最小实际原生关闭顺序检查GREEN：leave26800.379→downstreamclose26804.676（upstream仍OPEN）→forward26894.681→upstreamclose26899.953ms，客机回home/networknull；退出码0。证据 `/tmp/rescue-final-relay-close-green.log`、对应 JSON。测试工具语法及diff检查通过；没有重复136单位或连续分钟套件。最终正式无附加诊断的公网canonical仍由控制器发布后执行。


### 首次联网公网回读与真实操作

PR41 于2026-10-03T11:56:25Z合并，main `9889bdd808c752c73123dbecee650065d3a23309`；原 webhook 在19:56:29部署成功。生产仓库和docroot bundle SHA均为`d314bc0bf46af64be47ed167e42cd71fdb143c567fc2d1ac5134f69474034ba5`。救援服务PID147055、原射击PID143350、webhook PID1044正常；原射击PID未变化。新代理内容逐字节一致，两域名6项资源共12次HTTP200且SHA匹配；server入口和审查/git目录不在docroot，公网被403禁止访问。

主站两个独立320×568 Chromium通过原生同源WSS创建/加入/房主开始、两端各自键盘、队友和真实箱子举起投掷、客机触控、刷新回原席准备后房主手动继续、暂停退出双方回首页，7项实际流程全部通过，异常列表为空；`/tmp/rescue-evidence/public-online.json`结束于2026-10-03T12:03:38.478Z。第一次null诊断等待、第二次点击隐藏退出按钮是私有驱动错误，失败记录分别保留；不列为产品修复。主站原生双击scale不变、可信右键菜单阻止、320宽有无存档按钮可点击专项1/1通过7.617秒。首次持续真实匿名射击WS会话在合并前加入，收到帧和pong并跨部署无异常断开，记录已另存shooter-preservation-pr41.json。

完整街区通关至下一站的额外原生路线尚未通过：实际到实验室后正常耗尽生命；另一前段路线出现输入超时暂停；第三次进程被SIGTERM，未产出有效结果。上述不记为完整公网通关；联网campaign/八Boss/奖励房/下一站由真实服务和core专项覆盖，默认街区严格200msRTT连续61.497秒性能证据保持单独记录。

### 关键实施裁决归档

这些裁决保留原顺序，避免结束会话后只剩结论。相关代价：身份复用若错误会重复或漏播音效/粒子；实际绘制准备门槛若失效会在刚开始时暂停；auto低DPR令慢设备画面更软；部署脚本首次替换若错误可能影响已有房间。明确质量档位规则、350ms超时与场景几何/材质保留。

Task 2: Ruling: same-run visual render state must also retain identity across pause/epoch/clear/reconnect and use authoritative events. scene.js receives visual state and its event dedup also keys on identity; authority-only identity stability cannot protect scene particles. Genuine run/room changes replace visual identity. Existing clear still stops prediction. Cover identity/authoritative-event regression inTask2, carry toTask3 andfinal review.

Task3 buffertrace confirms8writes/start perclient (196→338 thensame338), setterdirect0–1.4ms; packet→firstinput14.6/16.6ms onthat trace. Native resizeGREEN andrender21GREEN afterminimalguard, butnativefunctional stillstale anddefaultautoexistingDPR0.75/shadowsfalse stillstartupstale. No claimedcausalperformancefix. Ruling:correctreadiness order, initiallobby preparesfinalgamecanvas/layout/level andactualdraw before ready; GPU/freeze/BFCache recoveryactualdraw before ready, manualresumeunchanged. Stopusingready beforelevel/layout/draw. Dedup/cancelreadywork on suspension/leave/generation andavoid20Hzreset. Same350ms/actualscene/no forcedstates. Existinggame.js scopecovers; nativefailureisRED, verifyGREENthenaffectedoldchecks.

Deployment ruling: first-pull Bash may buffer the old deploy body including unconditional shooter restart. To preserve live unchanged shooter rooms, root stages exact reviewed new deploy script at existing production path just before main merge; same webhook/chain runs conditional logic. Verify staged SHA/mode, original service PID before/after, publicHEAD/proxy; fallback rerun only same checked-in script if needed. No parallel deploy or unreviewed source.

Task 1: Ruling: refine packet with room.run and stable same-run decoded authority identity — existing audio/scene use object identity to reset event dedup, so fresh state per20Hz frame would repeat sounds/particles. True start/retry/next increments run; pause/bonus/reconnect does not. Cost if wrong: audio/particle events could be suppressed or replayed at transition; add identity/real-event regression. Spec and Task1 brief updated before downstream implementation.

Task4 ruling after resume: authorize one measured temporary full-scene experiment combining the evidenced MSAA-off option with the existing auto-quality DPR floor lowered from0.75 to0.5. Preserve high/low modes, geometry, materials, native input, normal rendering,350ms stale and continuous real-wall gate. Capture playing-only RAF/input timing and unobscured scene screenshots. If strict first-event responses and continuous minute pass, worker may apply exactly these two production quality changes with render-quality regression, affected GPU/resize checks and a valid unpredicted RED. No test-only GPU vendor branch, forced quality, background flags or timeout changes. Cost: auto mode can trade edge smoothness/resolution for responsive control on measured slow devices; retain explicit high-quality mode. Prior no-MSAA20.39s failure is retained; paused overlay frame metrics are not causal evidence.

Final combinedfix ruling fromactualpublicpost-reviewevidence: equal-auto restore must preserve actualadaptiveDPR/shadows/window. CanonicalsecondaryREDinitialstale tick21 afterinvalidjoin→leave(home scene.setQuality resets unchangedauto to1/shadowstrue), whileprimaryprivateactualpublicflow7checks GREEN. Source q.set unconditionally resets sameauto; userresponsivegoal supportsidempotentobservedauto. Explicitmodechangesunchanged; costsameauto clickno longerforceshigher resolution, high→auto stillresets. Alsofixcanonicalnonnull diagnosticwait guard consistentwithrootactualreloadnull driverfailure. ExactlyONEfinalfixworker+scopedreview, no blindCSS/timeout/devicechanges. Publictouch1/1GREEN7.617s main. SourcePR41alreadylive9889bdd; rootbranchdocs/rescue-online-public-verification fromactualmain readyfinalfix, no codechanges byroot.


### 最终局部复审与失败诊断裁决

最终代码范围9889bdd..7adfa09经唯一局部复审：相同auto保留、三处nullable等待、测试relay有序正常关闭及online2缓存一致四项均ADDRESSED，新Critical/Important/Minor均为0。根独立构建与bundle逐字节一致，SHA `a1544fec8965d46a56252557a0c87ca38e18768574bdeeaa7c6039a0dcb33de4`。

修正relay后的唯一200msRTT canonical全部原行为和存档断言通过，首响应19.7/32.3ms，双方退出回home；其新增关闭时间诊断误取刷新前旧slot0连接，使整体1/1 FAIL，原始日志保留。最小同peer真实关闭专项GREEN明确收到26800.379→转发26894.681→关闭26899.953，客机home/null。裁决：不将附加诊断失败冒充整套GREEN，也不据此扩大生产网络修复或重复完整大套件；最终公网运行正式未附加诊断的canonical继续完成交付。该裁决若错误，影响退出顺序验证，因此同时保留最小顺序实证与后续公网双方退出检查。


### online2 原部署链交付回执（2026-10-03）

PR42 于2026-10-03T12:39:07Z合并，main `7a459a25813616a19fc1d012ab9e58fea38e3efd`；原webhook在20:39:10完成发布。服务器仓库和docroot bundle SHA均为`a1544fec8965d46a56252557a0c87ca38e18768574bdeeaa7c6039a0dcb33de4`。救援PID147055、射击PID143350、webhook PID1044均active且没有变化。12项双域公网资源HTTP200且SHA匹配，日志 `/tmp/rescue-evidence/online2-public-hashes.log`。

主站正式未附加诊断 canonical2/2通过：联网原生各端键盘和禁用方向键、队友/箱子举起投掷、390×844客机触控、暂停/手动继续、重试、房主刷新原席恢复、双方退出home、本机存档字节和选项、session令牌清理和异常列表，以及双击scale、可信右键拦截、320宽有无存档按钮检查。联网49.264秒，触控7.197秒，合计56.642秒；日志 `/tmp/rescue-evidence/online2-public-main.log`。

备用域名正式canonical完成入房、独立控制、举箱投掷和390×844触控，房主刷新原席后手动继续又在epoch9/tick257暂停，等待客机playing失败；整体1/1FAIL61.491秒，不能写成双域整套通过。两端仍连接/ready，客机autoDPR0.5/frame45.7ms；缺少当时输入间隔实证，未确定具体阻塞来源。日志 `/tmp/rescue-evidence/online2-public-secondary.log`。随后私有诊断驱动被中断，Node报pending promise/event loop resolved，无有效finally JSON，不能记作通过或故障原因。额外320×568私有备用站流程完成入房和独立按键后，实际重试在tick21进入输入保护暂停；两端DPR0.5，诊断frame86.6/91.6ms，RTT148.5/297.3ms；整体失败，日志 `/tmp/rescue-evidence/online2-secondary-narrow.log`，JSON `/tmp/rescue-evidence/public-online-failure.json`。已保留这些未通过的软件渲染压力结果，不扩大超时，也不把新运行冒充连续性GREEN。

独立Node真实公网WS ping各8次：主站均值133.908ms/范围133.499–135.333ms；备用站均值133.256ms/范围132.898–134.285ms。记录 `/tmp/rescue-evidence/public-ws-rtt.json`，为当前测试机器到服务的往返，不是用户两台设备互连延迟；浏览器RTT包含其调度延迟，不能据上述失败断定备用域名网络更差。生产CPU负载0.05/0.03/0.00、服务进程正常；本地cgroup未记录OOM。软件渲染慢帧与恢复/重试保护暂停仍保留为后续明确性能调查项，原200msRTT完整街区61.497秒通过样本也保持其原条件，不扩大为所有设备保证。

发布前加入的匿名真实救援及射击WS会话连续接收状态和pong，跨PR42部署未断开；记录 `/tmp/rescue-evidence/rescue-preservation.json`、`/tmp/rescue-evidence/shooter-preservation.json`。最终文档归档之后只关闭这两个测试会话，不影响真实玩家房间。

### 全模型检查与敌人朝向修复（2026-10-03）

用户飞鸟截图对应线上 online2；当前公网 bundle SHA 与本地一致。用实际 Three 工厂在隔离 Chromium 生成模型预览：2 个主角、12 种敌人、8 种 Boss、5 种可搬物体、4 种拾取物、10 种攻击物及54种装饰；没有缺失几何、非有限顶点/变换或浏览器异常。紫色飞鸟两只眼睛可见，新增真实相机射线检查覆盖鸟/鹈鹕双眼、两个朝向及两组扑翼时间。

发现巡逻朝向只改变小幅 yaw，鸟嘴、狗嘴等偏向正 X 的部件在敌人向左时仍朝右。新增真实部件世界位置回归首先失败于狗嘴朝左，随后仅在敌人 update 中按 facing 镜像 X 缩放；不改变模拟或服务器。狗、鸟、鹈鹕、毛虫、鼠、袋鼠、犀牛、蜥蜴的左右折返检查通过。模型25项与 core/levels 合计82项通过；真实浏览器首页、移动、举箱、躲藏、跳跃投掷、暂停及本机双人操作1项通过（18.81秒）。补充实际渲染的左右朝向及箱子怪张嘴状态图也已人工核对。证据 `/tmp/rescue-model-audit/`；图片为工厂模型预览，未冒充11关原生通关。

发布缓存更新为 `20261003rescue-model1`。发布前救援/射击/webhook PID 为147055/143350/1044；线上发布与原生公网核验待此次 PR 合并后记录。架构范围明确为每房间两席、多双人房间并行，保留现有16房间上限，不将配置上限当作负载验证结果。

第一关实际配置是街区→右侧杆攀登→屋顶向西→左侧杆攀登→上方电线向东→实验室机器人。机器人仅被 ball 命中真实头顶弱点时扣血，共5次；击败后靠近最右出口进入奖励房。该关只有 electric 周期陷阱（3秒周期、通电0.8秒）；spike 固定尖刺位于G关，伤害为扣1心及1.5秒受伤保护。用户所指白色尖刺位置仍待辨认，不擅自断言其是第一关电流。

补充检查：11关各自实际 createWorld 更新后遍历了519/517/334/382/426/319/444/361/376/407/523个 mesh，变换均有限；7种平台和5种机关共12类实际 WebGL 预览无异常。独立审查结论可合并，Critical/Important/Minor均无；审查者另跑25项模型测试通过，并在内存重建后确认 bundle 逐字节一致、各入口缓存一致。


### model1 发布回读与眼睛贴合补查

PR44 已于2026-10-03T13:21:35Z合并，main `9388205eea4c9dd6456cde9d5ce2e01fe48470e7`，原 webhook 在21:21:38发布。docroot/公网上 bundle SHA 为`be4831d1887f3fb2a47b5b56832b9c49eb62a463a92f1b715549310ac2292bb8`，两域12项资源逐字节一致；主站原生浏览器操作1/1通过16.09秒。救援/射击/webhook PID仍为147055/143350/1044。

用户进一步指出飞鸟眼睛不协调。初次检查确认了可见性，却未检查眼睛相对头部中心和表面的贴合，不能据初次可见性结论认定造型正常。实际 head 中心x=.12，原眼睛绕身体x=0排列，左眼射线甚至落在头部轮廓之外。新增头部中心回归与表面贴合回归分别先失败；将鸟/鹈鹕眼睛放到共享 face joint，x=.12、z=-.024，眼距.08、y=.845、尺寸.115，使两眼围绕头部排列并贴合曲面，瞳孔与眼白相交。保留原移动、碰撞和服务器。27项模型检查及 core/levels合计84项通过，真实WebGL左右朝向预览无异常（`/tmp/rescue-model-audit/eyes.png`）。缓存版本更新为`20261003rescue-model2`，独立复核及线上回读待此次修正发布后记录。


## 联网投掷、碰撞与走跳重影（online3，发布前）

用户确认箱子飞出后回头顶又飞一次、砸怪物画面碰撞不对，移动时重影但停止清楚。本轮原生 WSS 检查确认 Cloudflare → 服务器代理 → 独立救援服务，两席仍各自连接权威服务器；200ms 转发只在私有测试存在。

用真实 core/codec/client 及两台独立 Chromium 原生 E 键实际绘图复现：服务器两端只有一次 throw，但飞行箱子确认后向后跳1.65世界单位（`/tmp/rescue-online-collision/native-red.log`、`native-collision-red.json`）。原预测器收到确认即清空局部 affected 集合，已确认的投掷物换回100ms历史插值；本地人物/物体预测与怪物/平台历史画面混用时间。走跳姿态又读取权威快照 time，位置连续前进而动画时钟间歇推进。

客户端改为所有碰撞实体共用已有全世界 replay，动画也用 replay.time。预测仅改变画面：玩家命/心、分数、事件、Boss 血量/胜负/无敌与区域结算仍保留 authority。载人/载箱依附显示坐标；移动平台上的人物不额外套位置缓动，避免脚底偏离同时间平台。服务器、core、协议、350ms保护和画质选择没有改动。HUD 新增12px独立 RTT；旧 socket 关闭时清空旧 RTT 和 ping。

TDD 回归投掷确认、命中消耗、移动平台、动画时钟和重连 RTT 均保留 RED。网络25/25、房间服务器15/15、core/完整战斗战役/输入/模型/关卡/帧步97/97通过。原生实际绘图投掷与砸怪专项1/1通过23.02秒：两个可信 E 键分别拾起和投掷，两端仅一次权威 throw，飞行回退最大0；画面实际移除命中后的箱子，两端12px RTT 与真 WS 测量相符（截图 `collision-and-latency-host.png` / `guest.png`）。证据均在 `/tmp/rescue-online-collision/`。

资源缓存统一为 `20261003rescue-online3`。独立审查、默认完整街区持续联网检查和线上发布回读正在执行；未提前记为完成。


独立只读复核未发现 Critical/Important/Minor。复核者另外运行预测/客户端21/21，并内存重建确认 bundle 字节一致。默认完整首关、默认 auto、两台软件渲染 Chromium + 200ms RTT 有序抖动专项1/1通过98.01秒：两端首次可信按键到实际绘图7.4/11.3ms；持续60.007秒35轮真实按键，权威模拟3603 tick、1201快照/端，没有暂停，约29.18KiB/s/端；随后真实暂停/重试、长按跳跃与托举投掷单事件、断线原席重连及等待手动继续均通过。软件渲染该分钟平均22.83/23.65 FPS，因此不将低操作响应等同于60 FPS。日志 `performance.log`，截图/诊断 `performance/`。原来备用域名的额外软件压力失败记录保留，不能仅凭本次私有默认关卡通过删除。


六项既有在线原生检查首轮5/6通过：唯一失败是先移动至x>4.2再举箱。实际首箱x=5.762、core拾取要求距离<1.5，因此旧驱动允许在距离1.562仍不可拾取的位置停住。增加只读人物/物体/输入间隔诊断，单独流程复核1/1通过并保留日志 `canonical-diagnostic.log`；该轮移动终点随软件渲染/驱动耗时漂移，明确固定x门槛不代表进入拾取范围。最终驱动改为根据真实箱体x走至距箱1单位、原生松键等待实际vx=0，并新增“真实存在可拾取箱体”断言，再按原生E键；没有改拾取范围、core、超时或绕过暂停保护。原失败日志 `lifecycle.log` 保留，其余触控、冻结/GPU/BFCache/重连、绘图buffer、临时选项和拥堵保护5项实际通过。

额外 OpenSpec 严格校验命令返回失败：此已交付目录当前仅历史 tasks/verification，无 specs delta；这是目录状态，不修改成虚假校验通过。原部署测试2/2及git diff --check通过。

修正拾取测试门槛后，完整原生双人流程1/1通过45.86秒（`canonical-range.log`），native create/join/start、各端控制、搬队友/箱子、投掷、390×844触控、刷新原席重连和手动继续、退出及存档隔离完整检查成立；配合首轮其余五项通过，六类生命周期检查均有实际通过结果。


## online4 公共场景同步（2026-10-04，发布前）

online3全世界replay仍依赖各端pending：同快照、同时刻但12/4条待确认指令，使怪物/平台相差约0.267世界单位；真实WS100/300ms RTT、60/20Hz输入，最大公共时间差150ms、怪物0.300单位。预测throw还提前删除怪物/箱子、预测远端跌落能改变位置而保留旧生命数。RED证据 `/tmp/rescue-world-sync/`。

online4增加可选serverAt快照/pong，最小RTT中点估计服务时钟；公共几何以墙钟推演最多250ms，复用已有integrate和对象/敌人/Boss纯几何分支，禁止奖惩、生命周期、攻击生成/移除和通关。自己的运动及当前pickup/throw箱子单独预览；箱子按动作seq和服务器ownership确认，确认飞行接管公共时钟并做最多1秒纠偏。拒绝拾取后不能借旧owner保留overlay。预测健康变化禁止位置纠偏，Boss坐标从目标timer选择运动公式但公开phase/HP/攻击保持服务器确认。实际avatar关节读取独立renderTime，新增真实腿部旋转RED/GREEN。公共投影每快照只克隆一次，后续render增量推进，避免每RAF两次全量模拟。

首次154项Rescue单测全部通过，最终新增失败拾取回归以及同文件21项全部通过（覆盖合计155项）。原生200ms RTT实际投掷初轮通过20.15秒，两次可信E动作对应pickup/throw，双方各一次throw和hit，最大箱子回退0。最终实际异延迟WebGL81组同时绘制比较通过41.40秒：RTT120.8/326.3ms，最大公共时间差40.5ms、敌人mesh横坐标差0.081、移动平台0.052世界单位；两端原生暂停/退出正常。证据 `native-shared-final.log`、`native-shared-world.json`。此为实际绘图比较，不将模拟客户端约15ms误差当真实浏览器数据。

保留失败：首次low软件渲染300ms RTT在tick21输入超时；默认auto第二次场景比较通过但驱动未等待服务器paused便点击不可见leave，整项FAIL，现已增加实际paused等待后通过。多浏览器文件运行Node报告pending promise且取消，未当通过。随后完整街区分钟在tick605输入超时，实测两端约12FPS、发送间隔超过350ms；发现本任务取消后遗留Rescue浏览器36257的GPU约196%CPU。已核对页title/本任务cwd及旧parent退出，只经CDP关闭此孤儿，保留认证9225及其他任务English浏览器；原条件分钟重新运行中。未扩大350ms保护、改变画质档位、放宽超时或修改游戏地图。

独立复核最终通过；500ms RTT/30pending的metal落地仍可能发生约0.406单位终点位置纠偏（40pending约0.753），记录为高延迟预测修正，未宣称所有网络零位置校正。普通ack连续、失败pickup、预测伤害和Boss跨phase阻断均已确认修复。服务器目前rooms=0；本轮改动server/core/codec，需要原部署链更新Rescue运行时，射击/webhook预计保持原PID，发布后核对。


### online4 后续计算缩减与最终默认场景连续性

清除孤儿后，原条件第二轮仍在tick1126暂停：实际RAFs最长366.6ms、输入转发间隔362.2ms，保留`native-minute-clean.log`，不据第一次孤儿现象排除全部停顿。进一步用已有movePlayer/integrate抽出stepLocal，仅预测本机slot与实际action涉及的箱子，不再为每条pending推进整关敌人/Boss/其它物体；不预测伤害、奖励、复活或通关。关联id只存在client clone，部分ack继续关联已投掷物。此变更有真实RED和84项相关GREEN。独立复核将旧HEAD/current默认stepGame在真实0/A/J各600tick逐帧deepEqual，完全一致；确认原服务器规则、边沿、搬投、被队友抱起和authority隔离未变。

默认完整街区、200ms RTT + 每方向10ms有序抖动，最终实际两软件WebGL窗口1/1通过104.14秒（`native-minute-local.log`）。可信按键到绘图78.4/39.0ms；连续60.080秒、35轮输入、3609 tick、1203动态快照/端，全程playing无暂停，29.81KiB/s/端；实际24.55/24.23FPS。之后真实暂停/重试、长按跳跃/托举投掷单事件、断线原席恢复并等待手动继续均通过。不能将软件绘图24FPS写成60FPS；350ms输入保护未修改。


### online4 最终开局、绘图与生命周期回归

异延迟实际WebGL最终一次曾在tick20暂停，慢端已有输入到relay但尚未转发给服务器（forwarded=0）；300ms RTT叠加浏览器调度使首包超过350ms。仅对当前epoch尚未接受有效输入的席位加入2秒首包等待上限；首个有效输入到达后立即恢复350ms期限。resetInputs中性化旧输入；无效、重复、旧epoch和ready消息不续期，断线/失焦仍暂停。准确RED后首包/活跃超时/重试3项通过，独立复核5项通过且无新阻断。

修复后最终实际两WebGL异延迟1/1通过33.680秒：94组近同时实际绘图，实测RTT128.7/474.2ms，公共时间最大差46.300ms、怪物mesh最大差0.0926004、移动平台0.0670167世界单位；原生移动、跳跃、暂停和双方退出正常。证据`native-shared-startup-final.log`和`native-shared-world.json`。实际RTT包含软件浏览器调度，不能用配置100/300ms替代实测值。

最终投掷/砸怪实际绘图1/1通过22.611秒（`native-collision-final.log`）：两次可信E键对应拾起/投掷，双方各一次throw和hit，最大向后回退0。既有生命周期首轮5/6通过，唯一完整流程在auto尚未完成适配时发生低帧输入保护；保留`native-lifecycle-final.log`。测试准备增加等待实际auto DPR<=0.5且关闭阴影，未强制画质/放宽超时或修改生产规则；完整原断言1/1通过52.568秒（`native-canonical-warm.log`），覆盖独立控制、搬人搬箱/投掷、触控、暂停重试、刷新原席恢复、双方退出和存档隔离。配合首轮其余5项，各6类均有通过证据，不写成同一次6/6。

最终全部Rescue单测157/157通过（39.034秒，`all-unit-release.log`）；独立重建bundle SHA `31bed220b05d1390664b2570eca3d4a4312abf6ce88bf8680675538e589cb21d`，git diff --check通过。
