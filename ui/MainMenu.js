export class MainMenu {
    constructor(containerId, onStartGame) {
        this.container = document.getElementById(containerId);
        this.onStartGame = onStartGame;
        this.bgImage = './assets/ui/title_bg.png'; // Will be verified/set

        this._injectStyles();
        this.element = this._createDOM();
        this.container.appendChild(this.element);
    }

    _createDOM() {
        const div = document.createElement('div');
        div.id = 'main-menu';

        // Overlay Gradient for text readability
        const overlay = document.createElement('div');
        overlay.className = 'bg-overlay';
        div.appendChild(overlay);

        // Logo / Title Area
        const titleArea = document.createElement('div');
        titleArea.className = 'title-area';

        const mainTitle = document.createElement('h1');
        mainTitle.className = 'main-title';
        mainTitle.innerHTML = '史萊姆轉生<br><span class="subtitle">異世界美食編年史</span>';

        titleArea.appendChild(mainTitle);

        // Menu Actions (Right Side or Bottom)
        const menuActions = document.createElement('div');
        menuActions.className = 'menu-actions';

        const startBtn = this._createMenuButton('開始冒險', () => {
            this._playFadeOut(() => {
                this.destroy();
                if (this.onStartGame) this.onStartGame();
            });
        });
        const loadBtn = this._createMenuButton('繼續旅程', () => { console.log('Load not impl'); });
        const cfgBtn = this._createMenuButton('系統設定', () => { console.log('Settings not impl'); });

        menuActions.appendChild(startBtn);
        menuActions.appendChild(loadBtn);
        menuActions.appendChild(cfgBtn);

        div.appendChild(titleArea);
        div.appendChild(menuActions);

        // Footer / Version
        const footer = document.createElement('div');
        footer.className = 'footer-text';
        footer.innerText = '版本 0.3.5 | © 2026 伊甸系統株式會社';
        div.appendChild(footer);

        return div;
    }

    _createMenuButton(text, onClick) {
        const btn = document.createElement('div');
        btn.className = 'menu-btn';
        btn.onclick = onClick;

        const label = document.createElement('span');
        label.innerText = text;

        const icon = document.createElement('span');
        icon.className = 'icon-arrow';
        icon.innerText = '➤';

        btn.appendChild(icon);
        btn.appendChild(label);
        return btn;
    }

    _playFadeOut(cb) {
        this.element.style.animation = 'fade-out 1.5s ease-in-out forwards';
        setTimeout(cb, 1500);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }

    _injectStyles() {
        if (document.getElementById('pro-styles')) return;

        const css = `
            /* 導入 Noto Serif TC (思源宋體) */
            @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700;900&family=Lato:wght@300;400&display=swap');

            #main-menu {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background-image: url('assets/ui/title_bg.png');
                background-size: cover;
                background-position: center;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                z-index: 100;
                pointer-events: auto;
                font-family: 'Noto Serif TC', serif; /* Change to Chinese Serif */
                overflow: hidden;
            }

            .bg-overlay {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 60%),
                            linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%);
                z-index: 0;
            }

            .title-area {
                position: relative;
                z-index: 2;
                margin-top: 10%;
                margin-left: 5%;
                color: #fff;
                text-shadow: 0 4px 10px rgba(0,0,0,0.5);
            }

            .main-title {
                font-size: 4rem;
                font-weight: 700;
                line-height: 0.9;
                letter-spacing: 2px;
                background: linear-gradient(to bottom, #fff 0%, #ddd 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
            }

            .main-title .subtitle {
                font-size: 1.5rem;
                font-weight: 400;
                letter-spacing: 8px;
                color: #B3E5FC; /* Light Blue hint */
                display: block;
                margin-top: 10px;
                -webkit-text-fill-color: #B3E5FC;
                text-transform: uppercase;
            }

            .menu-actions {
                position: relative;
                z-index: 2;
                margin-bottom: 8%;
                margin-left: 5%;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .menu-btn {
                font-family: 'Lato', sans-serif;
                font-size: 1.2rem;
                color: rgba(255,255,255,0.8);
                padding: 10px 20px;
                cursor: pointer;
                border-left: 3px solid transparent;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                width: fit-content;
                background: linear-gradient(90deg, transparent, transparent);
            }

            .menu-btn .icon-arrow {
                opacity: 0;
                margin-right: -10px;
                transition: all 0.3s ease;
                font-size: 0.8rem;
                color: #FFD54F; /* Gold */
            }

            .menu-btn:hover {
                color: #fff;
                border-left: 3px solid #FFD54F;
                background: linear-gradient(90deg, rgba(255, 255, 255, 0.1), transparent);
                padding-left: 30px;
            }

            .menu-btn:hover .icon-arrow {
                opacity: 1;
                margin-right: 10px;
            }

            .footer-text {
                position: absolute;
                bottom: 10px;
                right: 20px;
                color: rgba(255,255,255,0.3);
                font-family: sans-serif;
                font-size: 0.7rem;
                z-index: 2;
            }

            @keyframes fade-out {
                0% { opacity: 1; filter: blur(0px); }
                100% { opacity: 0; filter: blur(10px); display: none;}
            }
        `;
        const style = document.createElement('style');
        style.id = 'pro-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
}
