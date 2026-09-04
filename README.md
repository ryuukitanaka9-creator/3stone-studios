# 3 Stone Studios

VRChat向け3Dモデルの制作・販売をメイン事業とし、3Dモデリング受注・オリジナル映画脚本制作も手がける、学生発のクリエイティブスタジオです。

**公開サイト**: https://3stonestudios.com

## 構成

- `docs/` — 公開サイト本体（GitHub Pages公開元）。index.html、画像、favicon等
- `firebase/` — Firebase関連設定（Firestoreルール等）
- `business/` — 非公開の内部資料（Git管理外）

## サイトの技術構成

- 静的HTML1ファイル構成（`docs/index.html`）
- データ管理: Firebase Firestore（ニュース・脚本作品・ヒーロー画像・サイト内容をパスワード保護の管理画面から編集）
- ホスティング: GitHub Pages（mainブランチ / `/docs`）
