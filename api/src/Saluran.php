<?php
declare(strict_types=1);

namespace KG;

/**
 * Saluran pengiriman pemberitahuan.
 *
 * Dipisahkan dari isi pemberitahuannya karena isinya diputuskan aturan bisnis
 * (AB-30, AB-31) sedangkan salurannya diputuskan keadaan pemasangan. Menambah
 * saluran kelak tidak boleh menyentuh satu baris pun aturan.
 */
interface Saluran
{
    /**
     * @param array<int,array<string,mixed>> $penerima
     * @param array<string,mixed> $pemberitahuan
     * @return bool benar bila seluruh penerima terlayani
     */
    public function kirim(array $penerima, array $pemberitahuan): bool;
}
