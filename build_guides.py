from pathlib import Path
from html import escape

OUT = Path(__file__).parent / 'guides'
OUT.mkdir(exist_ok=True)

categories = [
    {
        'slug': 'taiwan-stocks', 'index': '01', 'group': '股票市場', 'title': '台股／股票',
        'eyebrow': 'EQUITY / TAIWAN',
        'intro': '從除權息、本益比與殖利率，到基本面和技術面，建立一套不被單一指標帶走的台股研究順序。',
        'tool': ('前往複利與殖利率工具', '../tools/index.html#compound-panel'),
        'sections': [
            ('先理解股票的兩種報酬', '<p>持有股票的結果通常由價格變動與現金股利共同組成。除權息日之後，價格會依配發內容進行調整，因此不能只把配息視為額外贈品，也不能只看除息前的價格表現。</p><div class="guide-callout">研究提示：先問「總報酬是多少」，再問「配息率是多少」。高殖利率可能來自穩定的現金流，也可能只是價格下跌後的比例假象。</div>'),
            ('用三層框架讀懂標的', '<table class="guide-table"><thead><tr><th>層次</th><th>要看什麼</th><th>避免的誤區</th></tr></thead><tbody><tr><td>企業</td><td>營收、毛利、現金流、負債與產業位置</td><td>只用單季數字推論長期趨勢</td></tr><tr><td>估值</td><td>本益比、股價淨值比與同業比較</td><td>把低本益比直接等同於便宜</td></tr><tr><td>價格</td><td>趨勢、成交量、支撐與停損條件</td><td>用技術圖形取代投資假設</td></tr></tbody></table>'),
            ('除權息與高殖利率檢查單', '<p>看到殖利率時，同時檢查近年盈餘配發是否可持續、自由現金流是否支持股利，以及除權息後的填息紀律。若投資目標是現金流，還要把稅費、交易成本與再投入規則寫進試算。</p><ul><li>殖利率分母應與目前價格一致，並註明使用預估或歷史股利。</li><li>將價格報酬、現金股利與再投入分開記錄，避免重複計算。</li><li>進場前預先設定失效條件，不用配息敘事掩蓋基本面惡化。</li></ul>'),
        ]
    },
    {
        'slug': 'us-stocks', 'index': '02', 'group': '股票市場', 'title': '美股', 'eyebrow': 'EQUITY / UNITED STATES',
        'intro': '理解開戶、交易時段、三大指數與財報閱讀，讓跨市場研究不只停留在報價畫面。',
        'tool': ('前往 DCF 與安全邊際工具', '../tools/index.html#valuation-panel'),
        'sections': [
            ('從市場結構開始', '<p>美股研究至少要同時處理公司、美元與市場指數三個層次。標的價格的漲跌可能來自公司獲利預期，也可能只是利率、匯率或風險偏好的重新定價。</p><div class="guide-callout">跨市場提醒：以台幣計價的投資人，除了股票本身的報酬，還承擔美元兌台幣匯率變化。研究報酬時要清楚標記計價幣別。</div>'),
            ('三大指數的用途不同', '<table class="guide-table"><thead><tr><th>指數</th><th>研究用途</th><th>閱讀方式</th></tr></thead><tbody><tr><td>S&amp;P 500</td><td>觀察大型美國企業的廣泛市場風格</td><td>搭配產業權重與市場集中度</td></tr><tr><td>NASDAQ 100</td><td>觀察大型成長與科技股敏感度</td><td>搭配利率與估值變化</td></tr><tr><td>道瓊工業</td><td>觀察少數大型藍籌股的價格表現</td><td>不宜單獨代表整體市場</td></tr></tbody></table>'),
            ('財報閱讀順序', '<p>先看損益表的收入與利潤品質，再看資產負債表的槓桿與流動性，最後用現金流量表檢查獲利是否轉成現金。對科技與成長公司，還要追蹤股本稀釋、股票酬勞與資本支出。</p><ul><li>把公司指引與實際結果分開，避免事後解釋。</li><li>用每股數據時確認流通股數是否變化。</li><li>將 DCF 的成長率與折現率做成區間，而不是單點預測。</li></ul>'),
        ]
    },
    {
        'slug': 'etf', 'index': '03', 'group': '股票市場', 'title': 'ETF', 'eyebrow': 'PASSIVE / ETF',
        'intro': '從 0050、00919、VOO、QQQ 到債券型 ETF，先理解指數、費用與折溢價，再比較配息與總報酬。',
        'tool': ('前往 ETF 內扣費用工具', '../tools/index.html#etf-panel'),
        'sections': [
            ('ETF 不是自動分散的同義詞', '<p>ETF 是一種產品包裝，分散程度取決於追蹤指數的成分、權重與再平衡規則。高股息 ETF 可能集中在特定產業或配息風格；大盤 ETF 也可能因少數大型成分股而有顯著集中度。</p><div class="guide-callout">比較原則：用「持股數、前十大權重、產業集中度、地區與幣別」描述分散，而不是只看 ETF 三個字。</div>'),
            ('費用與交易價格', '<table class="guide-table"><thead><tr><th>項目</th><th>影響</th><th>檢查方式</th></tr></thead><tbody><tr><td>經理費與保管費</td><td>長期持有的複利拖累</td><td>轉成年度比例後放入複利試算</td></tr><tr><td>追蹤差異</td><td>實際報酬可能偏離指數</td><td>比較基金報酬與基準指數</td></tr><tr><td>折溢價</td><td>市價與淨值的短期差異</td><td>確認成交價相對於 NAV 的位置</td></tr></tbody></table>'),
            ('0050／00919 與 VOO／QQQ 的研究角度', '<p>不要把產品名稱直接當作策略。比較時先寫出目標：是市場加權、股息現金流、成長曝險，還是債券利率敏感度？接著把配息、費用、稅務、匯率與再投入規則納入同一張總報酬表。</p><ul><li>配息高不代表波動較低，也不代表總報酬較高。</li><li>海外 ETF 需額外考慮匯率、稅務與交易時段。</li><li>債券 ETF 的淨值可能受久期與信用利差共同影響。</li></ul>'),
        ]
    },
    {
        'slug': 'bonds', 'index': '04', 'group': '固定收益', 'title': '債券', 'eyebrow': 'FIXED INCOME / BONDS',
        'intro': '把票息、殖利率、價格與久期連成一張圖，理解利率變化如何穿透固定收益部位。',
        'tool': ('前往債券價格與久期工具', '../tools/index.html#bond-panel'),
        'sections': [
            ('價格與殖利率反向移動', '<p>債券的現金流在發行時大致固定，市場殖利率變動會改變這些現金流的現值，因此價格與殖利率通常呈反向關係。到期越長、久期越高，對利率變化通常越敏感。</p><div class="guide-callout">近似關係：價格變動約等於「負的修正久期 × 殖利率變動」，但實際結果還會受到凸性、信用利差與流動性影響。</div>'),
            ('殖利率曲線與倒掛', '<p>殖利率曲線把不同到期年限的殖利率放在同一張圖上。曲線倒掛代表短天期殖利率高於長天期殖利率，是市場對未來利率、景氣與風險溢酬的綜合定價，不是單一方向的交易訊號。</p><ul><li>先確認曲線使用的到期區間與資料定義。</li><li>把倒掛當作情境警示，搭配信用利差與景氣資料。</li><li>不要用倒掛時間點精準預測市場轉折。</li></ul>'),
            ('久期試算應該回答什麼', '<table class="guide-table"><thead><tr><th>問題</th><th>需要的輸入</th><th>結果用途</th></tr></thead><tbody><tr><td>目前價格</td><td>面額、票息、到期殖利率、頻率</td><td>比較市場價格與理論現值</td></tr><tr><td>利率敏感度</td><td>修正久期與殖利率變動幅度</td><td>估算部位壓力</td></tr><tr><td>收入來源</td><td>票息、資本利得與再投資</td><td>拆解總報酬而非只看票面利率</td></tr></tbody></table>'),
        ]
    },
    {
        'slug': 'funds', 'index': '05', 'group': '固定收益', 'title': '基金', 'eyebrow': 'MANAGED / FUNDS',
        'intro': '比較共同基金、主動型與被動型產品的費用、風格漂移與經理人選擇邏輯。',
        'tool': ('前往複利與費用試算', '../tools/index.html#compound-panel'),
        'sections': [
            ('共同基金的核心結構', '<p>基金把多位投資人的資金集合後，依公開說明書設定的策略持有資產。理解基金時要先分辨資產類別、區域、投資風格與申贖規則，再比較過去表現。</p><div class="guide-callout">基金績效不是經理人的單一成績單：費用、基準指數、風格曝險、現金部位與市場環境，都會影響最後的結果。</div>'),
            ('主動型與被動型如何比較', '<table class="guide-table"><thead><tr><th>面向</th><th>主動型</th><th>被動型</th></tr></thead><tbody><tr><td>目標</td><td>透過選股、配置或擇時爭取超越基準</td><td>以較低成本追蹤既定指數</td></tr><tr><td>主要風險</td><td>風格漂移、經理人更換、選股失誤</td><td>指數集中與市場系統性下跌</td></tr><tr><td>比較方式</td><td>扣費後報酬對基準與同類基金</td><td>追蹤差異與實際持有成本</td></tr></tbody></table>'),
            ('經理人與費用檢查', '<p>挑選經理人時看投資流程是否可重複、任期內策略是否一致，以及遇到回撤時是否仍遵守授權。費用則應以持有期間的總成本衡量，包含申購、經理、保管與可能的績效費。</p><ul><li>不要只用最近一年報酬排名決定長期配置。</li><li>確認基準指數與基金實際風格是否一致。</li><li>用費用差異跑長期複利情境，讓小比例成本變得可見。</li></ul>'),
        ]
    },
    {
        'slug': 'forex', 'index': '06', 'group': '宏觀與另類', 'title': '外匯', 'eyebrow': 'MACRO / FOREX',
        'intro': '由匯率報價、美元指數到換匯成本與避險，建立跨幣別資產的曝險語言。',
        'tool': ('前往交易風報比工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('匯率是相對價格', '<p>外匯報價同時描述兩種貨幣的相對價值。持有美元資產的台灣投資人，最後的台幣報酬同時受到資產價格與美元兌台幣變化影響，因此研究時要清楚區分原幣報酬與換算後報酬。</p><div class="guide-callout">先寫曝險：你是需要外幣支付、投資外幣資產，還是主動交易匯率？不同目的會導向不同的避險與持有規則。</div>'),
            ('美元指數與避險', '<p>美元指數可作為觀察美元相對一籃子貨幣的宏觀參考，但不能直接代表每一個匯率對。避險也不是免費的保險，應比較遠期、換匯點差、利率差與交易成本。</p><ul><li>把避險比例、期限與再平衡條件寫進投資政策。</li><li>外幣定存除了利率，還要估算換匯成本與匯率波動。</li><li>不要以單一美元方向預測涵蓋所有貨幣。</li></ul>'),
            ('換匯實務的成本表', '<table class="guide-table"><thead><tr><th>成本</th><th>常見來源</th><th>實務檢查</th></tr></thead><tbody><tr><td>買賣價差</td><td>銀行或平台的報價差</td><td>用同一時點比較實際成交匯率</td></tr><tr><td>轉帳與匯款</td><td>跨境匯款、入金與中轉行費用</td><td>以到帳金額計算有效成本</td></tr><tr><td>避險成本</td><td>遠期點、利率差與展期</td><td>用情境而非口號衡量</td></tr></tbody></table>'),
        ]
    },
    {
        'slug': 'commodities', 'index': '07', 'group': '宏觀與另類', 'title': '商品原物料', 'eyebrow': 'REAL ASSET / COMMODITIES',
        'intro': '掌握黃金避險、原油供需與通膨連動商品，理解現貨、期貨與金融產品的差異。',
        'tool': ('前往完整風險工具庫', '../tools/index.html#risk-panel'),
        'sections': [
            ('商品價格由供需與金融條件共同決定', '<p>原物料價格既受產能、庫存、運輸與地緣事件影響，也受美元、利率與投機部位影響。商品期貨的報價還包含到期、展期與基差，不能直接把期貨價格當作現貨投資結果。</p><div class="guide-callout">研究問題：你要追蹤的是現貨價格、期貨曲線、相關 ETF，還是企業獲利？同一個「黃金」敘事，在不同工具上會有不同風險。</div>'),
            ('黃金的避險敘事', '<p>黃金常被放在通膨、貨幣信用與危機避險的討論中，但它本身不產生固定現金流，價格可能長時間受實質利率與美元影響。配置前先定義用途與最大可接受波動。</p>'),
            ('原油與通膨連動商品', '<table class="guide-table"><thead><tr><th>主題</th><th>要觀察的變數</th><th>風險</th></tr></thead><tbody><tr><td>原油</td><td>供給、庫存、需求與期貨曲線</td><td>展期損益與事件型波動</td></tr><tr><td>通膨連動</td><td>名目利率、實質利率與通膨預期</td><td>產品結構與久期差異</td></tr><tr><td>商品 ETF</td><td>追蹤方式、抵押品與費用</td><td>追蹤差異不等於現貨報酬</td></tr></tbody></table>'),
        ]
    },
    {
        'slug': 'futures', 'index': '08', 'group': '衍生品', 'title': '期貨', 'eyebrow': 'LEVERAGED / FUTURES',
        'intro': '用保證金、契約乘數、結算與避險情境拆解槓桿，不把名目價值誤認為最大損失。',
        'tool': ('前往風報比與部位工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('期貨合約的槓桿機制', '<p>期貨交易以保證金建立對標的名目價值的曝險。保證金不是最大損失，而是履約與風險管理機制；市場不利變動時，帳戶可能需要追加資金，極端情況下損失可能超過原始保證金。</p><div class="guide-callout">交易前先算：每一點的契約價值、停損距離、最大可承擔損失與追繳緩衝，而不是先問可以開幾口。</div>'),
            ('臺指期、富台期與跨市場避險', '<p>不同契約的標的、交易時段、乘數與結算規則不同。跨市場避險要先確認兩個部位的價格聯動是否穩定，再估算基差風險、匯率風險與時間差。</p><ul><li>把契約規格和交易所公告版本存檔。</li><li>區分日盤、夜盤與結算時段的流動性。</li><li>避險比率要有失效條件，不能假設相關性永遠不變。</li></ul>'),
            ('結算日與風險檢查單', '<table class="guide-table"><thead><tr><th>檢查</th><th>核心問題</th></tr></thead><tbody><tr><td>契約</td><td>乘數、最小跳動、到期與最後交易日為何？</td></tr><tr><td>資金</td><td>保證金、手續費與追繳緩衝是否足夠？</td></tr><tr><td>策略</td><td>部位是投機、套利，還是降低現貨波動？</td></tr></tbody></table>'),
        ]
    },
    {
        'slug': 'options', 'index': '09', 'group': '衍生品', 'title': '選擇權', 'eyebrow': 'NON-LINEAR / OPTIONS',
        'intro': '從買賣權、權利金與隱含波動率，走到買方／賣方策略與希臘字母風險地圖。',
        'tool': ('前往交易風報比工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('買權與賣權的基本語言', '<p>買權提供在履約價買進的權利，賣權提供在履約價賣出的權利；買方支付權利金取得權利，賣方收取權利金並承擔相應義務。損益要用到期價格、權利金、履約價與契約乘數一起計算。</p><div class="guide-callout">權利金不是策略的全部成本：時間價值、波動率與流動性會讓同一個方向判斷產生完全不同的交易結果。</div>'),
            ('隱含波動率與希臘字母', '<table class="guide-table"><thead><tr><th>指標</th><th>回答的問題</th><th>需要注意</th></tr></thead><tbody><tr><td>Delta</td><td>標的價格小幅變動對權利金的近似影響</td><td>會隨價格與到期時間改變</td></tr><tr><td>Gamma</td><td>Delta 對標的價格變動的敏感度</td><td>買方與短天期部位通常更敏感</td></tr><tr><td>Theta</td><td>時間流逝對權利金的影響</td><td>不是固定每日扣除的直線</td></tr><tr><td>Vega</td><td>隱含波動率變化的敏感度</td><td>波動率回落可能侵蝕權利金</td></tr></tbody></table>'),
            ('買方、賣方與風險邊界', '<p>買方的損失通常以權利金為上限，但需要價格與時間同時配合；賣方收取權利金，卻可能面對較大的尾部風險與保證金需求。Covered Call、Cash-Secured Put 等策略仍需明確定義標的、履約、分配與最壞情境。</p><ul><li>下單前畫出到期損益與中途損益，不只看勝率。</li><li>把波動率、流動性與跳空風險放入壓力情境。</li><li>不以「收租」語言淡化賣方的非線性風險。</li></ul>'),
        ]
    },
    {
        'slug': 'warrants', 'index': '10', 'group': '衍生品', 'title': '權證', 'eyebrow': 'OPTION-LIKE / WARRANTS',
        'intro': '理解認購／認售、槓桿倍數、時間價值耗損與流動性，避免只看價差倍率。',
        'tool': ('前往交易風控工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('權證與直接持有的差異', '<p>權證通常提供以較小資金取得標的價格變動曝險的方式，但它同時包含到期日、履約價、發行條件、隱含波動率與造市流動性。槓桿放大的是價格敏感度，也會放大時間與波動率風險。</p><div class="guide-callout">比較權證不能只看「漲幾倍」：要拆成 Delta、剩餘天數、隱含波動率、價內外程度與買賣價差。</div>'),
            ('認購與認售的研究表', '<table class="guide-table"><thead><tr><th>面向</th><th>認購權證</th><th>認售權證</th></tr></thead><tbody><tr><td>主要曝險</td><td>標的上漲時的價格敏感度</td><td>標的下跌時的價格敏感度</td></tr><tr><td>時間價值</td><td>接近到期時通常會加速流失</td><td>同樣受剩餘時間與波動率影響</td></tr><tr><td>交易成本</td><td colspan="2">買賣價差、流動性與造市條件需個別檢查</td></tr></tbody></table>'),
            ('量能與流動性', '<p>成交量高不一定等於隨時能以理想價格成交；更實用的檢查包含買賣價差、掛單深度、造市回應與標的波動。盤中量能若突然枯竭，平倉風險可能比進場時更高。</p><ul><li>設定最大權證部位與單筆損失，不用槓桿替代研究。</li><li>把剩餘天數列為硬性停損條件之一。</li><li>交易前記錄理論價格與實際成交價差。</li></ul>'),
        ]
    },
    {
        'slug': 'crypto', 'index': '11', 'group': '宏觀與另類', 'title': '虛擬貨幣', 'eyebrow': '24 / 7 / CRYPTO',
        'intro': '從比特幣、以太幣、錢包保管到網格與質押，先建立鏈上與交易所風險意識。',
        'tool': ('前往蒙地卡羅風險工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('先分清資產、網路與保管', '<p>虛擬貨幣研究至少包含代幣經濟、區塊鏈網路、交易所與錢包保管四個層面。比特幣與以太幣的共識、用途與生態不同；持有資產不只面對價格波動，也面對私鑰、智能合約、交易所與監管風險。</p><div class="guide-callout">保管原則：能否恢復錢包、誰持有私鑰、轉帳網路是否正確，比追逐短線價格更優先。</div>'),
            ('冷錢包、熱錢包與鏈上風險', '<table class="guide-table"><thead><tr><th>方式</th><th>適用情境</th><th>主要風險</th></tr></thead><tbody><tr><td>交易所託管</td><td>頻繁交易與法幣出入金</td><td>平台、提款與帳戶安全</td></tr><tr><td>熱錢包</td><td>鏈上互動與小額使用</td><td>釣魚、惡意簽名與裝置安全</td></tr><tr><td>冷錢包</td><td>長期保管與降低線上暴露</td><td>備份、遺失與操作錯誤</td></tr></tbody></table>'),
            ('網格、質押與收益敘事', '<p>網格交易把區間拆成多個價格層級，遇到單邊突破時可能快速累積未實現損失；質押收益則可能伴隨鎖定、智能合約、驗證者與代幣價格風險。任何收益率都要轉成「本金可能損失多少」的壓力情境。</p><ul><li>把交易所風險與鏈上風險分開管理。</li><li>不要把資金費率、質押或流動性挖礦收益稱作無風險。</li><li>設置白名單、硬體備份與小額測試流程。</li></ul>'),
        ]
    },
    {
        'slug': 'cfd-indices', 'index': '12', 'group': '宏觀與另類', 'title': 'CFD／指數', 'eyebrow': 'GLOBAL / CFD & INDICES',
        'intro': '辨識槓桿、點差、隔夜利息與追繳風險，建立全球主要指數的交易前檢查單。',
        'tool': ('前往風報比工具', '../tools/index.html#risk-panel'),
        'sections': [
            ('CFD 是差價結算，不是現貨所有權', '<p>差價合約通常透過保證金取得標的價格變動曝險，結算的是開倉與平倉之間的差額。槓桿會讓小幅價格變化快速反映在帳戶權益，也可能帶來追繳、強平與負餘額等制度差異。</p><div class="guide-callout">交易前先確認平台的保證金、強平、負餘額保護、交易時段與報價來源，不要只比較名目槓桿倍數。</div>'),
            ('點差與隔夜費', '<table class="guide-table"><thead><tr><th>成本</th><th>何時發生</th><th>如何納入計畫</th></tr></thead><tbody><tr><td>點差</td><td>進出場成交價差</td><td>用最小預期波動檢查成本占比</td></tr><tr><td>隔夜利息</td><td>持倉跨過平台結算時間</td><td>將持有天數放入盈虧試算</td></tr><tr><td>滑價</td><td>波動或流動性下降時</td><td>用壓力情境擴大停損距離</td></tr></tbody></table>'),
            ('全球主要指數的使用方式', '<p>NASDAQ、S&amp;P 500、日經、恆生與歐洲指數各自反映不同的產業、貨幣與交易時段。指數可以作為資產配置的觀察窗，也可以成為交易標的；兩者需要不同的持有週期、成本假設與風險限制。</p><ul><li>先判斷指數報價是否含股息、期貨基差或平台調整。</li><li>把非交易時段跳空與新聞事件納入壓力測試。</li><li>用每筆風險預算反推部位大小，而不是從槓桿上限反推。</li></ul>'),
        ]
    },
]

sidebar = ''.join(f'<a href="{c["slug"]}.html">{c["index"]} · {c["title"]}</a>' for c in categories)

for c in categories:
    sections = ''.join(f'<section><h2>{heading}</h2>{body}</section>' for heading, body in c['sections'])
    html = f'''<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="GugoPro 財經學院｜{escape(c['title'])}結構化學習指南。">
  <title>{escape(c['title'])}｜GugoPro 財經學院</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><link rel="stylesheet" href="/style.css?v=20260824">
</head>
<body class="guide-page">
<header class="site-header"><div class="nav-container"><a href="../index.html" class="logo"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><nav class="primary-nav" aria-label="主要導覽"><a href="../index.html#knowledge-tree">知識樹</a><a href="../tools/index.html">實戰工具</a><a href="../index.html#reading-room">閱讀室</a></nav><div class="nav-actions"><a class="support-link" data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-mug-hot"></i><span>支持學院</span></a><div class="lang-selector"><button class="lang-btn" type="button"><i class="fa-solid fa-globe"></i><span>繁中</span><i class="fa-solid fa-chevron-down"></i></button><div class="lang-dropdown"><a href="#" onclick="changeLanguage('zh-tw')">繁體中文</a><a href="#" onclick="changeLanguage('zh-cn')">简体中文</a><a href="#" onclick="changeLanguage('en')">English</a></div></div><button class="mobile-nav-toggle" type="button" aria-label="開啟選單" aria-expanded="false"><i class="fa-solid fa-bars"></i></button></div></div></header>
<main><div class="guide-layout"><aside class="guide-sidebar"><div class="section-kicker">12 CATEGORIES</div>{sidebar}<a href="../tools/index.html" style="color:var(--orange); margin-top:10px; border-top:1px solid var(--line);">開啟工具工作台 →</a></aside><article class="guide-content"><header class="guide-hero"><div class="eyebrow"><span class="eyebrow-dot"></span>{c['eyebrow']}</div><h1>{escape(c['title'])}：先理解，再計算，最後管理風險。</h1><p>{c['intro']}</p><div class="guide-meta"><span>{c['group']}</span><span>結構化指南</span><span>教育用途</span></div></header><div class="guide-body">{sections}<div class="guide-tools"><a href="{c['tool'][1]}"><i class="fa-solid fa-calculator"></i> {c['tool'][0]}</a><a href="../index.html#knowledge-tree"><i class="fa-solid fa-compass"></i> 回到知識樹</a></div><div class="guide-cta"><div><h3>把這篇文章放回圖表驗證</h3><p>TradingView 可用來觀察全球市場、建立指標與回測假設。</p></div><a href="https://www.tradingview.com/?aff_id=168714" target="_blank" rel="noopener noreferrer" class="button button-light">前往 TradingView <i class="fa-solid fa-arrow-up-right-from-square"></i></a></div><p class="tool-disclaimer">本頁內容僅供教育與研究參考，不構成投資、稅務或法律建議。金融商品可能產生本金損失，請依自身情況審慎評估。</p></div></article></div></main>
<footer class="site-footer"><div class="footer-inner"><div class="footer-brand"><a href="../index.html" class="logo"><span class="logo-icon"><i class="fa-solid fa-chart-line"></i></span><span class="logo-copy"><span class="logo-text">GugoPro</span><span class="logo-tag">ACADEMY</span></span></a><p>把市場雜訊，整理成一條可走的路。</p></div><div class="footer-nav"><div><strong>探索</strong><a href="../index.html#knowledge-tree">12 類知識樹</a><a href="../tools/index.html">實戰工具庫</a></div><div><strong>支持</strong><a data-kofi-link href="https://ko-fi.com" target="_blank" rel="noopener noreferrer">Ko-fi 贊助支持</a><a href="https://www.amazon.com/?tag=9908qq-20" target="_blank" rel="noopener noreferrer">Amazon Hub</a></div><div><strong>政策</strong><a href="../privacy-policy.html">隱私權政策</a><a href="../terms-of-service.html">使用條款</a></div></div></div><div class="footer-bottom"><span>© 2026 GugoPro Academy</span><span>教育內容，不構成投資建議。</span></div></footer>
<script src="/app.js?v=20260824"></script>
</body></html>'''
    (OUT / f"{c['slug']}.html").write_text(html, encoding='utf-8')

print(f'Generated {len(categories)} guide pages in {OUT}')
