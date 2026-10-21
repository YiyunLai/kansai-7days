// 關西七日帖・行程資料
// 改行程：DAYS；改景點文字：SPOTS；改座標／Google 搜尋名稱／維基條目：GEO
const SPOTS = {
  tpe:   { name: "臺灣桃園國際機場", short: "桃園機場", seal: "桃園", addr: "TPE",
           tip: "去程星宇 JX1834（08:05→11:45，2 小時 40 分），回程 JX1835（12:45→14:45，3 小時）。回程多 20 分鐘，因為往西飛要逆著冬季的西風噴流。" },
  ukb:   { name: "神戶機場", short: "神戶機場", seal: "空港", addr: "1 Kobekuko, Chuo Ward, Kobe, Hyogo 650-0048", x: 205, y: 486,
           tip: "2006 年開港，蓋在港島南邊的人工島上。往市區搭無人駕駛的 Port Liner（ポートライナー），終點就是三宮。" },
  station:{ name: "Train Station", short: "車站", seal: "驛", addr: "兵庫縣 神戶市 中央區", x: 190, y: 384,
           tip: "Funliday 上這站沒寫站名，只標在中央區。從神戶機場來回，最可能是 Port Liner 的車站。Port Liner 1981 年通車，是日本最早一批無人駕駛的新交通系統（AGT）。" },
  nankin:{ name: "南京町 中華街", short: "南京町", seal: "南京町", addr: "1 Chome-3-18 Sakaemachidori, Chuo Ward, Kobe, Hyogo 650-0023", x: 86, y: 412,
           tip: "日本三大中華街之一，另外兩個在橫濱和長崎。1868 年神戶開港後，華人在居留地西側聚居而形成。" },
  daimaru:{ name: "大丸神戶店", short: "大丸", seal: "大丸", addr: "40 Akashimachi, Chuo Ward, Kobe, Hyogo 650-0037", x: 128, y: 405,
           tip: "位在「舊居留地」，開港時期劃給外國人住的區域。附近還留著不少明治到昭和初期的西洋建築，晚上點燈很好拍。" },
  hotel: { name: "Apartment Hotel 11 Kōbe Motomachi", short: "飯店", seal: "元町", addr: "神戶 元町一帶（自訂）", x: 52, y: 390,
           tip: "神戶這幾晚的基地。第 1 天 20:00 入住，第 3 天早上 09:00 出發去新神戶站搭新幹線。" },
  azur:  { name: "Azur Maiko", short: "舞子海灘", seal: "舞子濱", addr: "11 Kaigandori, Tarumi-ku, Kobe, Hyogo 655-0036", x: 72, y: 476,
           tip: "人工海灘，正對明石海峽大橋，是拍大橋全景的好位置。" },
  maiko: { name: "舞子海上散步道", short: "海上散步道", seal: "舞子", addr: "2051 Higashimaikocho, Tarumi Ward, Kobe, Hyogo 655-0047", x: 52, y: 452,
           tip: "藏在大橋橋身裡的展望步道，離海面約 47 公尺，中間有一段玻璃地板，腳下就是海峽。" },
  bridge:{ name: "明石海峽大橋 塔頂體驗", short: "大橋塔頂", seal: "明石", addr: "Higashimaikocho, Tarumi-ku, Kobe, Hyogo 655-0047", x: 22, y: 492,
           tip: "1998 年通車，中央跨距 1,991 公尺，曾是世界最長的吊橋（2022 年被土耳其的恰納卡萊 1915 大橋超越）。導覽會爬上主塔，塔高約 300 公尺。" },
  meriken:{ name: "美利堅公園", short: "美利堅公園", seal: "港塔", addr: "2 Hatobacho, Chuo Ward, Kobe, Hyogo 650-0042", x: 166, y: 446,
           tip: "紅色的神戶港塔 1963 年完工，高 108 公尺。旁邊的「神戶港地震紀念公園」保留了 1995 年阪神大地震時崩壞的碼頭原貌。" },
  umie:  { name: "神戶臨海樂園 umie", short: "umie", seal: "臨海", addr: "1 Chome-7-2 Higashikawasakicho, Chuo Ward, Kobe, Hyogo 650-0044", x: 108, y: 450,
           tip: "整個 Harborland 原本是國鐵的湊川貨物站，貨運站廢止後才改建成購物和娛樂區。逛街的地方，以前是調車場。" },
  ekizo: { name: "EKIZO 神戶三宮", short: "EKIZO", seal: "三宮", addr: "4 Chome-2-1 Kanocho, Chuo Ward, Kobe, Hyogo 650-0001", x: 136, y: 370,
           tip: "阪急神戶三宮站高架下的商店街，下了車不用出站就能逛。" },
  maya:  { name: "摩耶纜車站", short: "摩耶纜車", seal: "摩耶", addr: "Mayasan, Nada Ward, Kobe, Hyogo 657-0105", x: 136, y: 334,
           tip: "摩耶纜車（摩耶ケーブル）1925 年開業，是上摩耶山的第一段。坐到「虹の駅」後轉空中纜車。" },
  niji:  { name: "虹の駅（Ropeway）", short: "虹の駅", seal: "虹", addr: "Harada, 灘區神戶市兵庫縣 657-0802", x: 160, y: 312,
           tip: "地面纜車和空中纜車（ロープウェー）的轉乘站。空中纜車從這裡一路上到山頂的「星の駅」。" },
  kikusei:{ name: "掬星台", short: "掬星台", seal: "掬星", addr: "2-2 Mayasancho, Nada Ward, Kobe, Hyogo 657-0105", x: 188, y: 290, game: "A",
           tip: "名字的意思是「伸手就能捧起星星」。從這裡看的神戶夜景，屬於日本三大夜景（函館、神戶、長崎）。" },
  shinkobe:{ name: "新神戶站", short: "新神戶", seal: "新神戶", addr: "神戶市中央區（山陽新幹線）", x: 92, y: 346,
           tip: "1972 年隨山陽新幹線開業。月台夾在六甲隧道和神戶隧道之間，車站整個貼著山壁。" },
  kyotost:{ name: "京都車站", short: "京都車站", seal: "京都驛", addr: "京都府京都市下京區", x: 104, y: 142,
           tip: "現在的車站大樓 1997 年完工，由建築師原廣司設計，大階梯可以一路走到屋頂。對面是 1964 年的京都塔，高 131 公尺。" },
  fushimi:{ name: "伏見稻荷大社", short: "伏見稻荷", seal: "稻荷", addr: "京都府京都市伏見區", x: 196, y: 164, game: "B",
           tip: "全日本約三萬座稻荷神社的總本宮。千本鳥居每一座都是信眾奉納的，背面刻著奉納者的名字和日期。" },
  kamo:  { name: "鴨川", short: "鴨川", seal: "鴨川", addr: "日本京都府京都市", x: 183, y: 94,
           tip: "鴨川「等間隔情侶」法則：坐在河岸的人會自動保持差不多相同的距離。去的時候可以觀察看看。" },
  rail:  { name: "京都鐵道博物館", short: "鐵道博物館", seal: "鐵道", addr: "Kankijicho, 下京區京都市京都府 600-8835", x: 44, y: 118,
           tip: "2016 年開館。館內的梅小路扇形車庫 1914 年建成，是國家重要文化財，現在還能搭蒸汽火車「SL Steam 號」。" },
  nishiki:{ name: "錦市場", short: "錦市場", seal: "錦", addr: "京都市中京區 錦小路通（寺町通～高倉通）", x: 122, y: 60, game: "C",
           tip: "有「京都廚房」之稱。一條約 400 公尺長的窄巷擠了上百家店。很多店家請客人不要邊走邊吃，買了就在店門口吃完再走。" },
  gosho: { name: "京都御所", short: "京都御所", seal: "御所", addr: "京都府京都市上京區", x: 62, y: 38,
           tip: "1869 年遷都東京以前天皇的住所。2016 年起改成全年開放，不用預約、免費入場。" },
  shinosaka:{ name: "新大阪站", short: "新大阪", seal: "新大阪", addr: "大阪府大阪市淀川區西中島五丁目", x: 152, y: 206,
           tip: "1964 年東海道新幹線開業時的終點站。往東歸 JR 東海、往西的山陽新幹線歸 JR 西日本，新大阪就是兩家的分界。" },
  osaka: { name: "大阪 自由日", short: "第 6 天", seal: "", addr: "2027/2/25（週四）", x: 92, y: 236, unknown: true,
           tip: "Funliday 上第 6 天還沒有排景點。排好之後可以補進這張路線圖。" },
};

// Map position (lat, lng), Google Maps search name, and Wikipedia (ja) article titles used for the photo.
const GEO = {
  tpe:["25.0797,121.2342","台灣桃園國際機場",["台湾桃園国際空港"]],
  ukb:["34.6328,135.2239","神戸空港",["神戸空港"]],
  station:["34.6937,135.1952","三宮駅 ポートライナー",["ポートライナー","三宮駅 (神戸新交通)"]],
  nankin:["34.6880,135.1876","南京町 神戸",["南京町"]],
  daimaru:["34.6893,135.1877","大丸神戸店",["大丸神戸店"]],
  hotel:["34.6886,135.1840","Apartment Hotel 11 Kobe Motomachi",["元町 (神戸市)","神戸元町商店街"]],
  azur:["34.6283,135.0390","アジュール舞子",["アジュール舞子"]],
  maiko:["34.6310,135.0333","舞子海上プロムナード",["舞子海上プロムナード","舞子公園"]],
  bridge:["34.6302,135.0350","明石海峡大橋 ブリッジワールド",["明石海峡大橋"]],
  meriken:["34.6823,135.1885","メリケンパーク",["メリケンパーク","神戸ポートタワー"]],
  umie:["34.6798,135.1789","umie 神戸ハーバーランド",["神戸ハーバーランド"]],
  ekizo:["34.6950,135.1960","EKIZO 神戸三宮",["神戸三宮駅"]],
  maya:["34.7183,135.2052","摩耶ケーブル駅",["摩耶ケーブル線","摩耶山"]],
  niji:["34.7230,135.2050","虹の駅 摩耶ロープウェー",["摩耶ロープウェー","摩耶山"]],
  kikusei:["34.7279,135.2063","掬星台",["掬星台","摩耶山"]],
  shinkobe:["34.7066,135.1951","新神戸駅",["新神戸駅"]],
  kyotost:["34.9858,135.7588","京都駅",["京都駅"]],
  fushimi:["34.9671,135.7727","伏見稲荷大社",["伏見稲荷大社"]],
  kamo:["35.0060,135.7717","鴨川 三条",["鴨川 (淀川水系)"]],
  rail:["34.9875,135.7425","京都鉄道博物館",["京都鉄道博物館"]],
  nishiki:["35.0050,135.7648","錦市場",["錦市場"]],
  gosho:["35.0254,135.7621","京都御所",["京都御所"]],
  shinosaka:["34.7334,135.5001","新大阪駅",["新大阪駅"]],
  osaka:["34.6873,135.5262","大阪城",["大阪城"]],
};
Object.entries(GEO).forEach(([id, [ll, q, wiki]]) => { const [lat, lng] = ll.split(",").map(Number); Object.assign(SPOTS[id], { lat, lng, q, wiki, onMap: id !== "tpe" }); });
const S = (n, t, spot, stay, extra) => ({ k: "stop", n, t, spot, stay, ...extra });
const M = (t, dur, mode = "transit") => ({ k: "move", t, dur, mode });
const DAYS = [
  { d: 1, date: "2/20", wd: "六", go: "06:05", city: "抵達神戶", items: [
    S(1, "06:05", "tpe", "2 小時", { note: "STARLUX JX1834　08:05 → 11:45" }),
    S(2, "11:45", "ukb", "1 小時"), M("12:45", "約 11 分", "car"),
    S(3, "12:56", "station", "1 小時"), M("13:56", "約 6 分", "car"),
    S(4, "14:02", "ukb", "1 小時"), M("15:02", "約 9 分", "car"),
    S(5, "15:12", "station", "1 小時"), M("16:12", "約 13 分", "car"),
    S(6, "16:25", "nankin", "1 小時"), M("17:25", "約 5 分", "car"),
    S(7, "17:30", "daimaru", "1 小時"), M("18:30", "約 3 分", "car"),
    S(8, "20:00", "hotel", "4 小時（自訂）") ] },
  { d: 2, date: "2/21", wd: "日", go: "10:00", city: "明石海峽・摩耶山", items: [
    S(9, "00:00", "hotel", "10 小時（自訂）"), M("10:00", "約 43 分"),
    S(10, "10:43", "azur", "1 小時"), M("11:43", "約 13 分"),
    S(11, "11:56", "maiko", "1 小時"), M("12:56", "約 4 分"),
    S(12, "13:00", "bridge", "1 小時"), M("14:00", "約 41 分"),
    S(13, "14:41", "meriken", "1 小時"), M("15:41", "約 10 分"),
    S(14, "15:51", "umie", "1 小時"), M("16:51", "約 20 分"),
    S(15, "17:11", "ekizo", "1 小時"), M("18:11", "約 25 分"),
    S(16, "18:36", "maya", "1 小時"), M("19:36", "約 5 分"),
    S(17, "19:41", "niji", "1 小時"), M("20:41", "約 5 分"),
    S(18, "20:46", "kikusei", "1 小時"), M("21:46", "約 2 小時 59 分"),
    S(19, "23:00", "hotel", "1 小時（自訂）") ] },
  { d: 3, date: "2/22", wd: "一", go: "08:00", city: "神戶 → 京都", items: [
    S(20, "00:00", "hotel", "9 小時（自訂）"), M("09:00", "約 21 分"),
    S(21, "09:21", "shinkobe", "10 分"), M("09:31", "約 33 分"),
    S(22, "10:04", "kyotost", "15 分"), M("10:19", "約 12 分"),
    S(23, "10:31", "fushimi", "1 小時"), M("11:31", "約 22 分"),
    S(24, "11:53", "kamo", "1 小時") ] },
  { d: 4, date: "2/23", wd: "二", go: "08:00", city: "京都", items: [
    S(25, "08:00", "rail", "4 小時"), M("12:00", "約 40 分"),
    S(26, "12:40", "nishiki", "1 小時") ] },
  { d: 5, date: "2/24", wd: "三", go: "08:00", city: "京都 → 大阪", items: [
    S(27, "08:00", "gosho", "1 小時"), M("09:00", "約 25 分"),
    S(28, "09:25", "kyotost", "15 分"), M("09:40", "約 30 分"),
    S(29, "10:10", "shinosaka", "12 分") ] },
  { d: 6, date: "2/25", wd: "四", go: "—", city: "大阪", items: [] },
  { d: 7, date: "2/26", wd: "五", go: "10:45", city: "歸途", items: [
    S(30, "10:45", "ukb", "2 小時", { note: "STARLUX JX1835　12:45 → 14:45" }),
    S(31, "14:45", "tpe", "1 小時") ] },
];
const STOPS = DAYS.flatMap(d => d.items.filter(i => i.k === "stop").map(i => ({ ...i, day: d })));
const MAP_IDS = Object.keys(SPOTS).filter(id => SPOTS[id].onMap && !SPOTS[id].unknown);

const GAMES = {
  A: { k: "星", name: "掬星台・接星星", spot: "kikusei", desc: "左右拖曳，接住神戶夜空落下的星星。雲會扣分，限時 30 秒。" },
  B: { k: "鳥", name: "千本鳥居・號誌時相", spot: "fushimi", desc: "指針走進朱色鳥居（綠燈時相）時點一下。共 10 座，一座比一座窄。" },
  C: { k: "錦", name: "錦市場・採買", spot: "nishiki", desc: "記住清單，再從攤位裡挑出來。共 5 回合。" },
};

// 六位成員：名字可在 config.js 的 members 改
const MEMBERS = [
  { id: "m1", name: "成員一", vehicle: "shinkansen", role: "路網規劃師", note: "排路線、看時刻表，負責讓大家趕上新幹線。", color: "#1f5aa6" },
  { id: "m2", name: "成員二", vehicle: "tram",       role: "號誌控制員", note: "決定什麼時候走、什麼時候停，掌握全團節奏。", color: "#17714a" },
  { id: "m3", name: "成員三", vehicle: "ropeway",    role: "高程測量員", note: "爬塔頂、上摩耶山，負責從高處拍全景。", color: "#d23a2c" },
  { id: "m4", name: "成員四", vehicle: "taxi",       role: "轉乘導航員", note: "地鐵出口、轉乘月台，跟著他不會迷路。", color: "#2a2c2f" },
  { id: "m5", name: "成員五", vehicle: "bus",        role: "補給站站長", note: "南京町、錦市場，路線上的每個攤位都記得。", color: "#c7951a" },
  { id: "m6", name: "成員六", vehicle: "plane",      role: "運量稽核員", note: "管預算、算行李重量，回程不超重。", color: "#6b4fa0" },
];
(window.KANSAI_CONFIG?.members || []).forEach((n, i) => { if (MEMBERS[i] && n) Object.assign(MEMBERS[i], typeof n === "string" ? { name: n } : n); });
