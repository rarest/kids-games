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
