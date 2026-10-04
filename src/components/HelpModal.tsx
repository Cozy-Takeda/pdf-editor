"use client";

import React from "react";

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800">操作方法</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 text-sm text-gray-700 flex flex-col gap-5">

          <p className="text-gray-500">
            ブラウザだけで使えるPDF編集ツールです。
            アップロードしたファイルはインターネットに送信されないので、安心してご利用いただけます。
          </p>
          <p className="text-gray-600">
            パソコンでは左側の操作パネルを使いながら、右側のページ一覧だけをスクロールできます。
            拡大縮小・選択したページの削除や回転・ダウンロードは左側にまとまっています。
            スマートフォンでは上部の「操作」ボタンでパネルを開きます。
          </p>

          {/* 基本的な流れ */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">基本的な流れ</h3>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-gray-600">
              <li>PDFを読み込む</li>
              <li>ページを並び替え・回転・削除する</li>
              <li>ダウンロードする</li>
            </ol>
          </section>

          <hr className="border-gray-100" />

          {/* 1 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">1. PDFを読み込む</h3>
            <p className="text-gray-600 mb-2">
              画面上部の点線で囲まれたエリアに、PDFファイルをドラッグ&amp;ドロップします。クリックしてファイルを選択することもできます。
            </p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-gray-600">
              <li>複数のPDFを一度に読み込むことができます</li>
              <li>読み込み後、別のPDFをさらに追加することもできます</li>
              <li>読み込みが完了すると、各ページのサムネイル（縮小画像）が一覧表示されます</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* 2 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">2. ページを選択する</h3>
            <p className="text-gray-600 mb-2">
              サムネイルをクリックすると選択されます（青い枠が付きます）。もう一度クリックすると解除されます。
            </p>
            <p className="font-medium text-gray-700 mb-1">複数ページを選択したいとき</p>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-3">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">操作</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">動作</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2">Ctrl を押しながらクリック</td>
                  <td className="px-3 py-2 text-gray-500">選択を1枚ずつ追加・解除</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2">Shift を押しながらクリック</td>
                  <td className="px-3 py-2 text-gray-500">最初に選んだページから現在のページまでをまとめて選択</td>
                </tr>
              </tbody>
            </table>
            <p className="font-medium text-gray-700 mb-1">選択を解除したいとき</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-gray-600">
              <li>左側の操作パネルにある「選択を解除」ボタンを押す</li>
              <li>または、選択中のサムネイルを右クリックして「選択を解除」を選ぶ</li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* 3 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">3. ページを並び替える</h3>
            <p className="text-gray-600 mb-2">
              サムネイルをドラッグ（押したまま移動）して、好きな位置に移動できます。
            </p>
            <p className="font-medium text-gray-700 mb-1">複数ページをまとめて移動したいとき</p>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-gray-600">
              <li>移動したいページを複数選択する</li>
              <li>選択したページのどれかをドラッグする</li>
              <li>選択したページがまとめて移動します</li>
            </ol>
          </section>

          <hr className="border-gray-100" />

          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">ページを回転する</h3>
            <p className="text-gray-600 mb-2">
              各ページの「左へ90°」「右へ90°」ボタンで、そのページだけを回転できます。
              複数ページを選択すると、操作パネルの同じボタンで選択中のページをまとめて回転できます。
            </p>
            <p className="text-gray-600">
              回転した向きはサムネイルとダウンロードするPDFに反映されます。
              逆方向に回転すると元に戻せます。ページ番号は回転後の向きに合わせて下側に追加されます。
            </p>
            <p className="text-gray-600 mt-2">
              回転しても紙面の表示倍率は変わりません。
              操作パネルの「サムネイルの大きさ」はスライダーや＋・−で60〜300%に調整できます。
              細かい文字は拡大して確認し、「標準に戻す」で100%に戻せます。
              画面より大きいページは一覧を横にスクロールして確認してください。
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* 4 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">4. ページを削除する</h3>
            <p className="font-medium text-gray-700 mb-1">選択したページを削除する</p>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-gray-600 mb-3">
              <li>削除したいページを選択する（複数可）</li>
              <li>操作パネル「選択中のページ」の「選択したページを削除」ボタンを押す</li>
              <li>確認画面で削除するページ数を確認し、「OK」を押す。取りやめる場合は「キャンセル」を押す</li>
            </ol>
            <p className="font-medium text-gray-700 mb-1">奇数・偶数ページをまとめて削除する</p>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">ボタン</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">削除されるページ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2">奇数ページを削除</td>
                  <td className="px-3 py-2 text-gray-500">1・3・5…番目のページ</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="px-3 py-2">偶数ページを削除</td>
                  <td className="px-3 py-2 text-gray-500">2・4・6…番目のページ</td>
                </tr>
              </tbody>
            </table>
            <p className="text-gray-600 mb-2">
              奇数・偶数ページの削除でも、現在の並び順での対象ページ数を確認してから実行します。
              キャンセルするとページと選択状態は変わりません。削除後に元に戻す機能はありません。
              元のPDFファイルは変更されません。
            </p>
            <p className="text-xs text-gray-400">活用例：両面スキャンで取り込んだPDFから、裏面（偶数ページ）だけを一括削除できます。</p>
          </section>

          <hr className="border-gray-100" />

          {/* 5 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">5. 複数のPDFを1つにまとめる</h3>
            <p className="text-gray-600">
              複数のPDFを読み込むと、すべてのページがサムネイル一覧に連結して表示されます。
              並び替えや削除を行ったあと、そのままダウンロードすると1つのPDFとして保存されます。
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* 6 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">6. ページ番号を追加する</h3>
            <ol className="list-decimal list-inside flex flex-col gap-1 text-gray-600 mb-3">
              <li>操作パネルの「その他の操作」を開き、「ページ番号を追加」ボタンを押す</li>
              <li>設定画面で各項目を指定する</li>
              <li>「適用してダウンロード」を押すとページ番号入りのPDFが保存されます</li>
            </ol>
            <table className="w-full text-xs border border-gray-200 rounded-lg overflow-hidden mb-2">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">設定項目</th>
                  <th className="text-left px-3 py-2 text-gray-600 font-medium">説明</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["開始ページ", "ページ番号を付け始めるページ"],
                  ["終了ページ", "ページ番号を付け終わるページ"],
                  ["開始番号", "最初のページに表示する数字"],
                  ["表示位置", "中央下 / 右下 / 左下"],
                  ["フォントサイズ", "8〜16pt"],
                ].map(([item, desc]) => (
                  <tr key={item} className="border-t border-gray-100">
                    <td className="px-3 py-2">{item}</td>
                    <td className="px-3 py-2 text-gray-500">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400">活用例：表紙を除いた2ページ目から番号を付けたいときは、開始ページを「2」に設定します。</p>
          </section>

          <hr className="border-gray-100" />

          {/* 7 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">7. ダウンロードする</h3>
            <p className="text-gray-600">
              操作パネル下部の「PDFをダウンロード」ボタンを押すと、現在の並び順でPDFが保存されます。
              ファイル名は自動で <code className="bg-gray-100 px-1 rounded text-xs">edited_日付_時刻.pdf</code> となります。
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* 8 */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-2">8. 最初からやり直す</h3>
            <p className="text-gray-600">
              操作パネルの「その他の操作」にある「すべてクリア」ボタンを押すと、ファイル数とページ数の確認画面が表示されます。
              「OK」を押すとすべてリセットされ、「キャンセル」で取りやめられます。
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* FAQ */}
          <section>
            <h3 className="font-bold text-gray-800 text-base mb-3">よくある質問</h3>
            <div className="flex flex-col gap-3">
              {[
                {
                  q: "ファイルはインターネットに送られますか？",
                  a: "送られません。すべての処理はお使いのブラウザの中だけで行われます。",
                },
                {
                  q: "元のPDFファイルは変更されますか？",
                  a: "変更されません。編集結果は「ダウンロード」したときに新しいファイルとして保存されます。",
                },
                {
                  q: "何ページまで編集できますか？",
                  a: "ページ数の上限はありませんが、ページ数が多いほどサムネイルの生成に時間がかかります。",
                },
                {
                  q: "スマートフォンでも使えますか？",
                  a: "基本的な操作は可能ですが、ドラッグ&ドロップによるページ並び替えはパソコンでの使用を推奨します。",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <p className="font-medium text-gray-700 mb-0.5">Q. {q}</p>
                  <p className="text-gray-500 text-xs">{a}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
}
