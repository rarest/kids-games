# 皇冠迷宫录音来源

本目录的音效都来自真实物件、脚步或现场录音，而不是由程序合成。来源文件均在 Freesound 以 **Creative Commons 0（CC0）** 发布；CC0 允许复制、修改、传播及商用，无需另行许可。为方便复核，即使许可不要求署名，仍保留作者与原始页面。

所有成品均由对应页面的高品质公开预览转换：裁切独立动作、去除无关静音、转为单声道、响度规范化、末尾淡出，再分别编码为 WebM/Opus 与 MP3。不同事件没有复用同一份录音；同名 `.webm` 与 `.mp3` 只是同一真实录音的浏览器兼容版本。

| 游戏文件 | 原始录音与作者 | 原始页面 | 处理 |
|---|---|---|---|
| `footstep.webm` / `footstep.mp3` | “Footsteps_Carpet.wav” — mlsulli | https://freesound.org/people/mlsulli/sounds/234855/ | 截取一次柔和地毯脚步，0.24 秒 |
| `bump.webm` / `bump.mp3` | “Wall Bump 1.wav” — Osiruswaltz | https://freesound.org/people/Osiruswaltz/sounds/457741/ | 截取单次真实撞墙声，0.55 秒 |
| `coin.webm` / `coin.mp3` | “Coin Drop” — jon.k.clancy | https://freesound.org/people/jon.k.clancy/sounds/402935/ | 截取硬币落入玻璃零钱容器的清脆声，0.50 秒 |
| `key.webm` / `key.mp3` | “Keys Jingling” — vmgraw | https://freesound.org/people/vmgraw/sounds/235614/ | 截取实体钥匙串轻响，0.85 秒 |
| `door-locked.webm` / `door-locked.mp3` | “Door Lock On, Off” — microman502 | https://freesound.org/people/microman502/sounds/818290/ | 截取汽车机械门锁实录，0.62 秒 |
| `door-open.webm` / `door-open.mp3` | “Unlocking Door Lock” — qubodup | https://freesound.org/people/qubodup/sounds/160215/ | 截取开锁动作，0.68 秒 |
| `purchase.webm` / `purchase.mp3` | “Cash Register (imitation with toaster and bells)” — modusmogulus | https://freesound.org/people/modusmogulus/sounds/794903/ | 实录烤面包机和铃铛构成的收银声，1.30 秒 |
| `explosion.webm` / `explosion.mp3` | “Explosion large” — SamsterBirdies | https://freesound.org/people/SamsterBirdies/sounds/587886/ | 车库内鞭炮实录，经原作者降调叠层；裁切为 2.60 秒 |
| `hook.webm` / `hook.mp3` | “Throwing / Whip Effect” — denao270 | https://freesound.org/people/denao270/sounds/346373/ | 麦克风录制金属杆快速挥动声，0.25 秒 |

许可原文：https://creativecommons.org/publicdomain/zero/1.0/

## 原创背景音乐

`royal-garden.webm` 与 `royal-garden.m4a` 是为本游戏原创生成的同一首 72 秒皇家花园氛围循环曲，不采样或改编任何第三方音乐。可复现源文件为 `scripts/generate-royal-garden-bgm.mjs`；它合成具有 A/B/C 三段变化的钟琴旋律、柔和弦乐铺底、低音与轻柔长笛，并用循环余响保持首尾有声衔接。该音乐随本项目一同使用和分发。

重新生成命令：`node scripts/generate-royal-garden-bgm.mjs /tmp/royal-garden.wav`，随后分别运行 `ffmpeg -y -i /tmp/royal-garden.wav -c:a libopus -b:a 112k -vbr on -compression_level 10 maze/audio/royal-garden.webm` 与 `ffmpeg -y -i /tmp/royal-garden.wav -c:a aac -b:a 128k -movflags +faststart maze/audio/royal-garden.m4a`。
