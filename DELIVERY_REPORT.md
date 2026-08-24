# GugoPro 財經學院知識樹重構與專屬工具開發交付報告

**專案：** `9908gg-art/gugopro-academy`　　**作者：** Manus AI　　**交付日期：** 2026-08-24

## 一、交付摘要

本次交付把 GugoPro 財經學院首頁從原本以五階段學程為中心的長頁，重構為「定位 → 探索 → 實作 → 支持」四段式入口。首頁首屏先說明學院方法論，接著以可搜尋、可篩選的 12 類金融商品知識樹承接使用者需求，再將文章指南與本地計算工具配對，最後提供 TradingView、Amazon Hub 與 Ko-fi 支持入口。資訊架構借鏡市場先生首頁的「分類導覽、內容流與精選資源分層」原則，但未複製其品牌、圖片或文字。[1]

正式站公開入口為 [academy.gugopro.com](https://academy.gugopro.com/)，原始碼已推送到 [GitHub main 分支](https://github.com/9908gg-art/gugopro-academy/tree/main)。本次程式變更的最後提交為 `6e98bd1`；交付報告與驗證紀錄的最終提交為 `a49d2f0`，前兩個相關提交為 `e49da3e` 與 `ce935cc`；本地工作樹與遠端 main 已同步。

## 二、首頁與知識樹

新的根目錄 `index.html` 採用深色玻璃擬態、橙色重點色與高對比資訊層級。首頁不再一次展開所有課程條目，而是將 12 個核心分類放入四欄響應式矩陣，並提供搜尋欄、`/` 快捷鍵、Esc 清除、五組分類篩選與空結果提示。桌面版以四欄呈現，平板版轉為三欄或兩欄，手機版轉為單欄；行動版導覽則透過選單按鈕展開。

| 分類 | 教學範圍 | 指南頁 | 配對工具 |
| --- | --- | --- | --- |
| 台股／股票 | 除權息、本益比、殖利率、基本面、技術面 | `guides/taiwan-stocks.html` | 複利與殖利率 |
| 美股 | 開戶、三大指數、交易規則、財報閱讀 | `guides/us-stocks.html` | DCF／安全邊際 |
| ETF | 0050／00919、VOO／QQQ、債券 ETF、費用率、折溢價 | `guides/etf.html` | ETF 內扣費用 |
| 債券 | 美國國債、殖利率曲線、倒掛、久期 | `guides/bonds.html` | 債券價格／久期 |
| 基金 | 共同基金、主動／被動、經理人、費用 | `guides/funds.html` | 複利與費用 |
| 外匯 | 匯率避險、DXY、外幣定存、換匯 | `guides/forex.html` | 風報比／部位 |
| 商品原物料 | 黃金、原油、通膨連動商品 | `guides/commodities.html` | 風險情境 |
| 期貨 | 臺指期、富台期、保證金、結算、避險 | `guides/futures.html` | 風報比／部位 |
| 選擇權 | 買賣權、IV、買方／賣方、希臘字母 | `guides/options.html` | 風險工具 |
| 權證 | 認購／認售、槓桿、時間價值、流動性 | `guides/warrants.html` | 交易風控 |
| 虛擬貨幣 | BTC／ETH、錢包、網格、質押、鏈上風險 | `guides/crypto.html` | 蒙地卡羅風險 |
| CFD／指數 | 槓桿、點差、隔夜利息、全球指數 | `guides/cfd-indices.html` | 風報比 |

## 三、文章內容擴充

`guides/` 目錄新增 12 篇結構化指南，每篇皆遵循「先理解商品、再看指標、最後管理風險」的順序。頁面共用側欄可在 12 類之間切換，正文包含概念說明、比較表格、實務檢查單與風險 callout；每篇文章都能跳轉到相關工具、回到知識樹，並在文章結尾提供 TradingView 合作 CTA。這讓文章不再是孤立頁面，而是知識樹中的可回溯節點。

## 四、純前端工具工作台

`tools/index.html` 與 `tools/advanced-tools.js` 現在提供九個 Tabs 面板。計算由瀏覽器 JavaScript 執行，不抓取即時報價、不建立伺服器端狀態，也不將輸入資料送出。模型皆為教育用途的簡化情境，並在頁面上明確說明稅費、滑價、流動性、凸性、報酬順序與個人情況可能使實際結果不同。

| 工具面板 | 主要輸入 | 主要輸出 |
| --- | --- | --- |
| 複利退休 | 本金、每月投入、淨報酬率、年限、費用 | 終值、投入本金、複利增值 |
| ETF 費用 | 本金、毛報酬、費用率、持有年數 | 未扣費用終值、扣費後終值、拖累 |
| 債券久期 | 面額、票息、YTM、年期、付息頻率、bp | 價格、Macaulay／修正久期、近似價格變動 |
| 殖利率曲線 | 短／長天期殖利率與門檻 | 倒掛、持平或正常斜率警示 |
| 風報比／Kelly | 進場、停損、目標、資金、風險、勝率 | R 倍數、風險預算、單位數、Kelly／半 Kelly |
| DCF／安全邊際 | FCF、成長、終值成長、折現率、股數、價格 | 企業價值、每股價值、安全邊際價格 |
| 4% 提領 | 本金、提領率、報酬、通膨、年限 | 累計提領、期末餘額或耗盡年份 |
| 資產配置再平衡 | 三類目前金額與目標權重 | 各資產應買入或減碼金額 |
| 蒙地卡羅 | 本金、勝率、盈虧比、單筆風險、交易次數 | 跌破半數機率、95% 最大回撤 |

若未來加入 AI 解讀，程式已提供 `getGugoProGeminiKey()` 與 `saveGugoProGeminiKey()`，且只使用 `localStorage.getItem('gugopro_gemini_api_key')`。本次工作台沒有呼叫 AI，也沒有把金鑰傳送到伺服器。

## 五、商業導流整合

首頁、工具工作台、12 篇新指南與 31 個既有文章／工具頁均已加入 TradingView 合作 CTA；網址沿用專案設定中的 `https://www.tradingview.com/?aff_id=168714`。首頁底部 Amazon Hub 沿用既有 `amazon_tag: 9908qq-20`，保留經典財經書、量化研究與交易心理等精選入口。首頁、指南與工具頁的頁首與頁尾均放置 Ko-fi 支持入口，並由 `config.json` 的 `kofi_url` 統一控制。

目前倉庫沒有可驗證的 GugoPro 專屬 Ko-fi 頁面，因此 `config.json` 暫以 [Ko-fi 官方首頁](https://ko-fi.com) 為安全 fallback；若提供品牌專屬網址，只需把 `kofi_url` 替換，所有標記 `data-kofi-link` 的入口會自動更新。這是唯一未能在本次任務中從公開資料確認的品牌專屬設定，沒有臆造個人頁面網址。

## 六、驗證與部署紀錄

本地驗證使用 `node --check app.js`、`node --check tools/advanced-tools.js`、`python3 validate_site.py` 與 `git diff --check`。靜態驗證結果為 `guides=12`、`root_links=49`、`workbench_panels=9`、`errors=0`。瀏覽器回歸測試確認首頁有 12 張知識樹卡片、5 個篩選按鈕與 CSS Grid；工具工作台九個計算器在預設情境下均能產生非空結果；債券預設結果為理論價格約 NT$1,045、Macaulay 久期 4.50 年、修正久期 4.41 年；指南頁有 12 類側欄、文章表格、工具連結與 TradingView CTA。

| 驗證項目 | 結果 |
| --- | --- |
| HTML／本地連結 | 12 篇指南、49 個根首頁連結，無 broken link |
| JavaScript 語法 | `app.js` 與 `advanced-tools.js` 均通過 |
| 純前端計算 | 九個面板均能產生結果，無 API 呼叫 |
| RWD 結構 | CSS 具桌面、平板、手機斷點與行動導覽 |
| 正式站 HTML | `https://academy.gugopro.com/?v=ce935cc` 已讀到新版標記 |
| 正式站資源 | `/style.css?v=20260824`、`/app.js?v=20260824` 已部署 |
| 舊文章 CTA | 31 個既有文章／工具頁已公開 TradingView CTA |
| Git 狀態 | `main...origin/main`，最終提交 `a49d2f0` |

部署期間曾發現一般瀏覽器快取命中舊語言跳轉與舊 CSS，已以版本化資源 URL 修正，並輪詢 GitHub Pages 建置至正式文章頁確認 CTA 與資源標記同步。Git remote 已還原為不含 token 的公開 URL，暫時認證腳本已刪除，憑證未寫入網站檔案或提交內容。

## 七、檔案導覽

| 檔案／目錄 | 用途 |
| --- | --- |
| `index.html` | 新版繁體中文首頁與知識樹 |
| `style.css` | 共用深色玻璃擬態、首頁、指南、工具與 CTA 樣式 |
| `app.js` | 語言切換、下拉選單、知識樹搜尋／篩選、Ko-fi 設定載入 |
| `guides/*.html` | 12 類金融商品結構化指南 |
| `tools/index.html` | 純前端工具工作台介面 |
| `tools/advanced-tools.js` | 九項工具的瀏覽器端計算核心 |
| `config.json` | Amazon、TradingView、Ko-fi 導流設定 |
| `build_guides.py` | 12 篇指南的共同版型產生器 |
| `add_resource_ctas.py` | 既有文章／工具頁 CTA 與版本化資源批次維護腳本 |
| `validate_site.py` | 連結、ID、面板與指南數量的靜態驗證腳本 |

## References

[1]: https://rich01.com/ "Mr.Market市場先生首頁（分類導覽與內容分層參考）"
[2]: https://academy.gugopro.com/ "GugoPro 財經學院正式站"
[3]: https://github.com/9908gg-art/gugopro-academy "GugoPro Academy GitHub repository"
