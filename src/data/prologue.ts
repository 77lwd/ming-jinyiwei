import type { PrologueScene } from '../types'

export const prologueScenes: PrologueScene[] = [
  {
    id: 'warm-home',
    title: '十五年前 · 廖宅',
    image: { src: '/assets/prologue/fifteen-years-ago-v1.jpg', alt: '十五年前的廖宅日常' },
    tone: 'warm',
    paragraphs: [
      { kind: 'prose', text: '你记得火烧起来以前的家。廖宅的院墙不高，春天晒满药草，母亲把竹匾一张张摆开，父亲则在廊下擦拭一把旧刀。黄昏时，风会把药香送进灶房，连邻家的猫都知道什么时候该来讨食。' },
      { kind: 'dialogue', text: '“威达，门闩再检查一遍。”父亲总在掌灯后这样说。你嫌他多事，母亲却笑着把第二道木栓推紧：“听你父亲的，夜里别给陌生人开门。”' },
      { kind: 'monologue', text: '那时你还不懂他们为什么总把门闩两次。你只记得父亲磨刀时的细响，和母亲把你抱到膝上、用药草味的手指替你理顺头发。' },
    ],
  },
  {
    id: 'night-attack',
    title: '火光',
    image: { src: '/assets/prologue/firelight-v1.png', alt: '廖宅起火时父亲护住年幼的廖威达' },
    tone: 'tense',
    paragraphs: [
      { kind: 'prose', text: '那一夜没有月亮。先是屋瓦被踩裂的声音，接着是墙外短促的脚步；黑衣人像一排被夜色吐出来的影子，从墙头落进院中。母亲手里的药碗摔在地上，白瓷碎片沿着门槛滚了一圈。' },
      { kind: 'dialogue', text: '父亲一把扯开暗柜，把半截断刀塞进你怀里：“握紧，别出声。”院门被撞开时，他挡在你和火光之间，向来平稳的声音第一次带了命令以外的恐惧。' },
      { kind: 'prose', text: '你听见金属相击，也听见院外有人催促搜索。火油泼上窗纸，红光一寸寸爬进屋里；父亲退了半步，手臂上已经多了一道血口，却仍没有让开身后的门。' },
    ],
  },
  {
    id: 'mothers-last-stand',
    title: '门内',
    image: { src: '/assets/prologue/inside-the-door-v1.jpg', alt: '火灾中母亲在门内将物件交给年幼的廖威达' },
    tone: 'somber',
    paragraphs: [
      { kind: 'prose', text: '母亲把你从灶房地砖下拖出暗门，粗糙的砖角划破了你的膝盖。暗道里全是潮气和柴灰，你想回头找父亲，她却用两只手捂住你的嘴，把你往后墙的方向推。' },
      { kind: 'dialogue', text: '她回头时没有哭，只对你做了一个噤声的手势。“别怕，威达。数到一百以前，不许出来。”她把自己的簪子塞进你手里，像是答应还会回来取。' },
      { kind: 'prose', text: '门外的脚步停了一下，有人低声问“还有孩子吗”。母亲没有回答。下一刻，火光漫过窗纸，烟从砖缝里渗进来；你数到十七，就再也听不见她的脚步。' },
    ],
  },
  {
    id: 'swordsman',
    title: '剑客',
    image: { src: '/assets/prologue/swordsman-v1.png', alt: '雨夜废墟中持剑的陌生剑客与年幼的廖威达' },
    tone: 'tense',
    paragraphs: [
      { kind: 'prose', text: '后墙在你眼前塌下一角，一个穿灰衣、蒙着面的剑客逆着火光走进院子。他没有急着拔剑，先看了看倒在门边的父亲，又看向你藏身的柴堆；雨水落在他的肩上，蒸成一层薄薄的白雾。' },
      { kind: 'dialogue', text: '他看见三岁的你，也看见你手里的半截断刀。“这不是你该拿的东西。”那人低声说。你没有松手，反而把刀柄攥得更紧；他举起的剑因此停在半空，迟迟没有落下。' },
      { kind: 'prose', text: '灰衣人最终收剑，撕下衣摆裹住你的口鼻，抱你翻过后墙。天将亮时，他把你留在村口的柴车旁，随即消失在雾里；一位独居老人听见你的哭声，将你抱回了家。' },
    ],
  },
  {
    id: 'fifteen-years',
    title: '十五年后',
    image: { src: '/assets/prologue/fifteen-years-later-v1.png', alt: '十五年后廖威达站在北镇抚司门前' },
    tone: 'quiet',
    paragraphs: [
      { kind: 'prose', text: '十五年后，你在北镇抚司的偏房里醒来。旧伤在阴雨天仍会发紧，少年时留下的半截断刀被你用布包着，藏在床板下面；那一夜的许多事，你始终想不明白。' },
      { kind: 'prose', text: '你穿上锦衣卫的飞鱼服，系紧腰带，第一次以自己的名字走到北镇抚司门前。门房只看了一眼腰牌便放行，没人知道你曾从一座着火的宅子里爬出来。' },
      { kind: 'monologue', text: '没人知道你为什么盯着那把旧刀。你记得母亲的噤声手势，记得父亲说过的两道门闩；至于那场火为何烧到家中，你只知道答案还在很远的地方。' },
    ],
  },
]
