/**
 * 液体垂れエフェクト用 GLSL シェーダー定義
 *
 * テーパーカプセル SDF と smin（滑らか合成）を使用して
 * 粘性の高い液体が画面上部からなだらかに垂れ落ちるエフェクトを生成する
 *
 * アプローチ:
 * - 溜まり: SDF（符号付き距離関数）でfBMノイズ付きの境界を定義
 * - 各垂れ: テーパーカプセルSDFで根元が太く先端が細い形状を定義
 * - 接続: smin で溜まりと垂れをなだらかに合成（サイン波的な有機接続）
 */

/**
 * 頂点シェーダー
 */
export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/**
 * フラグメントシェーダー
 */
export const fragmentShader = /* glsl */ `
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_scroll;   // スクロール進捗（0.0〜1.0）
  varying vec2 vUv;

  // ============================================
  // ハッシュ・ノイズ関数
  // ============================================

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float hash1(float n) {
    return fract(sin(n) * 43758.5453123);
  }

  // 2D Value Noise
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // fBM（フラクタルブラウン運動）: 4オクターブ
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  // ============================================
  // SDF ユーティリティ
  // ============================================

  /**
   * smin（滑らかな最小値合成）
   * 2つのSDFを有機的に繋ぐ。k が大きいほどなだらかな接続になる
   * これにより溜まりと垂れがサイン波的に滑らかに繋がる
   */
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  /**
   * テーパーカプセル SDF
   * 点 a から点 b へ向かう直線に沿い、半径が ra から rb へ滑らかに変化する形状
   * これにより根元が太く先端が細い液垂れ形状を実現
   */
  float sdTaperedCapsule(vec2 p, vec2 a, vec2 b, float ra, float rb) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float r = mix(ra, rb, h);
    return length(pa - ba * h) - r;
  }

  // ============================================
  // メイン処理
  // ============================================
  void main() {
    float aspect = u_resolution.x / u_resolution.y;
    vec2 uv = vUv;
    uv.x *= aspect;
    // Y反転: 画面上部 = 0, 下部 = 1
    uv.y = 1.0 - uv.y;

    // スクロールによるUVオフセット
    // 500vh 分の仮想空間をスクロールで移動（4画面分下にオフセット）
    uv.y += u_scroll * 4.0;

    float time = u_time * 0.2;

    // ================================================
    // 1. 画面上部の液体溜まり
    // ================================================

    // fBMノイズで揺れる自然な境界線
    float basePool = 0.13;
    float poolWave = fbm(vec2(uv.x * 3.0 + time * 0.1, time * 0.08)) * 0.05
                   + noise(vec2(uv.x * 6.0 - time * 0.05, 0.5)) * 0.02;
    float poolEdge = basePool + poolWave;

    // 溜まりのSDF（負 = 液体内部）
    float field = uv.y - poolEdge;

    // ================================================
    // 2. テーパーカプセルで液垂れを生成
    // ================================================

    const int NUM_DRIPS = 16;

    for (int i = 0; i < NUM_DRIPS; i++) {
      float fi = float(i);

      // 各液垂れの固有パラメータ（ハッシュでランダム配置）
      float dripX = 0.05 + hash1(fi * 13.37) * (aspect - 0.1);   // X位置（より広い範囲）
      float maxLen = 5.25 + hash1(fi * 7.13) * 0.45;              // 最大長さ
      float topRadius = 0.08 + hash1(fi * 5.71) * 0.040;          // 根元の太さ
      float tipRadius = 0.018 + hash1(fi * 9.23) * 0.007;         // 先端の丸み
      float speed = 1.2 + hash1(fi * 3.91) * 1.1;                 // 落下速度

      // 各滴の出現タイミング（時間差で順番に出現）
      // 0〜6秒の間にバラバラに出現開始する
      float startDelay = hash1(fi * 41.23) * 6.0;

      // 溜まりのエッジ位置を垂れのX座標で計算
      // （垂れが溜まりの境界から正確に始まるように）
      float localPoolWave = fbm(vec2(dripX * 3.0 + time * 0.1, time * 0.08)) * 0.05
                          + noise(vec2(dripX * 6.0 - time * 0.05, 0.5)) * 0.02;
      float localPoolEdge = basePool + localPoolWave;

      // 出現後の経過時間（modなし = 消えない）
      float elapsed = max(time - startDelay, 0.0);
      // maxLen に達したらそれ以上伸びない（そのまま残る）
      float dripLen = min(elapsed * speed, maxLen);

      // まだ出現していない垂れはスキップ
      if (dripLen < 0.005) continue;

      // テーパーカプセル: 溜まりエッジ → 先端
      vec2 startPos = vec2(dripX, localPoolEdge);
      vec2 endPos = vec2(dripX, localPoolEdge + dripLen);

      float dripSDF = sdTaperedCapsule(uv, startPos, endPos, topRadius, tipRadius);

      // smin で溜まりとなだらかに合成
      // k=0.08 でさらになだらかなサイン波的接続を実現
      field = smin(field, dripSDF, 0.08);
    }

    // ================================================
    // 3. 液体マスクの生成
    // ================================================

    // 滑らかなエッジでマスクを生成
    float liquidMask = smoothstep(0.003, -0.002, field);
    // エッジ部分のサブサーフェス表現用マスク
    float edgeMask = smoothstep(0.012, -0.003, field) - liquidMask;

    // ================================================
    // 4. 色と質感
    // ================================================

    // キャラメル / 琥珀色パレット
    vec3 colorDeep = vec3(0.50, 0.15, 0.02);      // 深い琥珀
    vec3 colorMid = vec3(0.78, 0.35, 0.05);        // キャラメル
    vec3 colorLight = vec3(0.92, 0.55, 0.12);      // ハニー
    vec3 colorHighlight = vec3(1.0, 0.82, 0.50);   // ハイライト

    // fBMで滑らかな色の変化
    float colorVar = fbm(vec2(uv.x * 3.0 + time * 0.03, uv.y * 2.0));
    vec3 liquidColor = mix(colorDeep, colorMid, colorVar);

    // 液体のエッジ付近は光が透過して明るくなる（サブサーフェススキャタリング風）
    float edgeBright = smoothstep(-0.002, 0.006, field);
    liquidColor = mix(liquidColor, colorLight, edgeBright * 0.5);

    // 柔らかいスペキュラ（低周波ノイズで滑らかな光沢）
    float spec = noise(vec2(uv.x * 4.0 + time * 0.03, uv.y * 3.0 - time * 0.02));
    spec = smoothstep(0.55, 0.80, spec) * 0.18;
    liquidColor += colorHighlight * spec;

    // 液体の厚い部分は暗く（深み表現）
    float depth = smoothstep(0.0, -0.05, field);
    liquidColor = mix(liquidColor, colorDeep * 0.6, depth * 0.3);

    // ================================================
    // 5. 最終合成
    // ================================================

    // 背景色（参考画像に合わせた明るいオフホワイト）
    vec3 bgColor = vec3(0.95, 0.93, 0.90);

    // エッジ部分の半透明グロー
    vec3 edgeColor = mix(bgColor, colorLight * 0.8, 0.4);

    vec3 color = bgColor;
    color = mix(color, edgeColor, edgeMask * 0.5);
    color = mix(color, liquidColor, liquidMask);

    gl_FragColor = vec4(color, 1.0);
  }
`
