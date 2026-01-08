# TECHNICAL CONSTITUTION: 技術執行憲法

- **Version**: 3.1 (Expanded Execution & Standards)
- **Target**: VP 2 (Execution Agent / IDE)
- **Scope**: Tech Stack, Pixel Protocols, Rendering Rules, Coding Style
- **Status**: STRICT ENFORCEMENT

## 1. 技術邊界 (Tech Stack Boundaries)

未經允許，嚴禁引入新的語言、外部庫或框架。所有的技術選型必須服務於「一人軍隊」的高效維護目標。

### 1.1 核心引擎 (Core Engine)

技術棧: HTML5 Canvas API (2D Context) + Vanilla JS (ES6+ Class Pattern)。

設計哲學:

零依賴 (Zero Dependency): 避免 Phaser.js 或 Pixi.js 等龐大引擎的黑盒效應。原生 Canvas API 讓我們能精準控制每一個像素的渲染邏輯，且不會因為依賴包更新而導致專案崩潰。

效能掌控: 在處理數千個粒子或動態像素時，原生 JS 的 requestAnimationFrame 迴圈提供了最直接的效能優化路徑。

實作細節:

主遊戲迴圈必須與邏輯更新分離 (Fixed Time Step)，確保物理計算在不同刷新率的螢幕上保持一致。

### 1.2 UI 介面 (User Interface)

技術棧: SVG (用於圖標/幾何圖形) + CSS Grid/Flexbox (用於佈局)。

分工原則:

- **Canvas**: 僅負責渲染「遊戲世界」內的實體 (角色、怪物、地圖、特效)。

DOM/SVG: 負責渲染「HUD 層」 (血條、背包、對話框、系統選單)。

禁止事項: 嚴禁使用 ctx.fillText 在 Canvas 上繪製 UI 文字。

理由: Canvas 文字在高解析度 (Retina) 螢幕上會模糊，且無法選取或進行無障礙 (a11y) 支援。

### 1.3 渲染模式 (Rendering Mode)

規範: CSS image-rendering: pixelated (Chromium) / crisp-edges (Firefox)。

目的: 強制瀏覽器關閉反鋸齒 (Anti-aliasing) 插值算法。

實作細節:

當 Canvas 縮放時，必須確保像素邊緣銳利。所有的 ctx.imageSmoothingEnabled 屬性在初始化時必須設為 false。

即使在旋轉 (Rotation) 物件時，也應接受鋸齒邊緣，以保持復古像素風格的一致性。

### 1.4 資料結構 (Data Structure)

規範: 使用 POJO (Plain Old JavaScript Objects) 與 Arrays 作為核心數據載體。

設計哲學:

可序列化 (Serializability): 所有的遊戲狀態 (Save Data) 必須能直接通過 JSON.stringify() 轉存，不應包含函數或循環引用。

熱重載友善: 純數據結構使得我們可以在不重啟遊戲的情況下，動態替換 /data/sprites.js 中的內容並即時看到結果。

## 2. 像素協議 (The Pixel Protocol)

這是本專案的「物理定律」，所有視覺資產必須在此框架下運作。

### 2.1 物理網格 (Grid Standard)

所有角色、類人生物與標準物件必須遵守以下規範，這是一切 Hitbox 計算與 Shader 渲染的基礎：

邏輯解析度: 32 (寬) x 48 (高)。

垂直分區:

Top (0-12px): 頭部、帽子、表情區。

Mid (13-28px): 軀幹、胸腹肌、手臂活動區。

Bottom (29-48px): 腿部、腳步動畫區。留白是為了跳躍或浮空動畫預留空間。

顯示縮放:

與邏輯解析度完全解耦。

由 /data/config.js 中的 PIXEL_SCALE (預設 4x-10x) 全局變量控制。

禁止在渲染邏輯中寫死像素值 (如 x + 40)，必須使用 x + 10 * PIXEL_SCALE。

座標系統:

中心點 (Pivot): (0,0) 對應角色腳下的中心點 (Bottom-Center)。這確保了當角色縮放或變形時，是相對於地面進行，而不會陷入地底。

### 2.2 語義化鍵值 (Semantic Keys)

在 /data/sprites.js 中，嚴禁使用 Hex 顏色代碼 (如 #FF0000)。必須使用語義鍵值，將「材質定義」與「顏色表現」分離。

這使得我們能在不修改 Sprite 形狀的情況下，透過更換調色盤 (Palette) 實現「換裝」、「中毒變色」或「夜視模式」。

| Key | Semantic | Material Type | Shader Effect & Logic |
|---|---|---|---|

| # | Outline | SOLID | 純深色: 無光影計算。用於強調哥德風的輪廓，確保角色在複雜背景中依然清晰可見。 |

| S | Skin | SKIN | 次表面散射: 基礎色 + 邊緣泛紅。在渲染時，偵測該像素是否鄰近透明區域，若是，則疊加 20% 紅色透明度，模擬皮膚透光感。 |

| H | Hair | NOISE | 程序化噪點: 基礎色 + 雜訊。使用 (x, y) 座標作為種子 (Seed) 生成穩定的噪點，避免動畫時閃爍。用於增加細節密度。 |

| C | Cloth | CLOTH | 頂光漸層: 上亮下暗。根據像素在 Sprite 中的相對 Y 座標，疊加線性漸層 (Linear Gradient)，模擬布料的自然垂墜感。 |

| M | Metal | SHINY | 動態高光: 鏡面反射。根據全域 time 變量，產生一條掃過表面的高亮白線，模擬金屬光澤。 |

| L | Leather | MATTE | 啞光質感: 僅在頂部 2px 產生微弱高光，其餘部分保持低對比度，模擬皮革的吸光特性。 |

## 3. 程序化渲染管線 (Procedural Rendering Pipeline)

VP 2 在編寫 /render/PixelRenderer.js 時，必須將其視為一個「即時編譯器」，將靜態數據編譯為動態畫面。

### 3.1 渲染分離原則 (Separation of Concerns)

Data Layer (What): 定義物件的「本質」。例如：「這是一把劍，材質是金屬」。

Render Layer (How): 定義物件的「表現」。例如：「現在是晚上，金屬應該反射月光」。

禁止烘焙 (No Baking):

定義: 禁止在 Sprite 字符陣列中手動填寫深色代碼來模擬陰影。

理由: 手繪陰影是靜態的。當角色倒立或光源改變時，手繪陰影會變得不合理。陰影必須由算法根據 y 軸高度或 Material Type 動態生成。

### 3.2 動態注入 (Dynamic Injection)

為了讓靜態的像素陣列「活起來」，渲染器必須在繪製每一幀時注入動態變形：

Bobbing (呼吸與懸浮):

所有 IDLE 狀態的實體，必須包含 y_offset = Math.sin(time * speed) * amplitude 的位移計算。

這能避免角色看起來像死板的貼圖。

Squash & Stretch (彈性形變):

在發生瞬間加速度變化（如起跳 jump_start 或落地 land）時，必須通過 ctx.scale(1 + stretch, 1 - squish) 改變長寬比。

這能賦予像素物理重量感 (Juiciness)。

Color Swap (即時換色):

換裝或狀態變化（如冰凍）必須通過改變 /data/palettes.js 的映射表引用來實現。

嚴禁為了變色而創建新的 Sprite 陣列 (如 SPRITE_PLAYER_BLUE, SPRITE_PLAYER_RED 是被禁止的)。

## 4. 代碼風格與規範 (Coding Standards)

為了確保「一人軍隊」在一個月後還能看懂自己的代碼，請嚴格遵守以下約定。

### 4.1 類別封裝 (Encapsulation)

每個 Entity 必須是一個獨立的 Class (e.g., class Player extends Entity)。

生命週期方法: 必須明確實作 update(dt) (處理邏輯) 與 draw(ctx) (處理渲染)。邏輯與渲染代碼不得混雜。

### 4.2 無依賴原則 (No Circular Dependencies)

/data 資料夾內的檔案必須是純數據，不應 import 任何 /core 或 /entities 的類別。

這確保了數據層可以被任何模組安全引用，而不會導致循環依賴或初始化錯誤。

### 4.3 註解規範 (Documentation)

複雜算法: 針對 Shader 邏輯（如噪點生成公式、貝塞爾曲線插值），必須用註解解釋數學原理。

魔術數字: 代碼中不應出現不明顯的數字（如 if (x > 145)）。必須提取為具名常數（如 const MAX_JUMP_HEIGHT = 145）並加以註解。

### 4.4 變量命名 (Naming Convention)

- **CONSTANTS**: 全大寫 snake_case (e.g., MAX_SPEED, GRID_SIZE)。

Private Properties: 下劃線開頭 (e.g., _frameIndex, _isGrounded)，表示該變量不應被外部直接修改。

- **Boolean**: 使用語義化前綴 (e.g., isMoving, hasLanded, canJump)，避免使用模糊的 flag 或 status。

End of Constitution