// Original generated picture-book scenes, mapped to the photographed textbook's units.
const descriptions=[
 '孩子们在大树下的校园互相问好',
 '孩子们观察金秋的银杏叶与枫叶',
 '孩子们读故事，沿足迹猜测接下来会发生什么',
 '松鼠、孔雀和刺猬在森林童话中相聚',
 '孩子们仔细观察翠鸟与蒲公英',
 '青山、江河、秋林与帆船组成山河美景',
 '孩子在森林中聆听鸟鸣与溪流',
 '孩子们互相帮助，捡起掉落的书本'
];
export function unitArt(id,{priority=false}={}){
 const match=/^u([1-8])$/.exec(String(id)),n=match?Number(match[1]):1;
 return `<img class="cn-art cn-illustration" src="${new URL(`illustrations/u${n}-v1.webp`,import.meta.url).href}" alt="${descriptions[n-1]}" width="1200" height="800" loading="${priority?'eager':'lazy'}" ${priority?'fetchpriority="high" ':''}decoding="async">`;
}
