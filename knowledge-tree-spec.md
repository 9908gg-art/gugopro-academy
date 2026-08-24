# GugoPro Academy 知識樹實作規格

首頁採用「定位 → 探索 → 實作 → 支持」四段式資訊架構。首屏以清楚的學院定位、學習進度統計與三個主要行動按鈕承接訪客；第二段是可搜尋與可篩選的 12 類金融商品知識樹；第三段將純前端工具與對應文章配對；最後是 TradingView CTA、Amazon Hub、Ko-fi 支持與風險免責聲明。

| 編號 | 商品分類 | 首頁分類標籤 | 文章頁 | 對應工具 |
| --- | --- | --- | --- | --- |
| 01 | 台股／股票 | 基礎資產 | guides/taiwan-stocks.html | 高殖利率複利與殖利率檢視 |
| 02 | 美股 | 全球股票 | guides/us-stocks.html | DCF 估值與安全邊際 |
| 03 | ETF | 被動投資 | guides/etf.html | ETF 內扣費用損耗 |
| 04 | 債券 | 固定收益 | guides/bonds.html | 債券價格、久期與利率敏感度 |
| 05 | 基金 | 主動管理 | guides/funds.html | 費用與長期報酬對照 |
| 06 | 外匯 | 全球宏觀 | guides/forex.html | 交易風報比與部位大小 |
| 07 | 商品原物料 | 實體資產 | guides/commodities.html | 通膨情境筆記 |
| 08 | 期貨 | 槓桿工具 | guides/futures.html | 風險預算與保證金情境 |
| 09 | 選擇權 | 非線性風險 | guides/options.html | 希臘字母與損益結構 |
| 10 | 權證 | 槓桿商品 | guides/warrants.html | 時間價值與槓桿檢視 |
| 11 | 虛擬貨幣 | 24/7 市場 | guides/crypto.html | 風險報酬與波動情境 |
| 12 | CFD／指數 | 全球指數 | guides/cfd-indices.html | 點差、隔夜費與風險報酬 |

## 互動工具清單

`tools/index.html` 以 Tabs 呈現十項核心工具：高殖利率複利與退休、ETF 內扣費用、債券久期與價格、交易風報比、Kelly 部位、DCF、安全邊際、4% 退休提領、資產配置再平衡、以及蒙地卡羅風險。所有計算由 `tools/advanced-tools.js` 在瀏覽器執行，不發送輸入資料；Gemini 金鑰若被使用，只能透過 `localStorage.getItem('gugopro_gemini_api_key')` 取得。

## 導覽與商業模組

首頁知識樹以搜尋輸入、分類篩選、展開／收合按鈕降低頁面高度。每一篇指南與每一項工具都使用共用的 TradingView CTA。Amazon 商品使用現有 `config.json` 的 `amazon_tag` 形成聯盟連結。Ko-fi CTA 採用可由 `config.json` 覆蓋的 `kofi_url`，目前若沒有品牌專屬頁面則退回 Ko-fi 官方首頁，並在報告中標示待替換設定。
