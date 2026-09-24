<?php
declare(strict_types=1);

namespace KG;

/**
 * Penulis berkas Excel (.xlsx).
 *
 * Tanpa pustaka. Sebuah .xlsx adalah arsip zip berisi beberapa berkas XML, dan
 * yang dibutuhkan laporan tabular hanya empat di antaranya. Menambah
 * ketergantungan berukuran puluhan megabita yang versinya harus dijaga selama
 * masa dukungan, untuk menulis tabel persegi, bukan pertukaran yang baik.
 *
 * Yang sengaja tidak dikerjakan: rumus, gambar, beberapa lembar, dan gaya
 * selain baris kepala. Laporan QHSE dibaca dan disaring, bukan dihitung ulang
 * di dalam Excel — angkanya sudah dihitung peladen, dan itu justru intinya.
 */
final class Xlsx
{
    /**
     * @param array<int,string> $kepala
     * @param array<int,array<int,mixed>> $baris
     */
    public static function tulis(string $judulLembar, array $kepala, array $baris): string
    {
        $berkas = tempnam(sys_get_temp_dir(), 'kg') ?: throw new \RuntimeException('Gagal membuat berkas sementara.');
        $zip = new \ZipArchive();
        if ($zip->open($berkas, \ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Gagal membuka arsip xlsx.');
        }

        $zip->addFromString('[Content_Types].xml', self::tipe());
        $zip->addFromString('_rels/.rels', self::relsAkar());
        $zip->addFromString('xl/_rels/workbook.xml.rels', self::relsBuku());
        $zip->addFromString('xl/workbook.xml', self::buku($judulLembar));
        $zip->addFromString('xl/styles.xml', self::gaya());
        $zip->addFromString('xl/worksheets/sheet1.xml', self::lembar($kepala, $baris));
        $zip->close();

        $isi = (string) file_get_contents($berkas);
        @unlink($berkas);
        return $isi;
    }

    /**
     * @param array<int,string> $kepala
     * @param array<int,array<int,mixed>> $baris
     */
    private static function lembar(array $kepala, array $baris): string
    {
        $x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<sheetViews><sheetView workbookViewId="0">'
            // Baris kepala dibekukan: laporan QHSE berisi ratusan baris, dan
            // tabel yang kehilangan judul kolomnya saat digulir salah dibaca.
            . '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
            . '</sheetView></sheetViews>'
            . self::lebarKolom(count($kepala))
            . '<sheetData>';

        $x .= '<row r="1">';
        foreach (array_values($kepala) as $i => $teks) {
            $x .= '<c r="' . self::sel($i, 1) . '" t="inlineStr" s="1"><is><t>'
                . self::aman((string) $teks) . '</t></is></c>';
        }
        $x .= '</row>';

        $n = 1;
        foreach ($baris as $b) {
            $n++;
            $x .= '<row r="' . $n . '">';
            foreach (array_values($b) as $i => $nilai) {
                $x .= self::selIsi(self::sel($i, $n), $nilai);
            }
            $x .= '</row>';
        }

        return $x . '</sheetData><autoFilter ref="A1:' . self::sel(count($kepala) - 1, 1) . '"/></worksheet>';
    }

    private static function selIsi(string $ref, mixed $nilai): string
    {
        if ($nilai === null || $nilai === '') return '<c r="' . $ref . '"/>';

        // Angka ditulis sebagai angka, bukan teks. Kolom yang berisi teks
        // "0,42" tidak dapat dijumlahkan maupun diurutkan, dan itu hal pertama
        // yang dilakukan orang setelah membuka berkasnya.
        if (is_int($nilai) || is_float($nilai)
            || (is_string($nilai) && preg_match('/^-?\d+(\.\d+)?$/', $nilai) === 1)) {
            return '<c r="' . $ref . '"><v>' . (0 + (is_string($nilai) ? (float) $nilai : $nilai)) . '</v></c>';
        }
        if (is_bool($nilai)) {
            return '<c r="' . $ref . '" t="inlineStr"><is><t>' . ($nilai ? 'Ya' : 'Tidak') . '</t></is></c>';
        }
        return '<c r="' . $ref . '" t="inlineStr"><is><t>' . self::aman((string) $nilai) . '</t></is></c>';
    }

    private static function lebarKolom(int $jumlah): string
    {
        $x = '<cols>';
        for ($i = 1; $i <= $jumlah; $i++) $x .= '<col min="' . $i . '" max="' . $i . '" width="22" customWidth="1"/>';
        return $x . '</cols>';
    }

    private static function sel(int $kolom, int $baris): string
    {
        $huruf = '';
        for ($n = $kolom; $n >= 0; $n = intdiv($n, 26) - 1) {
            $huruf = chr(65 + $n % 26) . $huruf;
        }
        return $huruf . $baris;
    }

    /** Aksara kendali yang tidak sah di XML membuat Excel menolak seluruh berkas. */
    private static function aman(string $s): string
    {
        $bersih = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $s) ?? $s;
        return htmlspecialchars($bersih, ENT_XML1 | ENT_QUOTES, 'UTF-8');
    }

    private static function tipe(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            . '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            . '<Default Extension="xml" ContentType="application/xml"/>'
            . '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            . '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            . '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            . '</Types>';
    }

    private static function relsAkar(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
            . '</Relationships>';
    }

    private static function relsBuku(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            . '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
            . '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
            . '</Relationships>';
    }

    private static function buku(string $judul): string
    {
        // Nama lembar Excel: maksimal 31 aksara, tanpa : \ / ? * [ ]
        $nama = mb_substr(preg_replace('#[:\\\\/?*\[\]]#', ' ', $judul) ?? 'Data', 0, 31);
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
            . ' xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            . '<sheets><sheet name="' . self::aman($nama) . '" sheetId="1" r:id="rId1"/></sheets>'
            . '</workbook>';
    }

    private static function gaya(): string
    {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            . '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font>'
            . '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts>'
            . '<fills count="3"><fill><patternFill patternType="none"/></fill>'
            . '<fill><patternFill patternType="gray125"/></fill>'
            . '<fill><patternFill patternType="solid"><fgColor rgb="FF17458F"/><bgColor indexed="64"/></patternFill></fill></fills>'
            . '<borders count="1"><border/></borders>'
            . '<cellStyleXfs count="1"><xf/></cellStyleXfs>'
            . '<cellXfs count="2"><xf xfId="0"/>'
            . '<xf xfId="0" fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs>'
            . '</styleSheet>';
    }
}
