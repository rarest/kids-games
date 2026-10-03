// Topic-based original practice; see SOURCES.md for textbook versions and scope.
// IPA uses broad General American forms (ɛ, ɑ, oʊ, ɚ, ɝ).
const lexicon = `
friend|朋友|frɛnd
ear|耳朵|ɪr
hand|手|hænd
eye|眼睛|aɪ
mouth|嘴巴|maʊθ
arm|手臂|ɑrm
where|在哪里|wɛr
from|来自|frʌm
student|学生|ˈstudənt
long|长的|lɔŋ
big|大的|bɪɡ
small|小的|smɔl
body|身体|ˈbɑdi
love|爱|lʌv
hug|拥抱|hʌɡ
chores|家务（复数）|tʃɔrz
name|名字|neɪm
hello|你好|həˈloʊ
goodbye|再见|ˌɡʊdˈbaɪ
teacher|老师|ˈtitʃɚ
class|班级；课|klæs
family|家庭|ˈfæməli
mother|妈妈|ˈmʌðɚ
father|爸爸|ˈfɑðɚ
sister|姐妹|ˈsɪstɚ
brother|兄弟|ˈbrʌðɚ
grandfather|爷爷；外公|ˈɡrænfɑðɚ
animal|动物|ˈænəməl
cat|猫|kæt
dog|狗|dɔɡ
bird|鸟|bɝd
fish|鱼|fɪʃ
rabbit|兔子|ˈræbɪt
plant|植物；种植|plænt
tree|树|tri
flower|花|ˈflaʊɚ
leaf|叶子|lif
grass|草|ɡræs
water|水|ˈwɔtɚ
red|红色的|rɛd
blue|蓝色的|blu
yellow|黄色的|ˈjɛloʊ
green|绿色的|ɡrin
orange|橙色的；橙子|ˈɔrɪndʒ
purple|紫色的|ˈpɝpəl
one|一|wʌn
two|二|tu
three|三|θri
four|四|fɔr
five|五|faɪv
six|六|sɪks
new|新的|nu
meet|遇见；认识|mit
boy|男孩|bɔɪ
girl|女孩|ɡɝl
child|孩子|tʃaɪld
people|人们|ˈpipəl
happy|开心的|ˈhæpi
sad|难过的|sæd
angry|生气的|ˈæŋɡri
tired|疲倦的|taɪrd
hungry|饥饿的|ˈhʌŋɡri
thirsty|口渴的|ˈθɝsti
book|书|bʊk
read|阅读（原形）|rid
listen|听|ˈlɪsən
write|写|raɪt
pencil|铅笔|ˈpɛnsəl
learn|学习|lɝn
apple|苹果|ˈæpəl
banana|香蕉|bəˈnænə
milk|牛奶|mɪlk
bread|面包|brɛd
egg|鸡蛋|ɛɡ
rice|米饭；大米|raɪs
toy|玩具|tɔɪ
ball|球|bɔl
doll|玩具娃娃|dɑl
car|汽车|kɑr
kite|风筝|kaɪt
old|旧的；年老的|oʊld
seven|七|ˈsɛvən
eight|八|eɪt
nine|九|naɪn
ten|十|tɛn
eleven|十一|ɪˈlɛvən
twelve|十二|twɛlv
clean|打扫；干净的|klin
wash|洗|wɑʃ
cook|烹饪|kʊk
help|帮助|hɛlp
floor|地板|flɔr
dish|盘子；一道菜|dɪʃ
tall|高的|tɔl
short|矮的；短的|ʃɔrt
strong|强壮的|strɔŋ
quiet|安静的|ˈkwaɪət
friendly|友好的|ˈfrɛndli
hair|头发|hɛr
home|家|hoʊm
house|房子|haʊs
room|房间|rum
bedroom|卧室|ˈbɛdrum
kitchen|厨房|ˈkɪtʃən
bathroom|浴室；卫生间|ˈbæθrum
community|社区|kəˈmjunəti
park|公园|pɑrk
library|图书馆|ˈlaɪbrɛri
hospital|医院|ˈhɑspɪtəl
school|学校|skul
street|街道|strit
weather|天气|ˈwɛðɚ
sunny|晴朗的|ˈsʌni
rainy|下雨的|ˈreɪni
cloudy|多云的|ˈklaʊdi
windy|有风的|ˈwɪndi
cold|寒冷的|koʊld
spring|春天|sprɪŋ
summer|夏天|ˈsʌmɚ
autumn|秋天|ˈɔtəm
winter|冬天|ˈwɪntɚ
warm|温暖的|wɔrm
coat|外套|koʊt
rule|规则|rul
sit|坐|sɪt
stand|站立|stænd
speak|说话|spik
desk|课桌|dɛsk
door|门|dɔr
bed|床|bɛd
sleep|睡觉|slip
tidy|整洁的；整理|ˈtaɪdi
homework|家庭作业|ˈhoʊmwɝk
TV|电视|ˌtiˈvi
early|早的；提早|ˈɝli
time|时间|taɪm
clock|钟|klɑk
morning|早晨|ˈmɔrnɪŋ
afternoon|下午|ˌæftɚˈnun
evening|傍晚；晚上|ˈivnɪŋ
breakfast|早餐|ˈbrɛkfəst
shop|商店；购物|ʃɑp
buy|买|baɪ
price|价格|praɪs
cheap|便宜的|tʃip
expensive|昂贵的|ɪkˈspɛnsɪv
shoes|鞋子（复数）|ʃuz
farm|农场|fɑrm
farmer|农民|ˈfɑrmɚ
cow|奶牛|kaʊ
sheep|绵羊|ʃip
horse|马|hɔrs
duck|鸭子|dʌk
vegetable|蔬菜|ˈvɛdʒtəbəl
potato|土豆|pəˈteɪtoʊ
tomato|西红柿|təˈmeɪtoʊ
carrot|胡萝卜|ˈkærət
fruit|水果|frut
chicken|鸡；鸡肉|ˈtʃɪkən
different|不同的|ˈdɪfərənt
kind|善良的|kaɪnd
clever|聪明的|ˈklɛvɚ
shy|害羞的|ʃaɪ
polite|有礼貌的|pəˈlaɪt
funny|有趣的|ˈfʌni
feel|感觉|fil
worried|担心的|ˈwɝid
excited|兴奋的|ɪkˈsaɪtɪd
afraid|害怕的|əˈfreɪd
proud|自豪的|praʊd
calm|平静的|kɑm
work|工作|wɝk
play|玩；演奏|pleɪ
job|职业；工作|dʒɑb
doctor|医生|ˈdɑktɚ
nurse|护士|nɝs
busy|忙碌的|ˈbɪzi
habit|习惯|ˈhæbɪt
exercise|运动；锻炼|ˈɛksɚsaɪz
healthy|健康的|ˈhɛlθi
brush|刷；刷子|brʌʃ
teeth|牙齿（复数）|tiθ
rest|休息|rɛst
food|食物|fud
soup|汤|sup
beef|牛肉|bif
noodles|面条（复数）|ˈnudəlz
sweet|甜的|swit
fresh|新鲜的|frɛʃ
nature|自然|ˈneɪtʃɚ
river|河流|ˈrɪvɚ
lake|湖|leɪk
mountain|山|ˈmaʊntən
forest|森林|ˈfɔrɪst
sea|海|si
follow|遵守；跟随|ˈfɑloʊ
cross|穿过|krɔs
safe|安全的|seɪf
stop|停下|stɑp
wait|等待|weɪt
light|灯；光|laɪt
museum|博物馆|mjuˈziəm
cinema|电影院|ˈsɪnəmə
bank|银行|bæŋk
supermarket|超市|ˈsupɚˌmɑrkɪt
near|在附近|nɪr
behind|在后面|bɪˈhaɪnd
season|季节|ˈsizən
snow|雪；下雪|snoʊ
rain|雨；下雨|reɪn
hot|热的|hɑt
cool|凉爽的|kul
picnic|野餐|ˈpɪknɪk
hometown|家乡|ˈhoʊmtaʊn
village|村庄|ˈvɪlɪdʒ
town|城镇|taʊn
city|城市|ˈsɪti
bridge|桥|brɪdʒ
building|建筑物|ˈbɪldɪŋ
travel|旅行|ˈtrævəl
train|火车|treɪn
bus|公共汽车|bʌs
plane|飞机|pleɪn
boat|船|boʊt
trip|短途旅行|trɪp
plan|计划|plæn
visit|参观；拜访|ˈvɪzɪt
tomorrow|明天|təˈmɑroʊ
ticket|票|ˈtɪkɪt
map|地图|mæp
hotel|旅馆|hoʊˈtɛl
amazing|令人惊叹的|əˈmeɪzɪŋ
place|地方|pleɪs
famous|著名的|ˈfeɪməs
island|岛|ˈaɪlənd
beach|海滩|bitʃ
waterfall|瀑布|ˈwɔtɚfɔl
together|一起|təˈɡɛðɚ
invite|邀请|ɪnˈvaɪt
party|聚会|ˈpɑrti
gift|礼物|ɡɪft
sing|唱歌|sɪŋ
dance|跳舞|dæns
life|生活；生命|laɪf
enough|足够的|ɪˈnʌf
money|钱|ˈmʌni
save|存下；节约|seɪv
spend|花费|spɛnd
cost|花费；费用|kɔst
coin|硬币|kɔɪn
need|需要|nid
space|太空；空间|speɪs
moon|月亮|mun
sun|太阳|sʌn
star|星星|stɑr
earth|地球|ɝθ
planet|行星|ˈplænɪt
energy|能源；能量|ˈɛnɚdʒi
turn|转动|tɝn
use|使用（动词）|juz
protect|保护|prəˈtɛkt
recycle|回收利用|ˌriˈsaɪkəl
taller|更高的|ˈtɔlɚ
shorter|更矮的；更短的|ˈʃɔrtɚ
older|年龄更大的|ˈoʊldɚ
younger|年龄更小的|ˈjʌŋɡɚ
bigger|更大的|ˈbɪɡɚ
heavier|更重的|ˈhɛviɚ
yesterday|昨天|ˈjɛstɚdeɪ
weekend|周末|ˈwikɛnd
cleaned|打扫了|klind
washed|洗了|wɑʃt
stayed|待在；停留了|steɪd
watched|观看了|wɑtʃt
went|去了|wɛnt
rode|骑了|roʊd
saw|看见了|sɔ
bought|买了|bɔt
ate|吃了|eɪt
took|拿了；拍摄了|tʊk
then|那时|ðɛn
now|现在|naʊ
ago|以前|əˈɡoʊ
gym|体育馆|dʒɪm
cycling|骑自行车|ˈsaɪklɪŋ
badminton|羽毛球|ˈbædmɪntən
`;

export const WORDS = Object.fromEntries(lexicon.trim().split('\n').map(line => {
  const [en, zh, pronunciation] = line.split('|');
  return [en.toLowerCase().replaceAll(' ', '-'), { en, zh, ipa: `/${pronunciation}/` }];
}));

const s = (en, zh, tip, acceptedAnswers) => ({ en, zh, tip, ...(acceptedAnswers ? { acceptedAnswers } : {}) });
const q = (prompt, options, answer, explanation) => ({ prompt, options: options.split('|'), answer, explanation });
const u = (title, zh, words, sentences, grammar) => ({ title, zh, words: words.split(' '), sentences, grammar });
const book = (grade, term, units) => {
  const id = `g${grade}-${term}`;
  const suffix = `${grade}${term === 'upper' ? 's' : 'x'}`;
  const review = grade === 6 && term === 'lower';
  return {
    id, grade, term, title: `${grade}年级${term === 'upper' ? '上' : '下'}册${review ? ' · 在用版复习' : ''}`,
    edition: review ? '人教PEP在用版复习（官方四单元资源）' : '人教PEP新目录（2026年10月公开资源）',
    source: `https://www.pep.com.cn/zslth/${review ? 'yyptypzj' : 'yyptzy'}/xypep/${suffix}/`,
    units: units.map((unit, i) => ({ id: `${id}-u${i + 1}`, number: i + 1, ...unit })),
  };
};

export const BOOKS = [
  book(3, 'upper', [
    u('Making friends', '交朋友', 'friend name hello goodbye ear hand eye mouth arm', [
      s('Hello, my name is Lin.', '你好，我叫林。', 'my name is 后面接名字，用来介绍自己。'),
      s('I can wave my hand.', '我会挥手。', 'can 后面接动词原形 wave，hand 表示手。'),
      s('I listen with my ears.', '我用耳朵听。', 'with 表示用，ear 的复数 ears 表示两只耳朵。'),
    ], [
      q('I ___ your new friend.', 'am|is|are', 'am', '主语是 I，表示“我是”时要用 am。'),
      q('I can ___ with my ears.', 'listen|listens|listening', 'listen', 'can 后面要用动词原形，所以选择 listen。'),
    ]),
    u('Different families', '不同的家庭', 'family mother father sister brother grandfather', [
      s('This is my mother.', '这是我的妈妈。', 'this is 用来介绍眼前的一个人或物。'),
      s('I have a brother.', '我有一个兄弟。', 'have 表示“有”，一个兄弟用 a brother。'),
      s('We are a happy family.', '我们是一个快乐的家庭。', 'we 表示“我们”，后面用 are。'),
    ], [
      q('This ___ my father.', 'am|are|is', 'is', 'this 指一个人，后面表示“是”用 is。'),
      q('I have ___ sister.', 'a|an|are', 'a', 'sister 的读音以辅音开头，一个姐妹用 a sister。'),
    ]),
    u('Amazing animals', '神奇的动物', 'animal cat dog bird fish rabbit', [
      s('I can see a rabbit.', '我能看见一只兔子。', 'can 后面接动词原形，see 表示看见。'),
      s('The bird is small.', '这只鸟很小。', 'the bird 指一只鸟，描述它时用 is。'),
      s('I like cats.', '我喜欢猫。', '泛指喜欢猫这一类动物时，可以用复数 cats。'),
    ], [
      q('The dog ___ brown.', 'is|am|are', 'is', 'the dog 是一只狗，表示“是”用 is。'),
      q('I can ___ a bird.', 'sees|see|seeing', 'see', 'can 后面用动词原形，所以选择 see。'),
    ]),
    u('Plants around us', '身边的植物', 'plant tree flower leaf grass water', [
      s('This flower is yellow.', '这朵花是黄色的。', 'flower 是一朵花，所以后面用 is。'),
      s('Trees need water.', '树木需要水。', 'trees 是复数，表达需要时直接用 need。'),
      s('I can plant a tree.', '我会种一棵树。', 'plant 也能作动词，表示种植。'),
    ], [
      q('These trees ___ green.', 'is|am|are', 'are', 'these trees 表示这些树，是复数，要用 are。'),
      q('This is ___ leaf.', 'an|a|are', 'a', 'leaf 的读音以辅音开头，一片叶子用 a leaf。'),
    ]),
    u('The colourful world', '多彩的世界', 'red blue yellow green orange purple', [
      s('My kite is blue.', '我的风筝是蓝色的。', '描述物品颜色时，可以用 is 加颜色词。'),
      s('I like purple flowers.', '我喜欢紫色的花。', '颜色词 purple 放在名词 flowers 前面。'),
      s('The grass is green.', '草是绿色的。', 'grass 表示草的整体，后面用 is。'),
    ], [
      q('My bag ___ red.', 'are|is|am', 'is', 'my bag 指一个书包，后面用 is。'),
      q('I have a ___ ball.', 'blue|blues|blue is', 'blue', '颜色词放在 ball 前面，blue 不需要变成复数。'),
    ]),
    u('Useful numbers', '有用的数字', 'one two three four five six', [
      s('I have two pencils.', '我有两支铅笔。', 'two 表示两个，pencil 后面要加 s。'),
      s('There are three birds.', '有三只鸟。', 'three birds 是复数，前面用 there are。'),
      s('I am six years old.', '我六岁了。', '说年龄可以用 I am 加数字和 years old。'),
    ], [
      q('I have two ___.', 'pencil|pencils|pencil is', 'pencils', 'two 表示两个，名词 pencil 要变成 pencils。'),
      q('There ___ five flowers.', 'are|is|am', 'are', 'five flowers 是复数，所以用 there are。'),
    ]),
  ]),
  book(3, 'lower', [
    u('Meeting new people', '认识新朋友', 'new meet boy girl child people teacher class where from student', [
      s('Nice to meet you!', '很高兴认识你！', '第一次认识别人，可以用这句话打招呼。'),
      s('This is my new teacher.', '这是我的新老师。', 'new 表示新的，放在 teacher 前面。'),
      s('I am from China.', '我来自中国。', 'be from 表示来自，主语是 I 时用 am。'),
    ], [
      q('You ___ my new friend.', 'is|are|am', 'are', '主语是 you，表示“你是”要用 are。'),
      q('Where ___ you from?', 'is|am|are', 'are', '询问你来自哪里时，you 要与 are 搭配。'),
    ]),
    u('Expressing yourself', '描述特征与表达关爱', 'long short big small body love hug hair', [
      s('I have short hair.', '我留着短发。', 'short 放在 hair 前面，描述头发的长度。'),
      s('The rabbit has long ears.', '这只兔子长着长耳朵。', 'the rabbit 是一只兔子，表示有时要用 has。'),
      s('We can show our love with a hug.', '我们可以用拥抱来表达爱。', 'with a hug 表示用一个拥抱，can 后面接动词原形。', ['With a hug we can show our love.']),
    ], [
      q('The cat ___ a small body.', 'have|has|having', 'has', 'the cat 指一只猫，表示“有”时要用 has。'),
      q('I ___ two big eyes.', 'have|has|having', 'have', '主语是 I，一般现在时中表示“有”用 have。'),
    ]),
    u('Learning better', '更好地学习', 'book read listen write pencil learn', [
      s('I read a book every day.', '我每天读一本书。', 'every day 表示每天，主语 I 后面用 read。', ["Every day I read a book."]),
      s('Please listen to the teacher.', '请听老师讲。', 'listen to 表示听某人说话，不要漏掉 to。'),
      s('We can learn together.', '我们可以一起学习。', 'can 后面接动词原形 learn。'),
    ], [
      q('Please listen ___ me.', 'to|at|on', 'to', 'listen to 表示听某人说话，所以这里用 to。'),
      q('I can ___ my name.', 'writes|write|writing', 'write', 'can 后面用动词原形，选择 write。'),
    ]),
    u('Healthy food', '健康的食物', 'apple banana milk bread egg rice', [
      s('I eat an apple every day.', '我每天吃一个苹果。', 'apple 的读音以元音开头，一个苹果用 an apple。', ["Every day I eat an apple."]),
      s('I like milk and bread.', '我喜欢牛奶和面包。', 'milk 和 bread 在这里不用加 s。'),
      s('Would you like some rice?', '你想吃点米饭吗？', 'some rice 表示一些米饭，rice 不用变复数。'),
    ], [
      q('This is ___ apple.', 'a|an|are', 'an', 'apple 的读音以元音开头，所以用 an。'),
      q('I would like some ___.', 'milks|milk|a milk', 'milk', '这里说一些牛奶，milk 不可数，不能加 s。'),
    ]),
    u('Old toys', '旧玩具', 'toy ball doll car kite old', [
      s('This is my old toy car.', '这是我的旧玩具汽车。', 'old 放在 toy car 前面，描述它是旧的。'),
      s('I have two dolls.', '我有两个玩具娃娃。', 'two 表示两个，doll 后面要加 s。'),
      s('We can share our toys.', '我们可以分享玩具。', 'our 表示我们的，放在 toys 前面。'),
    ], [
      q('This is ___ old kite.', 'a|an|are', 'an', 'old 的读音以元音开头，所以用 an old kite。'),
      q('These ___ my toys.', 'is|am|are', 'are', 'these 指这些物品，是复数，后面用 are。'),
    ]),
    u('Numbers in life', '生活中的数字', 'seven eight nine ten eleven twelve', [
      s('I am eight years old.', '我八岁了。', '年龄大于一岁时，year 要用复数 years。'),
      s('There are ten books on the desk.', '桌上有十本书。', 'ten books 是复数，所以用 there are。', ["On the desk there are ten books."]),
      s('I can count to twelve.', '我能数到十二。', 'count to 加数字，表示数到这个数。'),
    ], [
      q('There ___ eleven students here.', 'is|are|am', 'are', 'eleven students 是复数，前面用 there are。'),
      q('I am nine ___ old.', 'year|years|year is', 'years', '九岁不止一年，year 要变成复数 years。'),
    ]),
  ]),
  book(4, 'upper', [
    u('Helping at home', '在家帮忙', 'clean wash cook help floor dish chores doctor nurse farmer job', [
      s('I can clean the floor.', '我会清洁地板。', 'can 后面接动词原形，clean 表示打扫。'),
      s('She washes the dishes every evening.', '她每天晚上洗盘子。', 'she 指一个人，描述每天做的事时 wash 变成 washes。', ["Every evening she washes the dishes."]),
      s('We help our parents at home.', '我们在家帮助父母。', '主语是 we，表达习惯时用动词原形 help。', ["At home we help our parents."]),
    ], [
      q('She ___ the dishes every evening.', 'wash|washes|washing', 'washes', 'she 指一个人，every evening 表示习惯，所以用 washes。'),
      q('I can ___ dinner.', 'cooks|cooking|cook', 'cook', 'can 后面要用动词原形，所以选择 cook。'),
    ]),
    u('My friends', '我的朋友', 'tall short strong quiet friendly hair', [
      s('My friend has short hair.', '我的朋友留着短发。', 'my friend 是一个人，表示“有”时用 has。'),
      s('She is tall and strong.', '她又高又强壮。', 'and 可以连接两个描述同一个人的词。'),
      s('He is quiet in the library.', '他在图书馆里很安静。', 'quiet 描述安静的状态，前面用 is。', ["In the library he is quiet."]),
    ], [
      q('My friend ___ long hair.', 'have|has|having', 'has', 'my friend 指一个人，一般现在时中 have 要变成 has。'),
      q('They ___ friendly.', 'is|am|are', 'are', 'they 表示他们，是复数，描述状态用 are。'),
    ]),
    u('Places we live in', '我们居住的地方', 'home house room bedroom kitchen bathroom', [
      s('There is a kitchen in our house.', '我们的房子里有一个厨房。', '一个厨房用 there is，表示某处有某物。', ["In our house there is a kitchen."]),
      s('My bedroom is next to the bathroom.', '我的卧室在卫生间旁边。', 'next to 表示紧挨着、在旁边。'),
      s('We live in a small house.', '我们住在一所小房子里。', 'live in 表示住在某个地方。'),
    ], [
      q('There ___ a bed in my room.', 'are|is|am', 'is', 'a bed 是一张床，表示有一张床用 there is。'),
      q('We live ___ a house.', 'in|on|at the', 'in', '住在一所房子里用 live in a house。'),
    ]),
    u('Helping in the community', '帮助社区', 'community park library hospital school street', [
      s('We keep our street clean.', '我们保持街道整洁。', 'keep 加物品和 clean，表示让物品保持干净。'),
      s('The library is near our school.', '图书馆在我们学校附近。', 'near 表示在附近，后面可以直接接地点。'),
      s('I help my grandfather in the park.', '我在公园里帮助爷爷。', 'in the park 表示在公园里。', ["In the park I help my grandfather."]),
    ], [
      q('The library ___ near the park.', 'is|am|are', 'is', 'the library 指一个图书馆，后面用 is。'),
      q('We ___ our neighbours every week.', 'helps|helping|help', 'help', '主语是 we，描述每周的习惯时用 help。'),
    ]),
    u('The weather and us', '天气与我们', 'weather sunny rainy cloudy windy cold', [
      s('It is sunny today.', '今天阳光明媚。', '说天气可以用 it is 加天气词。', ["Today it is sunny."]),
      s('Is it cold outside?', '外面冷吗？', '询问天气时，把 is 放到 it 前面。'),
      s('We stay at home on rainy days.', '下雨天我们待在家里。', 'on rainy days 表示在下雨的日子里。', ["On rainy days we stay at home."]),
    ], [
      q('It ___ windy today.', 'are|am|is', 'is', '说天气时常用 it 作主语，与 is 搭配。'),
      q('___ it rainy outside?', 'Are|Is|Am', 'Is', '询问天气用 Is it 加天气词。'),
    ]),
    u('Changing for the seasons', '随季节变化', 'spring summer autumn winter warm coat', [
      s('It is warm in spring.', '春天很温暖。', '说在某个季节时，在季节前用 in。', ["In spring it is warm."]),
      s('I wear a coat in winter.', '我冬天穿外套。', 'wear 表示穿着，a coat 表示一件外套。', ["In winter I wear a coat."]),
      s('The leaves turn yellow in autumn.', '叶子在秋天变黄。', 'leaf 的复数是 leaves，turn 在这里表示变成。', ["In autumn the leaves turn yellow."]),
    ], [
      q('It is hot ___ summer.', 'on|in|at', 'in', 'summer 是季节，表示在夏天用 in summer。'),
      q('I wear ___ coat in winter.', 'a|an|are', 'a', 'coat 的读音以辅音开头，一件外套用 a coat。'),
    ]),
  ]),
  book(4, 'lower', [
    u('Class rules', '班级规则', 'rule sit stand speak desk door', [
      s('Please sit down.', '请坐下。', '请求别人做事时，用 please 加动词原形。'),
      s('Do not run in the classroom.', '不要在教室里跑。', 'do not 加动词原形，表示不要做这件事。'),
      s('Keep your desk clean.', '保持你的课桌干净。', 'keep 加物品和 clean，表示让物品保持干净。'),
    ], [
      q('Please ___ the door.', 'close|closes|closing', 'close', '这是一句请求，please 后面用动词原形 close。'),
      q('Do not ___ in class.', 'talks|talk|talking', 'talk', 'do not 后面用动词原形，所以选择 talk。'),
    ]),
    u('Family rules', '家庭规则', 'bed sleep tidy homework tv early', [
      s('I do my homework before dinner.', '我晚饭前做作业。', 'before dinner 表示在晚饭之前。', ["Before dinner I do my homework."]),
      s('We must keep our room tidy.', '我们必须保持房间整洁。', 'must 表示必须，后面接动词原形 keep。'),
      s('Do not watch TV late at night.', '夜里不要很晚还看电视。', 'do not 加动词原形，表示不可以做这件事。', ["Late at night do not watch TV."]),
    ], [
      q('We must ___ our room tidy.', 'keep|keeps|keeping', 'keep', 'must 后面要用动词原形，所以选择 keep。'),
      q('She ___ her homework after school.', 'do|does|doing', 'does', 'she 指一个人，描述日常习惯时 do 变成 does。'),
    ]),
    u('Time for school', '上学时间', 'time clock morning afternoon evening breakfast', [
      s('I get up at seven.', '我七点起床。', '具体几点前用 at，所以是 at seven。', ["At seven I get up."]),
      s('It is time for breakfast.', '该吃早餐了。', 'it is time for 后面接名词，表示该做相关的事了。'),
      s('We go to school in the morning.', '我们早晨去上学。', 'in the morning 表示在早晨。', ["In the morning we go to school."]),
    ], [
      q('I go to school ___ eight.', 'on|at|in', 'at', 'eight 在这里是八点，具体时刻前用 at。'),
      q('It is time ___ lunch.', 'for|to|at', 'for', 'lunch 是名词，表示该吃午饭了用 time for lunch。'),
    ]),
    u('Going shopping', '去购物', 'shop buy price cheap expensive shoes', [
      s('How much is this bag?', '这个包多少钱？', '问一个物品的价格，用 how much is。'),
      s('These shoes are too small.', '这双鞋太小了。', 'shoes 是复数，后面要用 are。'),
      s('I would like a blue hat.', '我想要一顶蓝色的帽子。', 'would like 表示想要，比直接说 want 更有礼貌。'),
    ], [
      q('How much ___ these shoes?', 'is|are|am', 'are', 'these shoes 是复数，询问价格时用 are。'),
      q('I would like ___ new hat.', 'an|a|are', 'a', 'new 的读音以辅音开头，用 a new hat。'),
    ]),
    u('Farms and us', '农场与我们', 'farm farmer cow sheep horse duck', [
      s('There are four cows on the farm.', '农场里有四头奶牛。', 'four cows 是复数，前面用 there are。', ["On the farm there are four cows."]),
      s('The farmer feeds the ducks.', '农民喂鸭子。', 'the farmer 是一个人，描述日常行为时用 feeds。'),
      s('I can see two sheep.', '我能看见两只绵羊。', 'sheep 的单数和复数形式相同，不加 s。'),
    ], [
      q('There are three ___ on the farm.', 'sheep|sheeps|sheep is', 'sheep', 'sheep 的单数和复数拼写相同，三只绵羊也用 sheep。'),
      q('The farmer ___ the cows every morning.', 'feed|feeds|feeding', 'feeds', 'the farmer 指一个人，日常动作 feed 后面要加 s。'),
    ]),
    u('From farm to table', '从农场到餐桌', 'vegetable potato tomato carrot fruit chicken', [
      s('These tomatoes are fresh.', '这些西红柿很新鲜。', 'tomato 的复数是 tomatoes，后面用 are。'),
      s('I wash the carrots before dinner.', '我晚饭前洗胡萝卜。', 'before 表示在某个时间之前。', ["Before dinner I wash the carrots."]),
      s('We have vegetables and chicken for lunch.', '我们午餐吃蔬菜和鸡肉。', 'have 加食物可以表示吃，for lunch 表示作为午餐。'),
    ], [
      q('I have two ___.', 'potato|potatos|potatoes', 'potatoes', 'two 表示两个，potato 的复数要在词尾加 es。'),
      q('These carrots ___ fresh.', 'are|is|am', 'are', 'these carrots 是复数，后面要用 are。'),
    ]),
  ]),
  book(5, 'upper', [
    u('Different friends', '不同的朋友', 'different kind clever shy polite funny', [
      s('My new friend is very kind.', '我的新朋友很善良。', 'kind 描述人的性格，very 表示很。'),
      s('She is shy, but she is friendly.', '她有些害羞，但她很友好。', 'but 表示但是，连接两个意思有转折的部分。'),
      s('We are different, and we help each other.', '我们各不相同，也互相帮助。', 'each other 表示互相，help each other 就是互相帮助。'),
    ], [
      q('My friends ___ polite.', 'is|am|are', 'are', 'friends 是复数，描述他们的性格要用 are。'),
      q('She ___ a kind friend.', 'have|has|having', 'has', 'she 是一个人，一般现在时中 have 变成 has。'),
    ]),
    u('My feelings', '我的感受', 'feel worried excited afraid proud calm happy sad angry tired hungry thirsty', [
      s('I feel excited about the trip.', '我对这次旅行感到兴奋。', 'feel 后面可以接感受词，about 引出这件事。'),
      s('She is worried about her cat.', '她担心她的猫。', 'be worried about 表示担心某人或某物。'),
      s('Take a deep breath and stay calm.', '深呼吸，保持冷静。', '这是一句建议，用动词原形 take 和 stay。'),
    ], [
      q('He ___ worried today.', 'is|are|am', 'is', 'he 指一个人，描述今天的感受用 is。'),
      q('She ___ happy when she sees her friends.', 'feel|feels|feeling', 'feels', 'she 指一个人，描述经常出现的感受时 feel 要加 s。'),
    ]),
    u('Work and play', '工作与玩耍', 'work play job doctor nurse busy', [
      s('My father works in a hospital.', '我的爸爸在医院工作。', 'my father 指一个人，习惯性动作 work 要加 s。', ["In a hospital my father works."]),
      s('We play basketball after school.', '我们放学后打篮球。', 'play 后面接球类名称时，不加 the。', ["After school we play basketball."]),
      s('I want to be a doctor.', '我想成为一名医生。', 'want to be 表示想成为，职业前通常用 a 或 an。'),
    ], [
      q('My mother ___ in a school.', 'work|working|works', 'works', 'my mother 指一个人，描述工作地点时用 works。'),
      q('I want ___ a nurse.', 'be|to be|being', 'to be', 'want 后面接 to 加动词，所以想成为用 want to be。'),
    ]),
    u('Healthy habits', '健康习惯', 'habit exercise healthy brush teeth rest', [
      s('I brush my teeth twice a day.', '我每天刷牙两次。', 'tooth 的复数是 teeth，twice a day 表示一天两次。', ["Twice a day I brush my teeth."]),
      s('We should exercise every day.', '我们应该每天运动。', 'should 表示应该，后面接动词原形。', ["Every day we should exercise."]),
      s('He goes to bed early.', '他早早睡觉。', 'he 指一个人，go 在一般现在时中变成 goes。'),
    ], [
      q('We should ___ enough water.', 'drink|drinks|drinking', 'drink', 'should 后面用动词原形，所以选择 drink。'),
      q('He ___ his teeth every morning.', 'brush|brushes|brushing', 'brushes', 'he 指一个人，brush 在一般现在时中变成 brushes。'),
    ]),
    u('Food we eat', '我们吃的食物', 'food soup beef noodles sweet fresh', [
      s('I would like some beef noodles.', '我想吃一些牛肉面。', 'some 表示一些，beef 放在 noodles 前说明面条的种类。'),
      s('The soup is hot.', '汤很烫。', 'soup 在这里不可数，后面用 is。'),
      s('These apples are sweet.', '这些苹果很甜。', 'these apples 是复数，后面用 are。'),
    ], [
      q('There ___ some soup in the bowl.', 'is|are|am', 'is', 'soup 在这里不可数，表示有一些汤用 there is。'),
      q('I like ___.', 'noodle is|a noodles|noodles', 'noodles', '泛指喜欢面条时用复数 noodles，不能说 a noodles。'),
    ]),
    u('Nature and us', '自然与我们', 'nature river lake mountain forest sea', [
      s('There is a river near the village.', '村庄附近有一条河。', 'a river 是一条河，前面用 there is。'),
      s('There are many trees in the forest.', '森林里有许多树。', 'many 后面接复数名词 trees。', ["In the forest there are many trees."]),
      s('We should keep the lake clean.', '我们应该保持湖泊清洁。', 'should 后面用 keep，表示应该保持。'),
    ], [
      q('There ___ two lakes near the mountain.', 'is|am|are', 'are', 'two lakes 是复数，表示有两个湖用 there are。'),
      q('We should ___ nature.', 'protects|protect|protecting', 'protect', 'should 后面要用动词原形 protect。'),
    ]),
  ]),
  book(5, 'lower', [
    u('Following the rules', '遵守规则', 'follow cross safe stop wait light', [
      s('We must follow the rules.', '我们必须遵守规则。', 'must 表示必须，后面接动词原形 follow。'),
      s('Stop and wait at a red light.', '红灯亮时停下来等待。', '这是一句指令，用动词原形 stop 和 wait。', ["At a red light stop and wait."]),
      s('Do not run across the street.', '不要跑着穿过马路。', 'do not 加动词原形，表示不要做这件事。'),
    ], [
      q('We must ___ at a red light.', 'stops|stopping|stop', 'stop', 'must 后面用动词原形，所以选择 stop。'),
      q('Do not ___ in the street.', 'playing|play|plays', 'play', 'do not 后面用动词原形，所以选择 play。'),
    ]),
    u('Our community', '我们的社区', 'museum cinema bank supermarket near behind', [
      s('The museum is behind the bank.', '博物馆在银行后面。', 'behind 表示在后面，后面接地点名称。'),
      s('There is a supermarket near my home.', '我家附近有一个超市。', '一个超市用 there is，near 表示在附近。'),
      s('How can I get to the cinema?', '我怎样到电影院？', 'get to 表示到达，后面接具体地点。'),
    ], [
      q('There ___ two parks in my town.', 'is|are|am', 'are', 'two parks 是复数，所以用 there are。'),
      q('How can I ___ to the museum?', 'get|gets|getting', 'get', 'can 后面用动词原形，所以选择 get。'),
    ]),
    u('Life in different seasons', '不同季节的生活', 'season snow rain hot cool picnic', [
      s('I like spring because it is warm.', '我喜欢春天，因为春天很温暖。', 'because 后面的部分说明喜欢春天的原因。'),
      s('We can have a picnic in autumn.', '我们可以在秋天野餐。', 'have a picnic 表示野餐，季节前用 in。', ["In autumn we can have a picnic."]),
      s('It often snows in winter.', '冬天经常下雪。', 'it 作主语描述天气，snow 在这里作动词，要加 s。', ["In winter it often snows.", "It snows often in winter."]),
    ], [
      q('It often ___ in winter.', 'snow|snows|snowing', 'snows', 'often 表示经常，主语是 it，所以动词 snow 要加 s。'),
      q('We can ___ a picnic in spring.', 'have|has|having', 'have', 'can 后面用动词原形，所以选择 have。'),
    ]),
    u('My hometown', '我的家乡', 'hometown village town city bridge building', [
      s('My hometown is a small town.', '我的家乡是一个小镇。', 'hometown 是一个地方，后面用 is。'),
      s('There are many buildings in the city.', '城市里有许多建筑。', 'many buildings 是复数，所以用 there are。', ["In the city there are many buildings."]),
      s('A bridge goes across the river.', '一座桥横跨河流。', 'a bridge 是一座桥，go 在一般现在时中变成 goes。'),
    ], [
      q('There ___ a bridge in my village.', 'are|is|am', 'is', 'a bridge 是一座桥，表示有一座桥用 there is。'),
      q('My hometown ___ beautiful.', 'are|am|is', 'is', 'my hometown 指一个地方，描述它时用 is。'),
    ]),
    u('Travelling around', '四处旅行', 'travel train bus plane boat trip', [
      s('We go to the city by train.', '我们乘火车去城市。', 'by train 表示乘火车，by 后面不加 a 或 the。'),
      s('How do you go to school?', '你怎样去上学？', '询问日常交通方式可以用 how do you go。'),
      s('My sister walks to school every day.', '我的姐妹每天走路去上学。', 'my sister 是一个人，日常动作 walk 要加 s。', ["Every day my sister walks to school."]),
    ], [
      q('I go to school ___ bus.', 'on|by|in', 'by', 'bus 前面没有 a 或 the 时，乘公交用 by bus。'),
      q('She ___ to school every day.', 'walk|walking|walks', 'walks', 'she 指一个人，every day 表示习惯，所以用 walks。'),
    ]),
    u('Making a travel plan', '制定旅行计划', 'plan visit tomorrow ticket map hotel', [
      s('We are going to visit a museum tomorrow.', '我们明天打算参观一个博物馆。', 'be going to 加动词原形，表示打算做某事。', ["Tomorrow we are going to visit a museum."]),
      s('I will buy the tickets this evening.', '我今晚会买票。', 'will 后面接动词原形 buy。', ["This evening I will buy the tickets."]),
      s('Where are you going to stay?', '你打算住在哪里？', 'where 问地点，be going to 表示打算。'),
    ], [
      q('We ___ going to visit the museum tomorrow.', 'is|are|am', 'are', '主语是 we，be going to 中的 be 要选 are。'),
      q('I will ___ a map tomorrow.', 'buy|buys|buying', 'buy', 'will 后面要用动词原形，所以选择 buy。'),
    ]),
  ]),
  book(6, 'upper', [
    u('Amazing places', '令人惊叹的地方', 'amazing place famous island beach waterfall', [
      s('We want to visit the island.', '我们想去游览这个岛。', 'want to 后面接动词原形 visit，表示想参观。'),
      s('There is a waterfall near the beach.', '海滩附近有一道瀑布。', 'a waterfall 是一道瀑布，前面用 there is。'),
      s('This place is famous for its mountains.', '这个地方以群山闻名。', 'be famous for 表示因某种特色而闻名。'),
    ], [
      q('There ___ an island near the coast.', 'are|am|is', 'is', 'an island 是一个岛，表示有一个岛用 there is。'),
      q('We want ___ the waterfall.', 'visit|to visit|visiting', 'to visit', 'want 后面接 to 加动词原形，所以用 to visit。'),
    ]),
    u('Getting together', '相聚在一起', 'together invite party gift sing dance', [
      s('We are going to have a party on Saturday.', '我们打算星期六举行聚会。', 'be going to 表示打算，星期几前用 on。', ["On Saturday we are going to have a party."]),
      s('Would you like to join us?', '你愿意加入我们吗？', 'would you like to 加动词，用来礼貌地邀请别人。'),
      s('I will bring a gift for my friend.', '我会给我的朋友带一份礼物。', 'will 后面用动词原形 bring。'),
    ], [
      q('Would you like ___ with us?', 'dance|to dance|dances', 'to dance', 'would like 后面接 to 加动词原形，所以用 to dance。'),
      q('The party is ___ Saturday.', 'in|at|on', 'on', 'Saturday 是具体的星期几，前面用 on。'),
    ]),
    u('Healthy life', '健康生活', 'life enough sleep exercise breakfast habit', [
      s('We should get enough sleep.', '我们应该睡够时间。', 'enough 放在 sleep 前面，表示足够的睡眠。'),
      s('She eats breakfast every morning.', '她每天早晨吃早餐。', 'she 指一个人，日常动作 eat 要加 s。', ["Every morning she eats breakfast."]),
      s('It is important to exercise every day.', '每天锻炼很重要。', 'it is important to 加动词，说明做某事很重要。'),
    ], [
      q('He should ___ to bed early.', 'goes|go|going', 'go', 'should 后面要用动词原形，所以选择 go。'),
      q('She ___ breakfast every morning.', 'eat|eating|eats', 'eats', 'she 指一个人，every morning 表示习惯，所以用 eats。'),
    ]),
    u('Managing money well', '合理管理零花钱', 'money save spend cost coin need', [
      s('I save some money every week.', '我每周存一些钱。', 'money 在这里不可数，一些钱可以说 some money。', ["Every week I save some money."]),
      s('This book costs ten yuan.', '这本书十元。', 'this book 指一本书，cost 作动词时要加 s。'),
      s('We should buy only what we need.', '我们应该只买需要的东西。', 'what we need 表示我们需要的东西。', ["We should only buy what we need."]),
    ], [
      q('This pencil ___ two yuan.', 'cost|costs|costing', 'costs', 'this pencil 是一支铅笔，一般现在时中 cost 要加 s。'),
      q('We should ___ some money.', 'save|saves|saving', 'save', 'should 后面接动词原形，所以选择 save。'),
    ]),
    u('Exploring space', '探索太空', 'space moon sun star earth planet', [
      s('The Earth goes around the Sun.', '地球绕着太阳转。', 'the Earth 指地球，一般现在时中 go 变成 goes。'),
      s('We can see the Moon at night.', '我们夜里能看见月亮。', 'at night 表示在夜里，can 后面用 see。', ["At night we can see the Moon."]),
      s('I want to learn more about space.', '我想多了解一些太空知识。', 'learn about 表示了解，want to 表示想做某事。'),
    ], [
      q('The Earth ___ around the Sun.', 'go|goes|going', 'goes', 'the Earth 是单数，描述这个事实时 go 要变成 goes。'),
      q('I want ___ about the planets.', 'learn|learning|to learn', 'to learn', 'want 后面接 to 加动词原形，所以用 to learn。'),
    ]),
    u('Energy, nature and us', '能源、自然与我们', 'energy turn light use protect recycle', [
      s('Turn off the lights when you leave.', '离开时关灯。', 'turn off 表示关闭，when you leave 表示当你离开时。', ["Turn the lights off when you leave.", "When you leave turn off the lights.", "When you leave turn the lights off."]),
      s('We should use less water.', '我们应该少用水。', 'water 不可数，表示更少的水用 less water。'),
      s('Recycling helps protect nature.', '回收利用有助于保护自然。', 'recycling 在这里是一件事，所以 help 要变成 helps。'),
    ], [
      q('We should ___ the lights when we leave.', 'turn off|turns off|turning off', 'turn off', 'should 后面用动词原形，所以选择 turn off。'),
      q('We should use ___ water.', 'fewer|less|many', 'less', 'water 不可数，表示更少时用 less，fewer 用于可数名词。'),
    ]),
  ]),
  book(6, 'lower', [
    u('How tall are you?', '你有多高？', 'taller shorter older younger bigger heavier', [
      s('My brother is taller than me.', '我的兄弟比我高。', '比较两个人时，用 taller than 表示比某人高。'),
      s('Your bag is heavier than mine.', '你的包比我的重。', 'heavy 的比较级是 heavier，mine 表示我的包。'),
      s('How tall are you?', '你有多高？', 'how tall 用来询问身高，主语是 you 时用 are。'),
    ], [
      q('This tree is ___ than that one.', 'tall|taller|tallest', 'taller', 'than 表示比较两者，要用比较级 taller。'),
      q('My bag is ___ than yours.', 'heavy|heaviest|heavier', 'heavier', '比较两个包的重量要用 heavier，heavy 词尾 y 变 i 再加 er。'),
    ]),
    u('Last weekend', '上个周末', 'yesterday weekend cleaned washed stayed watched', [
      s('I cleaned my room yesterday.', '我昨天打扫了房间。', 'yesterday 表示过去，clean 要变成过去式 cleaned。', ["Yesterday I cleaned my room."]),
      s('We stayed at home last weekend.', '我们上周末待在家里。', 'last weekend 表示过去，stay 要变成 stayed。', ["Last weekend we stayed at home."]),
      s('Did you watch TV last night?', '你昨晚看电视了吗？', 'did 已经表示过去，后面的 watch 保持原形。', ["Last night did you watch TV?"]),
    ], [
      q('I ___ my room yesterday.', 'clean|cleaned|cleaning', 'cleaned', 'yesterday 是过去时间，所以 clean 要用过去式 cleaned。'),
      q('Did you ___ TV last night?', 'watched|watch|watching', 'watch', 'did 已经表示过去，后面的动词必须用原形 watch。'),
    ]),
    u('Where did you go?', '你去了哪里？', 'went rode saw bought ate took', [
      s('We went to the beach last Sunday.', '我们上星期天去了海滩。', 'last Sunday 表示过去，go 的过去式是 went。', ["Last Sunday we went to the beach."]),
      s('I rode a bike with my sister.', '我和我的姐妹一起骑了自行车。', 'rode 是 ride 的过去式，表示过去骑了车。'),
      s('She took some photos yesterday.', '她昨天拍了一些照片。', '拍照用 take photos，过去发生时 take 变成 took。', ["Yesterday she took some photos."]),
    ], [
      q('Did you ___ a bike last Sunday?', 'rode|riding|ride', 'ride', 'did 已经表示过去，后面要用 ride 的原形。'),
      q('We ___ to the park yesterday.', 'go|went|going', 'went', 'yesterday 表示过去，go 的过去式是不规则变化 went。'),
    ]),
    u('Then and now', '过去与现在', 'then now ago gym cycling badminton', [
      s('There was no gym in our school ten years ago.', '十年前我们学校没有体育馆。', 'ten years ago 表示过去，一个 gym 前面用 there was。', ["Ten years ago there was no gym in our school.", "In our school there was no gym ten years ago."]),
      s('There is a new gym now.', '现在有一个新的体育馆。', 'now 表示现在，一个 gym 前面用 there is。', ["Now there is a new gym."]),
      s('I could not ride a bike before, but I can now.', '以前我不会骑自行车，但现在会了。', 'could not 表示过去不会，can 表示现在会。'),
    ], [
      q('There ___ no gym in our school ten years ago.', 'is|was|are', 'was', 'ten years ago 表示过去，gym 是单数，所以用 was。'),
      q('There ___ two new buildings in our school now.', 'is|was|are', 'are', 'now 表示现在，two buildings 是复数，所以用 are。'),
    ]),
  ]),
];
