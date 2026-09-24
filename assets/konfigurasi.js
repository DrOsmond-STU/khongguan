/* Konfigurasi penyebaran.
 *
 * Satu-satunya berkas yang disunting saat memasang sistem di peladen, dan
 * satu-satunya yang berbeda antara lingkungan pengembangan, uji, dan
 * produksi. Kode aplikasi tidak pernah perlu diubah untuk berpindah
 * lingkungan.
 *
 *   api    Alamat peladen API. Kosong berarti mode peragaan dengan data
 *          contoh — persis seperti purwarupa.
 *   versi  Penanda ?v= untuk berkas pendukung. Dinaikkan setiap rilis supaya
 *          pembaruan sampai ke perangkat pada bukaan pertama.
 *
 * Nilai yang sudah ditetapkan sebelumnya tidak ditimpa, sehingga lingkungan
 * uji dapat menyuntikkan konfigurasinya sendiri tanpa menyunting berkas ini.
 */
window.KG_KONFIG = Object.assign({
  api: '',
  versi: '3'
}, window.KG_KONFIG || {});
