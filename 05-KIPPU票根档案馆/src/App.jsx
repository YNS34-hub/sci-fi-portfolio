import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArchiveBoxIcon,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDots,
  Check,
  MapPinLine,
  Minus,
  Plus,
  Printer,
  Ticket,
  TrainRegional,
  X,
} from "@phosphor-icons/react";

const routes = [
  {
    id: "rail",
    line: "T247",
    from: "上海",
    to: "乌鲁木齐",
    english: "SHANGHAI / ÜRÜMQI",
    gate: "07",
    seat: "06车 12A",
    fare: "¥385.00",
  },
  {
    id: "ferry",
    line: "F03",
    from: "厦门",
    to: "鼓浪屿",
    english: "XIAMEN / KULANGSU",
    gate: "03",
    seat: "上层 08",
    fare: "¥35.00",
  },
  {
    id: "tram",
    line: "11路",
    from: "西关",
    to: "海珠",
    english: "XIGUAN / HAIZHU",
    gate: "B1",
    seat: "普通",
    fare: "¥2.00",
  },
];

const dates = [
  { id: "fri", day: "08.14", time: "19:42", code: "FRI" },
  { id: "sat", day: "08.15", time: "07:06", code: "SAT" },
  { id: "sun", day: "08.16", time: "16:30", code: "SUN" },
];

const paperColors = [
  { id: "yellow", label: "信号黄", value: "#ffc83d" },
  { id: "pink", label: "验票红", value: "#ff5d55" },
  { id: "mint", label: "印章绿", value: "#82d9b8" },
];

const archiveItems = [
  {
    id: "a1",
    category: "铁路",
    title: "武广高速铁路红色纸票",
    year: "2010",
    origin: "武汉",
    destination: "广州南",
    serial: "G1001 / 051013",
    color: "#ffc83d",
    image: "/media/china-paper-ticket.jpg",
    story:
      "一张武汉至广州南的红色软纸票。细密底纹、二维检验码与手工剪口同时留在票面上，记录了纸质客票向数字核验过渡的时刻。",
    condition: "扫描清晰；右侧剪口完整可见",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:China-Railway-Ticket-Paper-Normal.jpg",
  },
  {
    id: "a2",
    category: "城市",
    title: "圣坦曼尼铁路渡轮往返票",
    year: "1915",
    origin: "Covington",
    destination: "Mandeville",
    serial: "ROUND TRIP / 18876",
    color: "#82d9b8",
    image: "/media/trolley-ticket-1915.jpg",
    story:
      "这张 1915 年的往返票把日期围在四边，售票员通过冲孔确认乘车日与月份。蓝、红双色印刷和三个真实孔洞，让一次短途出发拥有了机械节奏。",
    condition: "纸张泛黄；三处冲孔与折痕稳定",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:StTammanyTrolleyTicket1915.jpg",
  },
  {
    id: "a3",
    category: "演出",
    title: "基辅歌剧院四联票",
    year: "2007",
    origin: "二层包厢",
    destination: "7排 14座",
    serial: "OPERA / 000033",
    color: "#ff5d55",
    image: "/media/opera-tickets.jpg",
    story:
      "四张来自 2007 年不同演出的歌剧院票据，被同一座建筑的小幅图像串联。票角、座位与存根各不相同，像四次并排保存的夜晚。",
    condition: "边缘磨损；蓝色日期章可辨",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/Category:Tickets",
  },
  {
    id: "a4",
    category: "城市",
    title: "都柏林 C.I.E. 巴士票",
    year: "年代待考",
    origin: "起点未印",
    destination: "终点未印",
    serial: "CIE / 0990 / 2045",
    color: "#bcd8ff",
    image: "/media/dublin-bus-ticket.jpg",
    story:
      "票面只留下公司缩写、票号与紫色油墨，起讫站栏没有填写。档案选择保留这种不完整：有些旅程只剩下票价与一次被检验的痕迹。",
    condition: "纸张粗糙；紫墨有轻微渗化",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dublin_C.I.E._bus_ticket_0990.jpg",
  },
  {
    id: "a5",
    category: "铁路",
    title: "圣塔菲铁路年度通行证",
    year: "1923",
    origin: "Eastern Lines",
    destination: "Western Lines",
    serial: "PASS / 9184",
    color: "#ff9cad",
    image: "/media/train-ticket-1923.jpg",
    story:
      "一张签发给当地法律顾问的 1923 年年度通行证，可在圣塔菲铁路东西线路间使用。打字、铅印与两枚亲笔签名叠在同一块米色纸板上。",
    condition: "折角明显；签名与红色编号清晰",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:1923_train_ticket.jpg",
  },
  {
    id: "a6",
    category: "铁路",
    title: "宁汉动车蓝色磁介质票",
    year: "2010",
    origin: "南京",
    destination: "汉口",
    serial: "D3052 / 16-016",
    color: "#8ea7ff",
    image: "/media/china-magnetic-ticket.jpg",
    story:
      "南京至汉口的蓝色磁介质车票，票面仍保留和谐号标识。右侧检票口已被剪开，二维码、车次、座席与票价形成一套紧凑的信息秩序。",
    condition: "蓝色底纹均匀；右侧剪口可见",
    source: "Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:China-Railway-Ticket-Magnetic-Normal.jpg",
  },
];

const restorationQueue = archiveItems.slice(0, 3);

function useHashPage() {
  const readPage = () => {
    const hash = window.location.hash.replace("#/", "").split("?")[0];
    return ["archive", "visit"].includes(hash) ? hash : "home";
  };
  const [page, setPage] = useState(readPage);

  useEffect(() => {
    const handleHash = () => {
      setPage(readPage());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  return page;
}

function AppNav({ page, savedCount }) {
  const links = [
    { id: "home", label: "首页", href: "#/" },
    { id: "archive", label: "馆藏", href: "#/archive" },
    { id: "visit", label: "到访", href: "#/visit" },
  ];

  return (
    <>
      <aside className="museum-rail" aria-label="票根档案馆标识">
        <a href="#/" className="rail-mark" aria-label="KIPPU 首页">
          KIPPU
        </a>
        <div className="punch-line" aria-hidden="true">
          {Array.from({ length: 7 }).map((_, index) => (
            <i key={index} />
          ))}
        </div>
        <span className="rail-number">馆藏 37,428</span>
      </aside>
      <header className="site-header">
        <a className="mobile-brand" href="#/">
          KIPPU
        </a>
        <nav aria-label="主导航">
          {links.map((link) => (
            <a
              key={link.id}
              className={page === link.id ? "is-active" : ""}
              href={link.href}
            >
              <span>{link.label}</span>
              <i aria-hidden="true" />
            </a>
          ))}
        </nav>
        <a className="saved-pocket" href="#/archive" aria-label={`临时票夹，共 ${savedCount} 张`}>
          <Ticket size={19} weight="fill" />
          <span>票夹</span>
          <b>{String(savedCount).padStart(2, "0")}</b>
        </a>
      </header>
    </>
  );
}

function TicketFace({ route, date, paper, serial = "KPU-260814-037" }) {
  return (
    <div className="ticket-face" style={{ "--ticket-paper": paper.value }}>
      <div className="ticket-main">
        <div className="ticket-kicker">
          <span>准许一次出发</span>
          <span>{serial}</span>
        </div>
        <div className="ticket-route">
          <div>
            <strong>{route.from}</strong>
            <small>FROM</small>
          </div>
          <div className="route-rule" aria-hidden="true">
            <TrainRegional size={30} weight="fill" />
          </div>
          <div>
            <strong>{route.to}</strong>
            <small>TO</small>
          </div>
        </div>
        <div className="ticket-english">{route.english}</div>
        <div className="ticket-fields">
          <div>
            <small>日期 DATE</small>
            <b>{date.day}</b>
          </div>
          <div>
            <small>时间 TIME</small>
            <b>{date.time}</b>
          </div>
          <div>
            <small>座位 SEAT</small>
            <b>{route.seat}</b>
          </div>
        </div>
        <div className="ticket-foot">
          <span>保存这张纸，也保存它允许你去往的地方。</span>
          <b>{route.fare}</b>
        </div>
      </div>
      <div className="ticket-stub">
        <span className="stub-line">{route.line}</span>
        <span className="stub-gate">GATE<br /><b>{route.gate}</b></span>
        <span className="barcode" aria-hidden="true" />
        <span className="stub-code">{date.code} / KPU</span>
      </div>
    </div>
  );
}

function TicketBack({ route, date, paper }) {
  return (
    <div className="ticket-back" style={{ "--ticket-paper": paper.value }}>
      <div className="ticket-back-copy">
        <span>KIPPU ARCHIVE / PERSONAL ISSUE</span>
        <strong>请把旅途写在背面</strong>
        <div className="memory-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <small>THIS TICKET IS A MEMORY OBJECT — NOT VALID FOR TRAVEL</small>
      </div>
      <div className="ticket-back-stamp" aria-hidden="true">
        <span>{route.line}</span>
        <b>{date.day}</b>
        <small>已出发</small>
      </div>
      <div className="ticket-back-code">
        <span>{route.english}</span>
        <b>KPU / 26 / 0814 / 037</b>
      </div>
    </div>
  );
}

function TicketBuilder({ onGenerate }) {
  const [routeId, setRouteId] = useState(routes[0].id);
  const [dateId, setDateId] = useState(dates[0].id);
  const [paperId, setPaperId] = useState(paperColors[0].id);
  const [isFlipped, setIsFlipped] = useState(false);
  const previewRef = useRef(null);

  const route = routes.find((item) => item.id === routeId);
  const date = dates.find((item) => item.id === dateId);
  const paper = paperColors.find((item) => item.id === paperId);

  const handlePointerMove = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    previewRef.current?.style.setProperty("--rotate-x", `${y * -5}deg`);
    previewRef.current?.style.setProperty("--rotate-y", `${x * 7}deg`);
  };

  const resetTilt = () => {
    previewRef.current?.style.setProperty("--rotate-x", "0deg");
    previewRef.current?.style.setProperty("--rotate-y", "0deg");
  };

  return (
    <div className="builder">
      <div
        className="builder-preview"
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
      >
        <div className="registration-cross registration-cross--one" aria-hidden="true" />
        <div className="registration-cross registration-cross--two" aria-hidden="true" />
        <div className="preview-plane" ref={previewRef}>
          <div className={isFlipped ? "ticket-volume is-flipped" : "ticket-volume"}>
            <div className="ticket-side ticket-side--front">
              <TicketFace route={route} date={date} paper={paper} />
            </div>
            <div className="ticket-side ticket-side--back">
              <TicketBack route={route} date={date} paper={paper} />
            </div>
          </div>
        </div>
        <button
          className="ticket-flip"
          type="button"
          onClick={() => setIsFlipped((value) => !value)}
          aria-pressed={isFlipped}
        >
          <span>{isFlipped ? "返回票面" : "查看票背"}</span>
          <i aria-hidden="true">↻</i>
        </button>
      </div>
      <div className="builder-controls">
        <fieldset>
          <legend>选择路线</legend>
          <div className="route-options">
            {routes.map((item) => (
              <label className={routeId === item.id ? "is-selected" : ""} key={item.id}>
                <input
                  type="radio"
                  name="route"
                  value={item.id}
                  checked={routeId === item.id}
                  onChange={(event) => setRouteId(event.target.value)}
                />
                <span>{item.from}</span>
                <ArrowRight size={15} />
                <span>{item.to}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>出发日</legend>
          <div className="date-options">
            {dates.map((item) => (
              <label className={dateId === item.id ? "is-selected" : ""} key={item.id}>
                <input
                  type="radio"
                  name="date"
                  value={item.id}
                  checked={dateId === item.id}
                  onChange={(event) => setDateId(event.target.value)}
                />
                <span>{item.day}</span>
                <small>{item.time}</small>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>票纸</legend>
          <div className="paper-options">
            {paperColors.map((item) => (
              <label key={item.id} title={item.label}>
                <input
                  type="radio"
                  name="paper"
                  value={item.id}
                  checked={paperId === item.id}
                  onChange={(event) => setPaperId(event.target.value)}
                />
                <i style={{ backgroundColor: item.value }} />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button
          className="print-button"
          type="button"
          onClick={() => onGenerate({ route, date, paper })}
        >
          <Printer size={21} weight="bold" />
          生成我的票根
          <span>免费</span>
        </button>
      </div>
    </div>
  );
}

function HomePage({ onGenerate }) {
  return (
    <div className="page page--home">
      <section className="home-intro">
        <div className="intro-copy">
          <p>一张票，被设计来使用一次。</p>
          <h1>
            KEEP
            <br />
            THE STUB
          </h1>
        </div>
        <div className="intro-note">
          <strong>保留一次出发</strong>
          <p>
            KIPPU 保存那些曾经允许我们上车、入场与抵达的小纸片，也保存它们背后的普通日子。
          </p>
          <a href="#/archive">
            翻看 37,428 张馆藏
            <ArrowDown size={17} />
          </a>
        </div>
      </section>

      <section className="ticket-workbench" aria-labelledby="builder-title">
        <div className="workbench-title">
          <span>用今天的日期，做一张不会过期的票</span>
          <h2 id="builder-title">票根排版机</h2>
        </div>
        <TicketBuilder onGenerate={onGenerate} />
      </section>

      <section className="restoration">
        <div className="restoration-heading">
          <div>
            <span>修复台当前状态</span>
            <h2>三张纸，三种慢慢消失的方式。</h2>
          </div>
          <a className="arrow-link" href="#/archive">
            查看全部馆藏
            <ArrowUpRight size={20} />
          </a>
        </div>
        <div className="restoration-list">
          {restorationQueue.map((item, index) => (
            <a href={`#/archive?item=${item.id}`} className="restoration-row" key={item.id}>
              <span className="restore-index">{String(index + 1).padStart(2, "0")}</span>
              <div className="restore-image">
                <img src={item.image} alt="" />
              </div>
              <div className="restore-name">
                <small>{item.year} · {item.category}</small>
                <strong>{item.title}</strong>
              </div>
              <p>{item.condition}</p>
              <ArrowUpRight size={22} />
            </a>
          ))}
        </div>
      </section>

      <section className="museum-now">
        <div className="now-poster">
          <div className="poster-kicker">
            <span>临时展览</span>
            <span>08.01—10.18</span>
          </div>
          <div className="poster-type">
            <span>这张票</span>
            <strong>还能<br />带我去哪？</strong>
          </div>
          <div className="poster-punch" aria-hidden="true" />
        </div>
        <div className="now-copy">
          <span>馆里正在发生</span>
          <h2>关于纸张、通行权与一段已经结束的路。</h2>
          <p>
            136 张失效票据，按它们曾经打开的门重新排列。展览包含可触摸复制件、口述录音与儿童打孔台。
          </p>
          <dl>
            <div>
              <dt>地点</dt>
              <dd>杭州 · 拱宸桥东</dd>
            </div>
            <div>
              <dt>开放</dt>
              <dd>周三至周日 10:00—18:00</dd>
            </div>
          </dl>
          <a className="solid-link" href="#/visit">
            安排到访
            <ArrowRight size={19} />
          </a>
        </div>
      </section>
    </div>
  );
}

function ArchiveTicket({ item, onOpen }) {
  return (
    <button
      className="archive-ticket"
      type="button"
      style={{ "--archive-paper": item.color }}
      onClick={() => onOpen(item)}
      aria-label={`查看 ${item.title}`}
    >
      <div className="archive-ticket-image">
        <img src={item.image} alt="" />
        <span>{item.year}</span>
      </div>
      <div className="archive-ticket-copy">
        <span className="archive-category">{item.category}</span>
        <h3>{item.title}</h3>
        <div className="mini-route">
          <strong>{item.origin}</strong>
          <i />
          <strong>{item.destination}</strong>
        </div>
        <span className="serial">{item.serial}</span>
      </div>
      <div className="archive-open">
        <Plus size={22} weight="bold" />
      </div>
    </button>
  );
}

function ArchivePage({ initialItem, onClearInitial }) {
  const [filter, setFilter] = useState("全部");
  const [selectedItem, setSelectedItem] = useState(initialItem);
  const categories = ["全部", ...new Set(archiveItems.map((item) => item.category))];
  const filtered = useMemo(
    () => (filter === "全部" ? archiveItems : archiveItems.filter((item) => item.category === filter)),
    [filter],
  );

  useEffect(() => {
    if (initialItem) setSelectedItem(initialItem);
  }, [initialItem]);

  const closeDetail = () => {
    setSelectedItem(null);
    onClearInitial();
  };

  return (
    <div className="page page--archive">
      <section className="archive-head">
        <div>
          <span>实体馆藏截至 2026.07</span>
          <h1>
            37,428
            <small>枚普通日子的证据</small>
          </h1>
        </div>
        <p>
          一张票不只记录去向。折痕说明它曾放在哪个口袋，剪口说明谁检查过它，褪色说明它见过多久的光。
        </p>
      </section>

      <div className="filter-bar" aria-label="筛选馆藏">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={filter === category ? "is-active" : ""}
            onClick={() => setFilter(category)}
          >
            {category}
            <span>
              {category === "全部"
                ? archiveItems.length
                : archiveItems.filter((item) => item.category === category).length}
            </span>
          </button>
        ))}
      </div>

      <section className="archive-catalog" aria-live="polite">
        {filtered.map((item) => (
          <ArchiveTicket key={item.id} item={item} onOpen={setSelectedItem} />
        ))}
      </section>

      <section className="donate-strip">
        <ArchiveBoxIcon size={48} weight="duotone" />
        <div>
          <span>你的抽屉里也有一段路吗？</span>
          <h2>我们接收票据，也接收关于它的记忆。</h2>
        </div>
        <a href="mailto:archive@kippu.cn">
          了解捐赠流程
          <ArrowUpRight size={19} />
        </a>
      </section>

      <div className={selectedItem ? "detail-backdrop is-open" : "detail-backdrop"} onClick={closeDetail} />
      <aside className={selectedItem ? "archive-detail is-open" : "archive-detail"} aria-hidden={!selectedItem}>
        {selectedItem && (
          <>
            <button className="detail-close" type="button" onClick={closeDetail} aria-label="关闭馆藏详情">
              <X size={24} />
            </button>
            <div className="detail-image">
              <img src={selectedItem.image} alt={`${selectedItem.title}馆藏扫描`} />
            </div>
            <span className="archive-category">{selectedItem.category} · {selectedItem.year}</span>
            <h2>{selectedItem.title}</h2>
            <div className="detail-route">
              <strong>{selectedItem.origin}</strong>
              <ArrowRight size={19} />
              <strong>{selectedItem.destination}</strong>
            </div>
            <p>{selectedItem.story}</p>
            <dl>
              <div>
                <dt>馆藏号</dt>
                <dd>{selectedItem.serial}</dd>
              </div>
              <div>
                <dt>当前状态</dt>
                <dd>{selectedItem.condition}</dd>
              </div>
            </dl>
            <a
              className="source-link"
              href={selectedItem.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              图像来源：{selectedItem.source}
              <ArrowUpRight size={16} />
            </a>
            <a href="#/visit" className="solid-link">
              预约查看原件
              <ArrowRight size={19} />
            </a>
          </>
        )}
      </aside>
    </div>
  );
}

function VisitPage() {
  const [people, setPeople] = useState(1);
  const [workshop, setWorkshop] = useState("纸张修复入门");
  const [booked, setBooked] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setBooked(true);
  };

  return (
    <div className="page page--visit">
      <section className="visit-hero">
        <div className="visit-title">
          <span>杭州 · 拱宸桥东</span>
          <h1>来馆里，摸一张时间留下的纸。</h1>
        </div>
        <div className="visit-board">
          <div className="board-row board-row--head">
            <span>星期</span>
            <span>开放</span>
            <span>最后入场</span>
            <span>状态</span>
          </div>
          {[
            ["周一 / 周二", "闭馆修复", "—", "休息"],
            ["周三 / 周四", "10:00—18:00", "17:15", "可到访"],
            ["周五", "10:00—20:30", "19:45", "夜场"],
            ["周六 / 周日", "10:00—18:00", "17:15", "可到访"],
          ].map((row) => (
            <div className="board-row" key={row[0]}>
              {row.map((cell) => <span key={cell}>{cell}</span>)}
            </div>
          ))}
        </div>
      </section>

      <section className="arrival-map">
        <div className="map-copy">
          <span>从地铁口到馆门，步行六分钟</span>
          <h2>沿着运河走，不要穿过商场。</h2>
          <p>
            地铁 5 号线拱宸桥东站 B 口出站，看到旧粮仓后向北。蓝色门与一排圆形验票孔，就是入口。
          </p>
          <a href="https://maps.google.com" target="_blank" rel="noreferrer">
            在地图中打开
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div className="map-diagram" aria-label="从拱宸桥东站到票根档案馆的步行路线示意">
          <div className="canal">京杭大运河</div>
          <div className="map-route-line" />
          <span className="map-node map-node--start"><b>B</b> 地铁口</span>
          <span className="map-node map-node--turn">旧粮仓</span>
          <span className="map-node map-node--end"><MapPinLine size={25} weight="fill" /> KIPPU</span>
          <div className="map-grid" aria-hidden="true" />
        </div>
      </section>

      <section className="workshop">
        <div className="workshop-copy">
          <span>每周末，六个位置</span>
          <h2>让一张旧票再活久一点。</h2>
          <p>
            修复师带你完成干洗、展平与无酸封装。可以带自己的票，也可以使用馆内练习件。材料均包含在预约中。
          </p>
          <ul>
            <li>时长 110 分钟</li>
            <li>适合 14 岁以上</li>
            <li>无需修复经验</li>
          </ul>
        </div>
        <form className="visit-form" onSubmit={handleSubmit}>
          {booked ? (
            <div className="booked-state" aria-live="polite">
              <span><Check size={30} weight="bold" /></span>
              <h3>预约已记录</h3>
              <p>
                {workshop} · {people} 人。确认邮件与材料清单将在十分钟内发出。
              </p>
              <button type="button" onClick={() => setBooked(false)}>再约一场</button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <CalendarDots size={28} weight="duotone" />
                <strong>预约周末修复工坊</strong>
              </div>
              <label>
                <span>内容</span>
                <select value={workshop} onChange={(event) => setWorkshop(event.target.value)}>
                  <option>纸张修复入门</option>
                  <option>热敏票数字化</option>
                  <option>家庭票据建档</option>
                </select>
              </label>
              <label>
                <span>场次</span>
                <select required defaultValue="">
                  <option value="" disabled>选择一个场次</option>
                  <option>8 月 15 日 周六 14:00</option>
                  <option>8 月 16 日 周日 10:30</option>
                  <option>8 月 22 日 周六 14:00</option>
                </select>
              </label>
              <div className="people-field">
                <span>人数</span>
                <div>
                  <button
                    type="button"
                    aria-label="减少人数"
                    disabled={people === 1}
                    onClick={() => setPeople((value) => Math.max(1, value - 1))}
                  >
                    <Minus size={16} />
                  </button>
                  <strong>{people}</strong>
                  <button
                    type="button"
                    aria-label="增加人数"
                    disabled={people === 6}
                    onClick={() => setPeople((value) => Math.min(6, value + 1))}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <label>
                <span>联系邮箱</span>
                <input type="email" required placeholder="name@example.com" />
              </label>
              <button className="book-workshop" type="submit">
                预约工坊 · ¥168 / 人
                <ArrowRight size={19} />
              </button>
            </>
          )}
        </form>
      </section>

      <section className="visit-faq">
        <div>
          <span>到访前</span>
          <h2>几个常见问题</h2>
        </div>
        <div className="faq-list">
          <details>
            <summary>可以触摸馆藏原件吗？<Plus size={18} /></summary>
            <p>常设展使用高精度复制件供触摸；原件需提前预约，并由修复师陪同查看。</p>
          </details>
          <details>
            <summary>儿童需要购票吗？<Plus size={18} /></summary>
            <p>六岁以下免票；儿童打孔台适合四岁以上使用，需由成人陪同。</p>
          </details>
          <details>
            <summary>馆内有无障碍通道吗？<Plus size={18} /></summary>
            <p>入口、展厅与洗手间均可无障碍通行；如需低位展台，请提前联系我们调整。</p>
          </details>
        </div>
      </section>
    </div>
  );
}

function TicketResultDialog({ result, onClose, onSave }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (result && !dialogRef.current?.open) dialogRef.current?.showModal();
  }, [result]);

  const close = () => {
    dialogRef.current?.close();
    onClose();
  };

  if (!result) return null;

  return (
    <dialog className="ticket-result" ref={dialogRef}>
      <button className="result-close" type="button" onClick={close} aria-label="关闭生成结果">
        <X size={24} />
      </button>
      <div className="result-copy">
        <span>排版完成</span>
        <h2>这张票不会催你出发。</h2>
        <p>它只是替今天留一张纸。保存后可在本次浏览的临时票夹中查看。</p>
      </div>
      <TicketFace route={result.route} date={result.date} paper={result.paper} />
      <button
        className="save-ticket"
        type="button"
        onClick={() => {
          onSave();
          close();
        }}
      >
        保存到临时票夹
        <ArrowRight size={19} />
      </button>
    </dialog>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-logo">KIPPU</div>
      <div className="footer-address">
        <strong>票根档案馆</strong>
        <span>杭州市拱墅区桥弄街 17 号</span>
        <span>archive@kippu.cn</span>
      </div>
      <div className="footer-links">
        <a href="#/archive">馆藏使用许可</a>
        <a href="#/visit">无障碍到访</a>
        <a href="/media/SOURCES.txt" target="_blank" rel="noreferrer">影像来源</a>
      </div>
      <div className="footer-ticket">
        <span>ADMIT ONE</span>
        <b>© 2026</b>
      </div>
    </footer>
  );
}

function App() {
  const page = useHashPage();
  const [savedCount, setSavedCount] = useState(0);
  const [ticketResult, setTicketResult] = useState(null);

  const queryItem = useMemo(() => {
    if (!window.location.hash.includes("?item=")) return null;
    const id = window.location.hash.split("?item=")[1];
    return archiveItems.find((item) => item.id === id) || null;
  }, [page]);

  return (
    <div className="app-shell">
      <AppNav page={page} savedCount={savedCount} />
      <main className="view-shell" key={page}>
        {page === "home" && <HomePage onGenerate={setTicketResult} />}
        {page === "archive" && (
          <ArchivePage
            initialItem={queryItem}
            onClearInitial={() => {
              if (window.location.hash.includes("?")) window.history.replaceState(null, "", "#/archive");
            }}
          />
        )}
        {page === "visit" && <VisitPage />}
        <SiteFooter />
      </main>
      <TicketResultDialog
        result={ticketResult}
        onClose={() => setTicketResult(null)}
        onSave={() => setSavedCount((count) => count + 1)}
      />
    </div>
  );
}

export default App;
