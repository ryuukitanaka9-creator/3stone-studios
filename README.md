# 3 Stone Studios

VRChat向け3Dモデルの制作・販売をBOOTHにて展開するクリエイティブスタジオ。3Dモデリング受注やオリジナル映画脚本制作も手がけています。

**公開サイト**: https://3stonestudios.com

## 構成

- `docs/` — 公開サイト本体（GitHub Pages公開元）
  - `index.html` — マークアップ本体
  - `assets/css/style.css` — スタイル
  - `assets/js/main.js` — スクリプト（Firebase連携・管理画面ロジック等）
  - 画像、favicon等
- `firebase/` — Firebase関連設定（Firestoreルール等）
- `business/` — 非公開の内部資料（Git管理外）

## サイトの技術構成

- 静的サイト（`docs/index.html` + `assets/css/style.css` + `assets/js/main.js`）
- データ管理: Firebase Firestore（ニュース・脚本作品・ヒーロー画像・サイト内容をパスワード保護の管理画面から編集）
  - 注意: Firestore(`config/content`)の値はコード内の初期値(`CONTENT_DEFAULTS`)より常に優先される。表示テキストを変更する場合はFirestore側の更新も必要
- ホスティング: GitHub Pages（mainブランチ / `/docs`）
