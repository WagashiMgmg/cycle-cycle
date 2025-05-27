# Bike Repair Dashboard RDB設計仕様

## 概要
自転車修理店向け「修理ダッシュボード」アプリがRDB（リレーショナルデータベース）と連携するためのテーブル設計・仕様案です。店舗ごとに異なるテーブル名・スキーマに対応できるよう、柔軟な設計を想定します。

---

## 1. 基本テーブル仕様（例: `bike_repair_tasks`）

| カラム名         | 型              | NULL許可 | 説明                       |
|------------------|-----------------|----------|----------------------------|
| id               | VARCHAR(64)     | NOT NULL | 主キー、UUID推奨           |
| name             | VARCHAR(64)     | NOT NULL | 顧客名                     |
| phone            | VARCHAR(16)     | NOT NULL | 電話番号（ハイフンなし）   |
| email            | VARCHAR(128)    | YES      | メールアドレス             |
| photo_url        | TEXT            | YES      | バイク画像URL              |
| status           | VARCHAR(16)     | NOT NULL | 進捗状態                   |
| deadline         | DATE            | YES      | 締切日                     |
| estimated_hours  | INT             | NOT NULL | 想定作業時間（h）          |
| start            | DATE            | NOT NULL | 着手日                     |
| end              | DATE            | NOT NULL | 終了日                     |
| menu             | VARCHAR(128)    | YES      | 作業内容                   |
| memo             | TEXT            | YES      | メモ                       |
| created_at       | DATETIME        | NOT NULL | レコード作成日時           |
| updated_at       | DATETIME        | NOT NULL | レコード更新日時           |

---

## 2. 店舗ごとのテーブル対応
- 店舗ごとにテーブル名やカラム構成が異なる場合、アプリ側で「テーブル名・カラム名のマッピング設定」を持つことを推奨。
- 例: `storeA_bike_tasks`, `storeB_repairs` など。
- 必須カラム（id, name, phone, status, start, end, estimated_hours）は全店舗で共通とする。
- オプションカラム（email, photo_url, menu, memo, deadline, created_at, updated_at）は店舗ごとに有無を許容。

---

## 3. 参考SQL（MySQL例）
```sql
CREATE TABLE bike_repair_tasks (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  phone VARCHAR(16) NOT NULL,
  email VARCHAR(128),
  photo_url TEXT,
  status VARCHAR(16) NOT NULL,
  deadline DATE,
  estimated_hours INT NOT NULL,
  start DATE NOT NULL,
  end DATE NOT NULL,
  menu VARCHAR(128),
  memo TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 4. 注意事項
- 店舗ごとにテーブル名・カラム名が異なる場合は、アプリの設定ファイルや管理画面でマッピング可能にする。
- 画像（photo_url）はS3等のストレージURLを格納し、RDBにはパスのみ保存。
- 進捗状態（status）はアプリ側のリストと同期。
- 日付はISO8601形式（YYYY-MM-DD）で統一。

---

## 5. 今後の拡張例
- 顧客情報・バイク情報を別テーブルで正規化
- 作業履歴・担当者・請求情報などの追加
- 店舗ごとのカスタムフィールド対応

---

以上をもとに、API設計やDB連携実装を進めてください。
