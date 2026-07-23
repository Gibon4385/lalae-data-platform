# LaLaE マーケティングデータ自動化プラットフォーム (LaLaE Data Platform)

[English](./README.md) | [繁體中文](./README_ZH.md) | [日本語](./README_JA.md)

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-orange?style=for-the-badge&logo=vercel)](https://v0-data-platform-test.vercel.app/)
[![GCP Architecture](https://img.shields.io/badge/GCP-Serverless-blue?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/)

> **マーケティング＆データチーム向け オールインワン自動化 ETL データパイプラインプラットフォーム**  
> 複数チャネルの広告 API を自動連携し、取得項目を柔軟にカスタマイズ。BigQuery SQL でデータをクレンジング・変換し、Google スプレッドシートへ自動定期出力することで、データ運用の完全自動化を実現します。

---

## 🌟 主要機能とビジネス価値 (Key Features & Business Value)

* 🔗 **クロスチャネル API 自動連携**: **Google Ads**、**Facebook Ads**、**Google スプレッドシート**のデータソース認証と自動同期に対応。
* 🎯 **柔軟な指標・項目選択**: 分析レベル (Insights Level) や必要なフィールド (Fields)、指標 (Metrics)、内訳 (Breakdowns) を自由に選択してデータ取得。
* ⚡ **SQL によるデータクレンジング・加工**: 内蔵のオンライン SQL エディタで、BigQuery データウェアハウス上の巨額データを直接抽出・クレンジング・結合。
* 🔄 **Google スプレッドシートへの自動定期出力**: Cron スケジュール設定により、SQL で加工された最新データを指定の Google スプレッドシートへ自動で追記・上書き出力。

---

## ☁️ クラウド構成と技術スタック (Cloud Infrastructure & Tech Stack)

本プロジェクトは、運用・保守コストを最小限に抑えるモダンな **100% サーバーレス (Serverless)** および **Infrastructure as Code (IaC)** 構成を採用しています。

```
[ 広告 API / シート ] ──> [ GCP Cloud Run (Web API) ] ──> [ BigQuery (DWH & SQL加工) ] ──> [ Google スプレッドシート ]
                                     ▲              │
                            (Cron)   │              ▼  (非同期キュー)
                            [ GCP Cloud Scheduler ]   [ GCP Cloud Tasks ]
```

* **クラウドネイティブサービス (GCP)**:
  * **GCP Cloud Run**: 自動スケーリング対応のサーバーレスコンテナサービス (Django Backend API)。
  * **GCP Cloud Tasks & Cloud Scheduler**: 従来の Celery/Redis 構成を置き換え、クラウドネイティブなスケジュール実行と非同期キュー処理を実現。
  * **Google BigQuery**: 超高速データウェアハウス (DWH) および SQL 演算エンジン。
* **Infrastructure as Code (IaC)**:
  * **Terraform**: GCP タスクキュー、スケジュールジョブ、IAM 権限の自動構築・管理。
* **フルスタック技術**:
  * **フロントエンド**: Next.js 14, React 18, TypeScript, Tailwind CSS, Ace SQL Editor (Vercel にてホスティング)
  * **バックエンド**: Python 3.11, Django 5, Django REST Framework, JWT Authentication

---

## 🚀 30秒で試せるローカル Demo ガイド (Quick Local Demo Guide)

バックエンドやデータベースの構築不要で UI/UX と ETL パイプライン設定を体験できる **Mock モード (Zero Backend Dependency)** を標準搭載しています！

### クイックスタート手順

```bash
# 1. リポジトリのクローン
git clone https://github.com/Gibon4385/lalae-data-platform.git
cd lalae-data-platform/frontend

# 2. Mock 環境変数のセットアップ
cp .env.example .env

# 3. 依存パッケージのインストールと起動
npm install
npm run dev
```

### 🎯 デモの体験方法
1. ブラウザで `http://localhost:3000` にアクセスします。
2. ログイン画面で **任意のメールアドレスとパスワードを入力** するとログインできます。
3. プラットフォーム上で以下の機能を体験できます：
   * **クライアント・データ連携ウィザード**: Google Ads / Facebook Ads 連携および取得項目の設定。
   * **SQL クエリ領域**: オンライン SQL エディタと実行履歴の確認。

> ⚠️ **Demo モードの概要と制限事項 (Demo Mode Limitations)**  
> デフォルトのローカル Demo モード (`NEXT_PUBLIC_USE_MOCK=true`) は、UI インタラクションおよび設定フローを迅速に確認するためのものです。バックエンドや GCP/API キーを直接参照していないため、**実際の外部 API (Google Ads API, Meta API, BigQuery) へのリクエストやデータの書き込みは行われません**。本番環境でのデータ連携テストについては下記をご確認ください。

---

## 🛠️ 本番クラウド構築の概要 (Production Deployment Overview)

実際のクラウド環境（Google Ads / Facebook API / Supabase / BigQuery 連携）へデプロイする場合は以下の手順となります：

### 1. 🗄️ データベース設定 (Supabase / PostgreSQL)
* 既存のバックアップファイルは不要です。[Supabase](https://supabase.com) で新規 PostgreSQL インスタンスを作成し、接続情報を `backend/.env` に記述します。
* Django マイグレーションを実行することで、すべてのテーブル構造が自動生成されます：
  ```bash
  python manage.py migrate
  python manage.py createsuperuser
  ```

### 2. ☁️ GCP インフラ構築 (Terraform)
* GCP プロジェクトを作成し、Cloud Run, Cloud Tasks, Cloud Scheduler, BigQuery API を有効化します。
* `terraform/` ディレクトリで `terraform.tfvars` を設定後、以下を実行します：
  ```bash
  terraform init
  terraform apply
  ```

### 3. 🚀 バックエンドおよびフロントエンドのデプロイ
* **バックエンド**: GCP Cloud Build で Docker イメージをビルドし Cloud Run へデプロイ。
* **フロントエンド**: フロントエンドの `.env` で `NEXT_PUBLIC_USE_MOCK=false` に変更し `NEXT_PUBLIC_API_URL` を Cloud Run の URL に指定後、Vercel へデプロイ。
