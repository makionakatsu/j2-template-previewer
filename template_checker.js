/* J2 Template Previewer JavaScript */

/* ---------- サンプルデータ : 任意で編集可能 ---------- */
const sampleContext = {
  title: "【58-11】0と1でCHANGE！コンピュータの誕生と進化 〜拡張される人類の思考〜【COTEN RADIO 科学技術の歴史編11】",
  podcast_name: "コテンラジオ",
  episode_title: "【58-11】0と1でCHANGE！コンピュータの誕生と進化 〜拡張される人類の思考〜【COTEN RADIO 科学技術の歴史編11】",
  subtitle: "計算機とインターネットの進化",
  hosts: ["深井龍之介", "楊 睿之（ヤンヤン）", "樋口 聖典"],
  hosts_string: "出演：深井龍之介・楊 睿之（ヤンヤン）・樋口 聖典",
  logo_url: "file:///Users/sakamakinoboru/myenv/Podcast2img/podcast2image/static/covers/cotenradio.jpeg",
  sections: [
    {
      emoji: "🧠",
      title: "計算を機械化する挑戦",
      points: [
        "古代ギリシャのアンティキティラ島で発見された、天体の動きをシミュレートする歯車式計算機は驚異的だ。",
        "ブレーズ・パスカルは父親の税計算を楽にするため、歯車を使った加算機を開発し、計算の自動化に貢献した。",
        "ゴットフリート・ライプニッツは、誰でも計算できるように機械式計算機を考案し、計算の民主化を目指す。"
      ],
      quote: "人間を考える足である"
    },
    {
      emoji: "💡",
      title: "バベッジの解析機関構想",
      points: [
        "チャールズ・バベッジは、大砲の弾道計算ニーズに応え、数表作成を自動化する解釈機関を考案した。",
        "バベッジは汎用計算機である解析機関を構想し、CPUとメモリを分離する概念を打ち立てた。",
        "パンチカードによる関数設定というアイデアは、後のコンピューター開発に大きな影響を与えた。"
      ],
      quote: "過去から自分に向けてバベッジが個人的に語りかけているように感じた"
    },
    {
      emoji: "📊",
      title: "IBMのルーツと国勢調査",
      points: [
        "アメリカの国勢調査自動化のため、ハーマン・ホレリスはパンチカード式集計機を開発し、大幅な効率化を実現した。",
        "ホレリスはタビュレイティングマシンカンパニーを設立し、事務機器の販売からIBMへと発展を遂げた。",
        "国勢調査のデータ集計から始まったIBMは、コンピューター業界の巨人へと成長を遂げる。"
      ],
      quote: "国政調査から始まったってことです"
    },
    {
      emoji: "🧠",
      title: "チューリングマシンの衝撃",
      points: [
        "アラン・チューリングは、プログラミング言語の概念を提唱し、理論上あらゆる命令が可能な理想的な機械を考案した。",
        "チューリングマシンは、無限のテープと読み書きヘッドを持つ概念上の存在として、現代コンピューターの基礎となった。",
        "チューリングはナチスドイツの暗号エニグマを解読し、連合国軍の勝利に大きく貢献した。"
      ],
      quote: "俺が考えた最強のマシン"
    }
  ],
  footer_text: "コテンラジオの要約スライド ｜ created by まき@makio_study"
};

// グローバル変数
let currentTemplate = '';
let currentContext = {};

// 背景設定
let pageBackgroundType = 'solid'; // solid, gradient
let pageBackgroundColor = 'white';
let pageGradientColor1 = '#ffffff';
let pageGradientColor2 = '#f0f0f0';
let pageGradientDirection = 'to bottom';

// 画像オーバーレイ設定
let pageImage = null;
let pageImageOpacity = 1.0; // 画像の不透明度（0-1）
let pageImageSize = 20; // パーセント
let pageImagePositionX = 50; // 水平位置（パーセント）
let pageImagePositionY = 50; // 垂直位置（パーセント）

/* ---------- util : ファイルをテキストとして読む ---------- */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

/* ---------- Jinja2からNunJucks互換への変換 ---------- */
function convertJinja2ToNunjucks(source) {
  let converted = source;
  
  // スライス記法の変換: sections[:4] -> sections（データ側で処理）
  converted = converted.replace(/(\w+)\[:(\d+)\]/g, '$1');
  
  // joinフィルターを削除して、データ側で事前処理
  converted = converted.replace(/\{\{\s*(\w+)\s*\|\s*join\([^)]+\)\s*\}\}/g, '{{ $1 }}');
  
  return converted;
}

/* ---------- サンプルデータを動的に処理 ---------- */
function processContextData(context) {
  const processed = JSON.parse(JSON.stringify(context));
  
  // スライス処理: sectionsが4つより多い場合は4つに制限
  if (processed.sections && processed.sections.length > 4) {
    processed.sections = processed.sections.slice(0, 4);
  }
  
  // hosts配列をjoin処理
  if (Array.isArray(processed.hosts)) {
    processed.hosts = "出演：" + processed.hosts.join("・");
  }
  
  return processed;
}

/* ---------- テンプレート解析機能 ---------- */
function analyzeTemplate(source) {
  const analysis = {
    pageSettings: {},
    logoSettings: {},
    headerSettings: {},
    cardSettings: {},
    otherSettings: {},
    colors: [],
    variables: []
  };

  // ページ設定を抽出
  const pageWidthMatch = source.match(/width:\s*(\d+px)/);
  const pageHeightMatch = source.match(/height:\s*(\d+px)/);
  const bodyBgMatch = source.match(/body\s*{[^}]*background:\s*([^;]+)/);
  const paddingMatch = source.match(/padding:\s*([^;]+)/);
  
  analysis.pageSettings = {
    width: pageWidthMatch ? pageWidthMatch[1] : "不明",
    height: pageHeightMatch ? pageHeightMatch[1] : "不明", 
    background: bodyBgMatch ? bodyBgMatch[1].trim() : "不明",
    padding: paddingMatch ? paddingMatch[1].trim() : "不明"
  };

  // ロゴ設定を抽出
  const logoSizeMatch = source.match(/\.logo[^{]*{[^}]*width:\s*([^;]+)[^}]*height:\s*([^;]+)/);
  const logoBgMatch = source.match(/\.logo[^{]*{[^}]*background:\s*([^;]+)/);
  const logoRadiusMatch = source.match(/\.logo[^{]*{[^}]*border-radius:\s*([^;]+)/);
  
  analysis.logoSettings = {
    width: logoSizeMatch ? logoSizeMatch[1].trim() : "不明",
    height: logoSizeMatch ? logoSizeMatch[2].trim() : "不明",
    background: logoBgMatch ? logoBgMatch[1].trim() : "不明",
    borderRadius: logoRadiusMatch ? logoRadiusMatch[1].trim() : "不明"
  };

  // ヘッダー設定を抽出（h1, h2, p）
  const h1FirstMatch = source.match(/\.text-block h1:first-child[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  const h1Match = source.match(/\.text-block h1[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  const h2Match = source.match(/\.text-block h2[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  const pMatch = source.match(/\.text-block p[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  
  analysis.headerSettings = {
    h1First: h1FirstMatch ? `${h1FirstMatch[1].trim()} / ${h1FirstMatch[2].trim()}` : "不明",
    h1: h1Match ? `${h1Match[1].trim()} / ${h1Match[2].trim()}` : "不明",
    h2: h2Match ? `${h2Match[1].trim()} / ${h2Match[2].trim()}` : "不明",
    p: pMatch ? `${pMatch[1].trim()} / ${pMatch[2].trim()}` : "不明"
  };

  // カード設定を抽出
  const cardHeightMatch = source.match(/\.card[^{]*{[^}]*height:\s*([^;]+)/);
  const cardBgMatch = source.match(/\.card[^{]*{[^}]*background:\s*([^;]+)/);
  const cardBorderMatch = source.match(/\.card[^{]*{[^}]*border-left:\s*([^;]+)/);
  const cardH3Match = source.match(/\.card h3[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  
  analysis.cardSettings = {
    height: cardHeightMatch ? cardHeightMatch[1].trim() : "不明",
    background: cardBgMatch ? cardBgMatch[1].trim() : "不明",
    borderLeft: cardBorderMatch ? cardBorderMatch[1].trim() : "不明",
    titleFont: cardH3Match ? `${cardH3Match[1].trim()} / ${cardH3Match[2].trim()}` : "不明"
  };

  // 引用・フッター設定を抽出
  const quoteMatch = source.match(/\.quote[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  const footerMatch = source.match(/\.footer[^{]*{[^}]*font-size:\s*([^;]+)[^}]*color:\s*([^;]+)/);
  
  analysis.otherSettings = {
    quote: quoteMatch ? `${quoteMatch[1].trim()} / ${quoteMatch[2].trim()}` : "不明",
    footer: footerMatch ? `${footerMatch[1].trim()} / ${footerMatch[2].trim()}` : "不明"
  };

  // 色を抽出
  const colorRegex = /#[0-9a-fA-F]{3,6}/g;
  analysis.colors = [...new Set(source.match(colorRegex) || [])];

  // 変数を抽出
  const variableRegex = /\{\{\s*([^}]+)\s*\}\}/g;
  let match;
  while ((match = variableRegex.exec(source)) !== null) {
    analysis.variables.push(match[1].trim());
  }

  return analysis;
}

/* ---------- 色抽出関数 ---------- */
function extractColor(value) {
  if (!value || typeof value !== 'string') {
    return '#000000';
  }
  const match = value.match(/#[0-9a-fA-F]{3,6}/);
  return match ? match[0] : '#000000';
}

/* ---------- グラデーション生成機能 ---------- */
function createGradient(color1, color2, direction = 'to right') {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
}

/* ---------- カラーパレットプリセット ---------- */
const colorPalettes = {
  'default': {
    name: '🌿 デフォルト',
    main: '#5B76A8',
    sub: '#7f91b4', 
    text: '#666',
    background: '#f2f6fc',
    quote: '#5B76A8',
    card: '#ffffff'
  },
  'pop': {
    name: '🌈 ポップ',
    main: '#FF6B6B',
    sub: '#4ECDC4',
    text: '#2C3E50',
    background: '#FFF5F5',
    quote: '#FF6B6B',
    card: '#FFF9F9'
  },
  'cool': {
    name: '❄️ クール',
    main: '#3498DB',
    sub: '#85C1E9',
    text: '#34495E',
    background: '#EBF3FD',
    quote: '#2980B9',
    card: '#F8FBFF'
  },
  'warm': {
    name: '🌅 ウォーム',
    main: '#E67E22',
    sub: '#F39C12',
    text: '#8B4513',
    background: '#FDF2E9',
    quote: '#D35400',
    card: '#FEF9F3'
  },
  'nature': {
    name: '🌱 ナチュラル',
    main: '#27AE60',
    sub: '#58D68D',
    text: '#1B4F72',
    background: '#E8F8F5',
    quote: '#196F3D',
    card: '#F4FBF7'
  },
  'elegant': {
    name: '🌙 エレガント',
    main: '#8E44AD',
    sub: '#BB8FCE',
    text: '#4A4A4A',
    background: '#F4F2F7',
    quote: '#7D3C98',
    card: '#FAF9FC'
  },
  'sunset': {
    name: '🌅 サンセット',
    main: '#E74C3C',
    sub: '#F1948A',
    text: '#922B21',
    background: '#FDEDEC',
    quote: '#C0392B',
    card: '#FEF6F6'
  },
  'ocean': {
    name: '🌊 オーシャン',
    main: '#1ABC9C',
    sub: '#76D7C4',
    text: '#0E6655',
    background: '#E8F8F5',
    quote: '#148F77',
    card: '#F0FBF9'
  }
};

/* ---------- カード形状プリセット ---------- */
const cardShapePresets = {
  'default': {
    'border-radius': '8px',
    'border': 'none',
    'border-left': '5px solid #5B76A8',
    'border-top': 'none',
    'border-right': 'none', 
    'border-bottom': 'none',
    'box-shadow': 'none'
  },
  'rounded': {
    'border-radius': '20px',
    'border': 'none',
    'border-left': '5px solid #5B76A8',
    'border-top': 'none',
    'border-right': 'none',
    'border-bottom': 'none', 
    'box-shadow': 'none'
  },
  'square': {
    'border-radius': '0px',
    'border': 'none',
    'border-left': '5px solid #5B76A8',
    'box-shadow': 'none'
  },
  'shadow': {
    'border-radius': '8px',
    'border': 'none',
    'border-left': '5px solid #5B76A8',
    'border-top': 'none',
    'border-right': 'none',
    'border-bottom': 'none',
    'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  'elevated': {
    'border-radius': '12px',
    'border': 'none',
    'border-left': 'none',
    'border-top': 'none',
    'border-right': 'none',
    'border-bottom': 'none',
    'box-shadow': '0 8px 16px rgba(0, 0, 0, 0.15)'
  },
  'topBorder': {
    'border-radius': '8px',
    'border': 'none',
    'border-left': 'none',
    'border-top': '5px solid #5B76A8',
    'border-right': 'none',
    'border-bottom': 'none',
    'box-shadow': 'none'
  }
};

/* ---------- リストマーク設定 ---------- */
const listMarkOptions = {
  'check': '✓',
  'arrow': '▶',
  'bullet': '●',
  'star': '★',
  'diamond': '◆',
  'circle': '○',
  'square': '■',
  'heart': '♥'
};

/* ---------- ページ内背景処理機能 ---------- */
function togglePageBackgroundMode(mode) {
  const solidEl = document.getElementById('page-background-solid');
  const gradientEl = document.getElementById('page-background-gradient');
  
  if (mode === 'gradient') {
    solidEl.style.display = 'none';
    gradientEl.style.display = 'block';
    pageBackgroundType = 'gradient';
    updatePageBackgroundGradient();
  } else {
    solidEl.style.display = 'block';
    gradientEl.style.display = 'none';
    pageBackgroundType = 'solid';
    updatePageLayeredBackground();
  }
}

function updatePageLayeredBackground() {
  // 背景色/グラデーションを決定
  let baseBackground;
  if (pageBackgroundType === 'gradient') {
    baseBackground = createGradient(pageGradientColor1, pageGradientColor2, pageGradientDirection);
  } else {
    baseBackground = pageBackgroundColor;
  }
  
  // 画像が存在する場合は、背景の上に画像を重ねる
  let finalBackground;
  if (pageImage) {
    // 画像の透過度を適用した画像レイヤー
    const imageLayer = `url(${pageImage})`;
    finalBackground = `${imageLayer}, ${baseBackground}`;
    
    // 背景関連のプロパティをまとめて適用
    applyCSSChanges({
      '.page': {
        'background': finalBackground,
        'backgroundSize': `${pageImageSize}% auto, cover`,
        'backgroundPosition': `${pageImagePositionX}% ${pageImagePositionY}%, center`,
        'backgroundRepeat': 'no-repeat, no-repeat',
        'backgroundAttachment': 'scroll, scroll'
      }
    });
    
    // 画像透過度制御
    if (pageImageOpacity < 1.0) {
      // 透過度が1未満の場合は、背景画像に直接フィルターを適用
      const transparentImageLayer = `url(${pageImage})`;
      applyCSSChanges({
        '.page': {
          'background': `${transparentImageLayer}, ${baseBackground}`,
          'backgroundSize': `${pageImageSize}% auto, cover`,
          'backgroundPosition': `${pageImagePositionX}% ${pageImagePositionY}%, center`,
          'backgroundRepeat': 'no-repeat, no-repeat',
          'position': 'relative'
        },
        '.page::before': {
          'content': '""',
          'position': 'absolute',
          'top': '0',
          'left': '0',
          'right': '0',
          'bottom': '0',
          'background': `url(${pageImage})`,
          'backgroundSize': `${pageImageSize}% auto`,
          'backgroundPosition': `${pageImagePositionX}% ${pageImagePositionY}%`,
          'backgroundRepeat': 'no-repeat',
          'opacity': pageImageOpacity.toString(),
          'pointerEvents': 'none',
          'zIndex': '1'
        }
      });
      
      // ベース背景のみ適用
      applyCSSChanges({
        '.page': {
          'background': baseBackground,
          'position': 'relative'
        }
      });
    }
  } else {
    // 画像がない場合はベース背景のみ
    applyCSSChanges({
      '.page': {
        'background': baseBackground
      }
    });
    
    // 疑似要素をクリア
    applyCSSChanges({
      '.page::before': {
        'display': 'none'
      }  
    });
  }
  
  // 小さなプレビューも更新
  const preview = document.getElementById('page-background-preview');
  if (preview) {
    preview.style.background = finalBackground || baseBackground;
    if (pageImage) {
      preview.style.backgroundSize = `${pageImageSize}% auto, cover`;
      preview.style.backgroundPosition = `${pageImagePositionX}% ${pageImagePositionY}%, center`;
      preview.style.backgroundRepeat = 'no-repeat, no-repeat';
    }
  }
  
  // 画像プレビューも更新
  const imagePreview = document.getElementById('page-image-preview');
  if (imagePreview && pageImage) {
    imagePreview.style.background = `url(${pageImage})`;
    imagePreview.style.backgroundSize = 'cover';
    imagePreview.style.backgroundPosition = 'center';
    imagePreview.style.opacity = pageImageOpacity.toString();
  }
}

function clearPageImage() {
  pageImage = null;
  
  // ファイル入力をリセット
  const fileInput = document.querySelector('.image-upload');
  if (fileInput) fileInput.value = '';
  
  // 背景を更新
  updatePageLayeredBackground();
  
  // 保存ボタンを有効化
  document.getElementById('saveBtn').disabled = false;
}

function handlePageImageUpload(input) {
  console.log('画像アップロード開始:', input);
  const file = input.files[0];
  if (!file) {
    console.log('ファイルが選択されていません');
    return;
  }
  
  console.log('選択されたファイル:', file.name, file.type);

  const reader = new FileReader();
  reader.onload = function(e) {
    console.log('ファイル読み込み完了');
    pageImage = e.target.result;
    updatePageLayeredBackground();
    
    // 保存ボタンを有効化
    document.getElementById('saveBtn').disabled = false;
  };
  reader.onerror = function(e) {
    console.error('ファイル読み込みエラー:', e);
  };
  reader.readAsDataURL(file);
}

function updatePageImageOpacity(opacity) {
  pageImageOpacity = opacity / 100;
  document.getElementById('opacity-value').textContent = opacity + '%';
  updatePageLayeredBackground();
}

function updatePageBackgroundColor(color) {
  pageBackgroundColor = color;
  pageBackgroundType = 'solid';
  updatePageLayeredBackground();
  
  // 保存ボタンを有効化
  document.getElementById('saveBtn').disabled = false;
}

function updatePageBackgroundGradient() {
  pageBackgroundType = 'gradient';
  const gradientDiv = document.getElementById('page-background-gradient');
  if (gradientDiv && gradientDiv.style.display !== 'none') {
    const colors = gradientDiv.querySelectorAll('input[type="color"]');
    const direction = gradientDiv.querySelector('select').value;
    if (colors.length >= 2) {
      pageGradientColor1 = colors[0].value;
      pageGradientColor2 = colors[1].value;
      pageGradientDirection = direction;
    }
  }
  updatePageLayeredBackground();
}

function updatePageImageSize(size) {
  pageImageSize = size;
  document.getElementById('size-value').textContent = size + '%';
  updatePageLayeredBackground();
}

function updatePageImagePositionX(posX) {
  pageImagePositionX = posX;
  document.getElementById('position-x-value').textContent = posX + '%';
  updatePageLayeredBackground();
}

function updatePageImagePositionY(posY) {
  pageImagePositionY = posY;
  document.getElementById('position-y-value').textContent = posY + '%';
  updatePageLayeredBackground();
}

/* ---------- カード形状適用機能 ---------- */
function applyCardShape(shapeName) {
  console.log('=== CARD SHAPE: applyCardShape called ===');
  console.log('Shape name:', shapeName);
  
  const preset = cardShapePresets[shapeName];
  if (!preset) {
    console.error('❌ Preset not found for shape:', shapeName);
    return;
  }
  
  console.log('Preset found:', preset);

  // 全てのスタイルを明示的にリセット
  const cssChanges = { 
    '.card': {
      'border': 'none',
      'border-left': 'none',
      'border-right': 'none', 
      'border-top': 'none',
      'border-bottom': 'none',
      'box-shadow': 'none',
      'border-radius': '8px'
    }
  };
  
  // プリセットの値を適用
  Object.entries(preset).forEach(([property, value]) => {
    cssChanges['.card'][property] = value;
    console.log(`  ${property}: ${value}`);
  });

  console.log('CSS changes for card shape:', cssChanges);
  applyCSSChanges(cssChanges);
  
  // 保存ボタンを有効化
  document.getElementById('saveBtn').disabled = false;
  console.log('=== CARD SHAPE COMPLETE ===');
}

/* ---------- カラーパレット適用機能 ---------- */
function applyColorPalette(paletteKey) {
  const palette = colorPalettes[paletteKey];
  if (!palette) return;

  // 各カラーピッカーを更新
  document.getElementById('main-color').value = palette.main;
  document.getElementById('sub-color').value = palette.sub;
  document.getElementById('text-color').value = palette.text;
  document.getElementById('background-color').value = palette.background;
  document.getElementById('quote-color').value = palette.quote;
  document.getElementById('card-color').value = palette.card;

  // プレビュースウォッチを更新
  updateColorPreview(palette);

  // CSSを適用
  applyCSSChanges({
    '.text-block h1': {'color': palette.main},
    '.text-block h1:first-child': {'color': palette.main},
    '.card h3': {'color': palette.main},
    '.text-block h2': {'color': palette.sub},
    '.text-block p': {'color': palette.text},
    'li': {'color': palette.text},
    'body': {'color': palette.text, 'background': palette.background},
    '.footer': {'color': palette.text},
    '.page': {'background': palette.background},
    '.quote': {'color': palette.quote},
    'blockquote': {'color': palette.quote},
    '.card': {'background': palette.card}
  });
}

function updateSingleColor(colorType, value) {
  console.log(`=== STEP 3: updateSingleColor called ===`);
  console.log(`Input - Type: ${colorType}, Value: ${value}`);
  
  const cssChanges = {};
  
  switch(colorType) {
    case 'main':
      cssChanges['.text-block h1'] = {'color': value};
      cssChanges['.text-block h1:first-child'] = {'color': value};
      cssChanges['.card h3'] = {'color': value};
      break;
    case 'sub':
      cssChanges['.text-block h2'] = {'color': value};
      break;
    case 'text':
      cssChanges['.text-block p'] = {'color': value};
      cssChanges['li'] = {'color': value};
      cssChanges['body'] = {'color': value};
      cssChanges['.footer'] = {'color': value};
      break;
    case 'background':
      cssChanges['.page'] = {'background': value};
      cssChanges['body'] = {'background': value};
      break;
    case 'quote':
      cssChanges['.quote'] = {'color': value};
      cssChanges['blockquote'] = {'color': value};
      break;
    case 'card':
      cssChanges['.card'] = {'background': value};
      break;
  }
  
  console.log('CSS Changes to apply:', cssChanges);
  console.log('Calling applyCSSChanges...');
  
  testApplyCSSChanges(cssChanges);
  
  // プレビューを更新
  const currentPalette = {
    main: document.getElementById('main-color').value,
    sub: document.getElementById('sub-color').value,
    text: document.getElementById('text-color').value,
    background: document.getElementById('background-color').value,
    quote: document.getElementById('quote-color').value,
    card: document.getElementById('card-color').value
  };
  updateColorPreview(currentPalette);
  console.log('=== STEP 3 COMPLETE ===');
}

/* ---------- 強制プレビュー更新機能 ---------- */
function forceUpdatePreview() {
  console.log('適用ボタンが押されました - カラーを適用中...');
  
  // 現在のカラー値を取得
  const currentPalette = {
    main: document.getElementById('main-color').value,
    sub: document.getElementById('sub-color').value,
    text: document.getElementById('text-color').value,
    background: document.getElementById('background-color').value,
    quote: document.getElementById('quote-color').value,
    card: document.getElementById('card-color').value
  };
  
  console.log('適用するカラー:', currentPalette);
  
  // CSSを適用
  applyCSSChanges({
    '.text-block h1': {'color': currentPalette.main},
    '.text-block h1:first-child': {'color': currentPalette.main},
    '.card h3': {'color': currentPalette.main},
    '.text-block h2': {'color': currentPalette.sub},
    '.text-block p': {'color': currentPalette.text},
    'li': {'color': currentPalette.text},
    'body': {'color': currentPalette.text, 'background': currentPalette.background},
    '.footer': {'color': currentPalette.text},
    '.page': {'background': currentPalette.background},
    '.quote': {'color': currentPalette.quote},
    'blockquote': {'color': currentPalette.quote},
    '.card': {'background': currentPalette.card}
  });
  
  // ボタンの状態をリセット
  const applyBtn = document.querySelector('.apply-colors-btn');
  if (applyBtn) {
    applyBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    applyBtn.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
    applyBtn.innerHTML = '✨ カラーを適用';
  }
  
  console.log('カラー適用完了!');
}

function updateColorPreview(palette) {
  const preview = document.getElementById('color-palette-preview');
  if (!preview) return;
  
  const mainSwatch = preview.querySelector('[data-role="main"]');
  const subSwatch = preview.querySelector('[data-role="sub"]');
  const textSwatch = preview.querySelector('[data-role="text"]');
  const backgroundSwatch = preview.querySelector('[data-role="background"]');
  const quoteSwatch = preview.querySelector('[data-role="quote"]');
  const cardSwatch = preview.querySelector('[data-role="card"]');
  
  if (mainSwatch) mainSwatch.style.backgroundColor = palette.main;
  if (subSwatch) subSwatch.style.backgroundColor = palette.sub;
  if (textSwatch) textSwatch.style.backgroundColor = palette.text;
  if (backgroundSwatch) backgroundSwatch.style.backgroundColor = palette.background;
  if (quoteSwatch) quoteSwatch.style.backgroundColor = palette.quote;
  if (cardSwatch) cardSwatch.style.backgroundColor = palette.card;
}

/* ---------- リストマーク適用機能 ---------- */
function applyListMark(markType) {
  const mark = listMarkOptions[markType];
  if (!mark) return;

  // プレビューを更新
  const preview = document.querySelector('.mark-preview');
  if (preview) preview.textContent = mark;

  applyCSSChanges({
    'li::before': {
      'content': `"${mark}"`
    }
  });
  
  // 保存ボタンを有効化
  document.getElementById('saveBtn').disabled = false;
}

/* ---------- トグル機能 ---------- */
function toggleSection(sectionId) {
  const content = document.getElementById(sectionId);
  const icon = document.querySelector(`[data-toggle="${sectionId}"] .toggle-icon`);
  
  if (content.style.maxHeight && content.style.maxHeight !== '0px') {
    content.style.maxHeight = '0px';
    icon.classList.add('collapsed');
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    icon.classList.remove('collapsed');
  }
}

// テスト用のupdatePreview関数
function testUpdatePreview() {
  console.log(`=== STEP 5: testUpdatePreview called ===`);
  
  if (!currentTemplate) {
    console.error('❌ CRITICAL: No template loaded in updatePreview');
    return;
  }
  
  console.log('✓ currentTemplate exists');
  console.log('currentTemplate sample (first 200 chars):', currentTemplate.substring(0, 200));
  
  try {
    console.log('Converting Jinja2 to Nunjucks...');
    
    // テンプレートの構文エラーを修正
    let fixedTemplate = currentTemplate;
    
    // 不正な {{ variable ;css: value;}} パターンを修正
    fixedTemplate = fixedTemplate.replace(
      /\{\{\s*([^};]+)\s*;[^}]*\}\}/g, 
      '{{ $1 }}'
    );
    
    console.log('Template syntax errors fixed');
    
    const convertedSource = convertJinja2ToNunjucks(fixedTemplate);
    console.log('✓ Conversion successful');
    
    console.log('Processing context data...');
    const processedContext = processContextData(currentContext);
    console.log('✓ Context processing successful');
    console.log('Context keys:', Object.keys(processedContext));
    
    console.log('Rendering with Nunjucks...');
    console.log('Template source around line 165:');
    const lines = convertedSource.split('\n');
    for (let i = 160; i < 170 && i < lines.length; i++) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
    }
    
    const rendered = nunjucks.renderString(convertedSource, processedContext);
    console.log('✓ Nunjucks rendering successful');
    console.log('Rendered content length:', rendered.length);
    console.log('Rendered sample (first 300 chars):', rendered.substring(0, 300));
    
    const scaledRendered = rendered.replace(
      /<style>/,
      '<style>body { transform: scale(0.7); transform-origin: top left; width: 143%; height: 143%; overflow: hidden; }'
    );
    console.log('✓ Scaling CSS added');
    
    const iframe = document.getElementById("previewFrame");
    if (!iframe) {
      console.error('❌ CRITICAL: Preview iframe not found!');
      return;
    }
    
    console.log('✓ Preview iframe found');
    console.log('Setting iframe srcdoc...');
    iframe.srcdoc = scaledRendered;
    console.log('✓ iframe srcdoc set successfully');
    
    // iframe の内容が実際に更新されたかチェック
    setTimeout(() => {
      console.log('Checking iframe content after 500ms...');
      console.log('iframe.contentDocument exists:', !!iframe.contentDocument);
      if (iframe.contentDocument) {
        console.log('iframe document title:', iframe.contentDocument.title);
        console.log('iframe body exists:', !!iframe.contentDocument.body);
      }
    }, 500);
    
  } catch (err) {
    console.error("❌ Preview update error:", err);
    console.error("Error stack:", err.stack);
  }
  
  console.log('=== STEP 5 COMPLETE ===');
}

/* ---------- リアルタイム更新機能 ---------- */
function updatePreview() {
  if (!currentTemplate) {
    console.log('No template loaded, skipping preview update');
    return;
  }
  
  try {
    console.log('Updating preview with current template');
    
    // テンプレートの構文エラーを修正
    let fixedTemplate = currentTemplate;
    fixedTemplate = fixedTemplate.replace(
      /\{\{\s*([^};]+)\s*;[^}]*\}\}/g, 
      '{{ $1 }}'
    );
    
    const convertedSource = convertJinja2ToNunjucks(fixedTemplate);
    const processedContext = processContextData(currentContext);
    const rendered = nunjucks.renderString(convertedSource, processedContext);
    
    const scaledRendered = rendered.replace(
      /<style>/,
      '<style>body { transform: scale(0.7); transform-origin: top left; width: 143%; height: 143%; overflow: hidden; }'
    );
    
    console.log('Setting iframe srcdoc with updated content');
    document.getElementById("previewFrame").srcdoc = scaledRendered;
  } catch (err) {
    console.error("Preview update error:", err);
  }
}

/* ---------- CSS置換機能 ---------- */
// テスト用のapplyCSSChanges関数
function testApplyCSSChanges(cssChanges) {
  console.log(`=== STEP 4: testApplyCSSChanges called ===`);
  console.log('Input cssChanges:', cssChanges);
  console.log('currentTemplate length:', currentTemplate ? currentTemplate.length : 'N/A');
  
  if (!currentTemplate) {
    console.error('❌ CRITICAL: currentTemplate is null in applyCSSChanges');
    return;
  }
  
  let modifiedTemplate = currentTemplate;
  let changesMade = 0;
  
  Object.entries(cssChanges).forEach(([selector, properties]) => {
    console.log(`Processing selector: ${selector}`);
    
    // セレクターがテンプレート内に存在するかチェック
    const selectorExists = currentTemplate.includes(selector);
    console.log(`Selector "${selector}" exists in template: ${selectorExists}`);
    
    if (!selectorExists) {
      console.warn(`⚠️ Selector "${selector}" not found in template!`);
      
      // テンプレート内の実際のセレクターを探す
      const possibleSelectors = currentTemplate.match(/\.[a-zA-Z-_][^{]*{/g);
      console.log('Available selectors in template:', possibleSelectors);
    }
    
    Object.entries(properties).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      console.log(`  Processing property: ${cssProperty} = ${value}`);
      
      // より詳細な正規表現パターン
      const patterns = [
        // 既存のプロパティを置換
        new RegExp(`(${selector.replace('.', '\\.')}[^{]*{[^}]*${cssProperty}:\\s*)([^;]+)`, 'g'),
        // セレクタの最後の}の前に新しいプロパティを追加
        new RegExp(`(${selector.replace('.', '\\.')}[^{]*{[^}]*)(})`, 'g')
      ];
      
      let replaced = false;
      
      // 既存のプロパティを置換
      const originalTemplate = modifiedTemplate;
      modifiedTemplate = modifiedTemplate.replace(patterns[0], (match, before, oldValue) => {
        replaced = true;
        changesMade++;
        console.log(`    ✓ Replaced: ${oldValue} → ${value}`);
        return before + value;
      });
      
      // プロパティが存在しない場合は追加
      if (!replaced) {
        const beforeAdd = modifiedTemplate;
        modifiedTemplate = modifiedTemplate.replace(patterns[1], (match, before, closeBrace) => {
          changesMade++;
          console.log(`    ✓ Added: ${cssProperty}: ${value}`);
          const separator = before.trim().endsWith(';') || before.trim() === '{' ? '' : ';';
          return before + separator + `${cssProperty}: ${value};` + closeBrace;
        });
        
        if (beforeAdd === modifiedTemplate) {
          console.warn(`    ❌ Failed to add property for selector: ${selector}`);
        }
      }
    });
  });
  
  console.log(`Total changes made: ${changesMade}`);
  
  if (changesMade > 0) {
    currentTemplate = modifiedTemplate;
    console.log('✓ Template updated, calling updatePreview...');
    testUpdatePreview();
  } else {
    console.error('❌ NO CHANGES MADE TO TEMPLATE!');
  }
  
  // 保存ボタンを有効化
  document.getElementById('saveBtn').disabled = false;
  console.log('=== STEP 4 COMPLETE ===');
}

function applyCSSChanges(cssChanges) {
  // 本来の関数は変更せずに保持
  let modifiedTemplate = currentTemplate;
  
  Object.entries(cssChanges).forEach(([selector, properties]) => {
    Object.entries(properties).forEach(([property, value]) => {
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      
      const patterns = [
        new RegExp(`(${selector.replace('.', '\\.')}[^{]*{[^}]*${cssProperty}:\\s*)([^;]+)`, 'g'),
        new RegExp(`(${selector.replace('.', '\\.')}[^{]*{[^}]*)(})`, 'g')
      ];
      
      let replaced = false;
      
      modifiedTemplate = modifiedTemplate.replace(patterns[0], (match, before, oldValue) => {
        replaced = true;
        return before + value;
      });
      
      if (!replaced) {
        modifiedTemplate = modifiedTemplate.replace(patterns[1], (match, before, closeBrace) => {
          const separator = before.trim().endsWith(';') || before.trim() === '{' ? '' : ';';
          return before + separator + `${cssProperty}: ${value};` + closeBrace;
        });
      }
    });
  });
  
  currentTemplate = modifiedTemplate;
  updatePreview();
  
  document.getElementById('saveBtn').disabled = false;
}

/* ---------- ファイル保存機能 ---------- */
function saveModifiedTemplate() {
  if (!currentTemplate) {
    alert('保存するテンプレートがありません');
    return;
  }

  // 元のファイル名を取得
  const fileInput = document.getElementById('fileInput');
  const originalFileName = fileInput.files[0] ? fileInput.files[0].name : 'template.j2';
  const baseName = originalFileName.replace('.j2', '');
  
  // 新しいファイル名を生成（タイムスタンプ付き）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const newFileName = `${baseName}_modified_${timestamp}.j2`;

  // Blobを作成してダウンロード
  const blob = new Blob([currentTemplate], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = newFileName;
  downloadLink.style.display = 'none';
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // URLを解放
  URL.revokeObjectURL(url);
  
  // ステータス更新
  document.getElementById('status').textContent = `✓ ${newFileName} として保存しました`;
  document.getElementById('status').style.color = '#22c55e';
  
  setTimeout(() => {
    document.getElementById('status').textContent = '';
  }, 3000);
}

/* ---------- 情報パネル更新機能 ---------- */
function updateInfoPanel(analysis, sourceLength) {
  const infoPanel = document.querySelector('.info-panel');
  
  if (!infoPanel) {
    console.error('Info panel not found!');
    return;
  }
    infoPanel.innerHTML = `




    <div class="info-section">
      <div class="toggle-header" data-toggle="colors" onclick="toggleSection('colors')">
        <span class="toggle-icon">▼</span>
        <h3 style="margin:0;">🎨 カラーパレット</h3>
      </div>
      <div id="colors" class="collapsible-content" style="max-height:500px;">
        <div class="info-item">
          <span class="info-label">プリセット</span>
          <div class="input-group">
            <select class="select-input" onchange="applyColorPalette(this.value)">
              <option value="default">🌿 デフォルト</option>
              <option value="pop">🌈 ポップ</option>
              <option value="cool">❄️ クール</option>
              <option value="warm">🌅 ウォーム</option>
              <option value="nature">🌱 ナチュラル</option>
              <option value="elegant">🌙 エレガント</option>
              <option value="sunset">🌅 サンセット</option>
              <option value="ocean">🌊 オーシャン</option>
            </select>
          </div>
        </div>
        <div class="color-palette-preview" id="color-palette-preview">
          <div class="color-swatch" data-role="main"></div>
          <div class="color-swatch" data-role="sub"></div>
          <div class="color-swatch" data-role="text"></div>
          <div class="color-swatch" data-role="background"></div>
          <div class="color-swatch" data-role="quote"></div>
          <div class="color-swatch" data-role="card"></div>
        </div>
        <div class="info-item">
          <span class="info-label">メインカラー</span>
          <div class="input-group">
            <input type="color" class="color-input" id="main-color" value="#000000">
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">サブカラー</span>
          <div class="input-group">
            <input type="color" class="color-input" id="sub-color" value="#000000">
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">テキストカラー</span>
          <div class="input-group">
            <input type="color" class="color-input" id="text-color" value="#000000">
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">背景色</span>
          <div class="input-group">
            <input type="color" class="color-input" id="background-color" value="#f2f6fc">
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">引用カラー</span>
          <div class="input-group">
            <input type="color" class="color-input" id="quote-color" value="#5B76A8">
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">カード背景</span>
          <div class="input-group">
            <input type="color" class="color-input" id="card-color" value="#ffffff">
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="toggle-header" data-toggle="page-background" onclick="toggleSection('page-background')">
        <span class="toggle-icon collapsed">▼</span>
        <h3 style="margin:0;">🖼️ 背景画像</h3>
      </div>
      <div id="page-background" class="collapsible-content" style="max-height:0px;">
        <div class="info-item">
          <span class="info-label">画像アップロード</span>
          <div class="input-group">
            <input type="file" class="image-upload" accept="image/*" onchange="handlePageImageUpload(this)">
            <button onclick="clearPageImage()" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">クリア</button>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">透明度</span>
          <div class="input-group">
            <input type="range" min="10" max="100" value="100" oninput="updatePageImageOpacity(this.value)">
            <span id="opacity-value">100%</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">サイズ (%)</span>
          <div class="input-group">
            <input type="range" min="5" max="100" value="20" oninput="updatePageImageSize(this.value)">
            <span id="size-value">20%</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">水平位置</span>
          <div class="input-group">
            <input type="range" min="0" max="100" value="50" oninput="updatePageImagePositionX(this.value)">
            <span id="position-x-value">50%</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">垂直位置</span>
          <div class="input-group">
            <input type="range" min="0" max="100" value="50" oninput="updatePageImagePositionY(this.value)">
            <span id="position-y-value">50%</span>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">プレビュー</span>
          <div id="page-image-preview" style="width: 50px; height: 50px; border: 1px solid #ddd; margin-top: 5px; background-size: cover; background-position: center;"></div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="toggle-header" data-toggle="card-styles" onclick="toggleSection('card-styles')">
        <span class="toggle-icon collapsed">▼</span>
        <h3 style="margin:0;">📦 カードスタイル</h3>
      </div>
      <div id="card-styles" class="collapsible-content" style="max-height:0px;">
        <div class="info-item">
          <span class="info-label">形状</span>
          <div class="input-group">
            <select class="select-input" onchange="applyCardShape(this.value)">
              <option value="default">左ボーダー</option>
              <option value="rounded">丸角</option>
              <option value="square">角型</option>
              <option value="shadow">影付き</option>
              <option value="elevated">浮き上がり</option>
              <option value="topBorder">上ボーダー</option>
            </select>
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">リストマーク</span>
          <div class="input-group">
            <select class="select-input" onchange="applyListMark(this.value)">
              <option value="check">✓ チェック</option>
              <option value="arrow">▶ 矢印</option>
              <option value="bullet">● 丸</option>
              <option value="star">★ 星</option>
            </select>
            <span class="mark-preview">✓</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // HTML生成後、JavaScriptでイベントハンドラーを設定
  setTimeout(() => {
    setupColorEventHandlers();
  }, 100);
}

function setupColorEventHandlers() {
  console.log('=== STEP 1: setupColorEventHandlers called ===');
  
  const colorInputs = [
    { id: 'main-color', type: 'main' },
    { id: 'sub-color', type: 'sub' },
    { id: 'text-color', type: 'text' },
    { id: 'background-color', type: 'background' },
    { id: 'quote-color', type: 'quote' },
    { id: 'card-color', type: 'card' }
  ];
  
  colorInputs.forEach(({ id, type }) => {
    const element = document.getElementById(id);
    console.log(`Checking element ${id}:`, !!element);
    if (element) {
      console.log(`✓ Setting up handler for ${id}`);
      
      element.addEventListener('input', function(e) {
        console.log(`=== EVENT FIRED: ${type} changed to ${e.target.value} ===`);
        testUpdateSingleColor(type, e.target.value);
      });
      
      element.addEventListener('change', function(e) {
        console.log(`=== CHANGE EVENT: ${type} changed to ${e.target.value} ===`);
        testUpdateSingleColor(type, e.target.value);
      });
      
      // 強制的にテストイベントを発生させる
      element.addEventListener('click', function() {
        console.log(`=== CLICK TEST: ${id} clicked ===`);
      });
      
    } else {
      console.error(`✗ Element not found: ${id}`);
    }
  });
  
  console.log('=== STEP 1 COMPLETE: Event handlers setup complete ===');
}

// テスト用の関数
function testUpdateSingleColor(colorType, value) {
  console.log(`=== STEP 2: testUpdateSingleColor called ===`);
  console.log(`Type: ${colorType}, Value: ${value}`);
  console.log(`currentTemplate exists: ${!!currentTemplate}`);
  console.log(`currentTemplate length: ${currentTemplate ? currentTemplate.length : 'N/A'}`);
  
  if (!currentTemplate) {
    console.error('❌ CRITICAL: currentTemplate is null/undefined');
    return;
  }
  
  console.log('✓ currentTemplate exists, proceeding to updateSingleColor');
  updateSingleColor(colorType, value);
}


/* ---------- グラデーション制御機能 ---------- */
function toggleGradientMode(mode, targetId) {
  const solidEl = document.getElementById(`${targetId}-solid`);
  const gradientEl = document.getElementById(`${targetId}-gradient`);
  
  if (mode === 'gradient') {
    solidEl.style.display = 'none';
    gradientEl.style.display = 'block';
    updateCardGradient();
  } else {
    solidEl.style.display = 'flex';
    gradientEl.style.display = 'none';
  }
}

function updateCardGradient() {
  const gradientDiv = document.getElementById('card-bg-gradient');
  if (!gradientDiv || gradientDiv.style.display === 'none') return;
  
  const colors = gradientDiv.querySelectorAll('input[type="color"]');
  const direction = gradientDiv.querySelector('select').value;
  
  if (colors.length >= 2) {
    const gradient = createGradient(colors[0].value, colors[1].value, direction);
    const preview = document.getElementById('card-gradient-preview');
    preview.style.background = gradient;
    
    applyCSSChanges({'.card': {'background': gradient}});
  }
}

/* ---------- main : .j2 → HTML をレンダリング ---------- */
async function handleRender() {
  const status = document.getElementById("status");
  status.textContent = "";
  const file = document.getElementById("fileInput").files[0];
  if (!file) { 
    status.textContent = "ファイルを選択してください"; 
    return; 
  }

  try {
    const source = await readFileAsText(file);
    document.getElementById("sourceArea").value = source;

    // グローバル変数に保存
    currentTemplate = source;
    currentContext = sampleContext;

    // テンプレートを解析して情報パネルを更新
    const analysis = analyzeTemplate(source);
    updateInfoPanel(analysis, source.length);

    // 初回プレビュー表示
    updatePreview();
    
    // 保存ボタンを無効化（変更がまだない状態）
    document.getElementById('saveBtn').disabled = true;
  } catch (err) {
    status.textContent = "レンダリング失敗: " + err.message;
    console.error("Detailed error:", err);
  }
}

// 最初にJavaScriptが読み込まれたことを確認
console.log('=== JAVASCRIPT LOADED SUCCESSFULLY ===');
console.log('Current URL:', window.location.href);
console.log('Document ready state:', document.readyState);

// 即座にテスト関数を追加
window.manualTest = function() {
  console.log('=== MANUAL TEST FUNCTION CALLED ===');
  if (currentTemplate) {
    console.log('currentTemplate exists, length:', currentTemplate.length);
    testUpdateSingleColor('main', '#ff0000');
  } else {
    console.log('currentTemplate does not exist - please load a template first');
  }
};

console.log('Manual test function added. Call window.manualTest() to test manually.');

/* ---------- イベントハンドラ登録 ---------- */
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== DOM CONTENT LOADED ===');
  console.log('Setting up main event handlers...');
  
  // 要素の存在確認
  const renderBtn = document.getElementById("renderBtn");
  const saveBtn = document.getElementById("saveBtn");
  const browseBtn = document.getElementById("browseBtn");
  const fileInput = document.getElementById("fileInput");
  
  console.log('Main elements found:', {
    renderBtn: !!renderBtn,
    saveBtn: !!saveBtn,
    browseBtn: !!browseBtn,
    fileInput: !!fileInput
  });
  
  if (renderBtn) {
    renderBtn.addEventListener("click", function(e) {
      console.log('Render button clicked!');
      handleRender();
    });
  }
  
  if (saveBtn) {
    saveBtn.addEventListener("click", saveModifiedTemplate);
  }
  
  if (browseBtn) {
    browseBtn.addEventListener("click", function() {
      console.log('Browse button clicked');
      document.getElementById("fileInput").click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener("change", function() {
      console.log('File input changed');
      const file = this.files[0];
      const selectedFileSpan = document.getElementById("selectedFile");
      if (file) {
        console.log('File selected:', file.name);
        selectedFileSpan.textContent = `選択済み: ${file.name}`;
        selectedFileSpan.style.color = "#22c55e";
      } else {
        selectedFileSpan.textContent = "";
      }
    });
  }
  
  console.log('Event handlers setup complete');
});