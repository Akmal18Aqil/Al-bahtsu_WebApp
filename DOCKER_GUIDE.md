# Panduan Penggunaan Docker untuk Projek Khazanah Fikih

Dokumen ini menyediakan panduan lengkap untuk menggunakan Docker dalam pembangunan dan deployment aplikasi Khazanah Fikih. Docker membolehkan kita membungkus aplikasi dan semua keperluannya (termasuk pustaka, kod, dan *runtime*) ke dalam sebuah unit standard yang dipanggil *container*.

## Mengapa Guna Docker?

- **Persekitaran Konsisten**: Menjamin aplikasi berjalan dengan cara yang sama di mesin pembangunan, pengujian, dan produksi.
- **Isolasi**: Aplikasi berjalan dalam persekitaran terisolasi, mengelakkan konflik dengan perisian lain di mesin hos.
- **Mudah Alih**: *Container* boleh dijalankan di mana-mana sahaja Docker disokong tanpa perlu risau tentang konfigurasi persekitaran.
- **Skalabiliti**: Memudahkan proses skala aplikasi secara horizontal dengan hanya menambah bilangan *container*.
- **Pengurusan Ketergantungan**: Semua kebergantungan (seperti versi Node.js) ditetapkan dalam konfigurasi Docker, tidak perlu dipasang secara manual.

## Konsep Asas Docker

1.  **Imej (Image)**: Templat *read-only* yang mengandungi arahan untuk mencipta *container*. Ia seperti "snapshot" sistem fail aplikasi anda berserta semua yang diperlukan untuk menjalankannya.
2.  **Container**: Instans yang sedang berjalan dari sebuah imej. Ia adalah persekitaran yang ringan, berdikari, dan boleh dieksekusi yang merangkumi semua yang diperlukan untuk menjalankan aplikasi.
3.  **Dockerfile**: Fail teks yang mengandungi satu siri arahan (seperti `FROM`, `COPY`, `RUN`, `CMD`) untuk membina sebuah Imej Docker. Ia adalah "resipi" untuk imej anda.
4.  **Docker Compose**: Alat untuk mendefinisikan dan menjalankan aplikasi Docker berbilang *container*. Dengan satu fail YAML (`docker-compose.yml`), anda boleh mengkonfigurasi dan memulakan semua perkhidmatan aplikasi anda dengan satu arahan.

## Pemasangan Docker

Sebelum meneruskan, pastikan anda telah memasang [Docker Desktop](https://www.docker.com/products/docker-desktop/) di komputer anda. Ia menyediakan enjin Docker (untuk membina dan menjalankan *container*) dan alat baris arahan (`docker` dan `docker-compose`).

---

## Konfigurasi Docker untuk Projek Ini

### 1. `Dockerfile`

Fail ini bertanggungjawab untuk membina imej aplikasi Next.js anda. Ia menggunakan pendekatan *multi-stage build* untuk menghasilkan imej produksi yang ringan dan dioptimumkan.

```dockerfile
# 1. Base Image
FROM node:20-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# 4. Copy source code
COPY . .

# 5. Build the application
RUN npm run build

# 6. Production Image
FROM node:20-alpine AS production

WORKDIR /app

# Copy built assets from the 'base' stage
COPY --from=base /app/public ./public
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json

# Expose the port the app runs on
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]
```

**Penjelasan Peringkat (Stage):**

- **`base` stage**:
    1.  Bermula dari imej rasmi `node:20-alpine`, yang merupakan versi ringan.
    2.  Menetapkan direktori kerja di dalam imej kepada `/app`.
    3.  Menyalin `package.json` dan `package-lock.json`, kemudian menjalankan `npm install` untuk memasang semua kebergantungan. Ini diasingkan supaya Docker dapat menggunakan *cache* lapisan ini jika fail-fail ini tidak berubah.
    4.  Menyalin keseluruhan kod sumber projek.
    5.  Menjalankan `npm run build` untuk membina aplikasi Next.js untuk produksi.

- **`production` stage**:
    1.  Bermula semula dari imej `node:20-alpine` yang bersih.
    2.  Menyalin hanya artifak yang telah dibina (`.next`, `public`, `node_modules`, `package.json`) dari `base` stage. Ini memastikan tiada kod sumber atau kebergantungan pembangunan yang tidak perlu dimasukkan ke dalam imej akhir.
    3.  Mendedahkan port `3000` supaya ia boleh diakses dari luar *container*.
    4.  Menetapkan arahan `npm start` untuk dijalankan apabila *container* dimulakan.

### 2. `docker-compose.yml`

Fail ini membolehkan anda menguruskan perkhidmatan aplikasi anda dengan mudah.

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: khazanah_fikih_web
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    # Anda boleh menggunakan env_file untuk memuatkan dari fail .env
    # env_file:
    #   - .env.local
```

**Penjelasan:**

- `version: '3.8'`: Menentukan versi sintaks Docker Compose.
- `services`: Mendefinisikan semua perkhidmatan (container) yang membentuk aplikasi anda.
- `web`: Nama perkhidmatan kita.
    - `build`: Memberitahu Docker Compose untuk membina imej menggunakan `Dockerfile` di direktori semasa (`.`).
    - `container_name`: Nama yang diberikan kepada *container* apabila ia berjalan.
    - `ports`: Memetakan port `3000` pada mesin hos anda ke port `3000` di dalam *container*.
    - `environment`: Menetapkan pembolehubah persekitaran. `NODE_ENV=production` adalah penting untuk Next.js.
    - `env_file`: (Dikomen) Cara alternatif untuk memuatkan semua pembolehubah persekitaran dari fail `.env.local` anda. Ini lebih selamat daripada menulisnya terus di sini.

### 3. `.dockerignore`

Fail ini berfungsi seperti `.gitignore`, tetapi untuk Docker. Ia menyenaraikan fail dan folder yang tidak perlu disalin ke dalam imej Docker semasa proses `build`. Ini penting untuk:
- Mengelakkan kebocoran data sensitif (cth: `.env.local`).
- Mempercepatkan proses binaan dengan mengabaikan fail yang tidak relevan (cth: `node_modules`, `.next`, `.git`).

Pastikan `.dockerignore` anda mengandungi sekurang-kurangnya:

```
.git
.next
node_modules
.env.local
README.md
```

## Cara Membina dan Menjalankan Aplikasi

Dengan `Dockerfile` dan `docker-compose.yml` yang telah disediakan, anda boleh membina dan menjalankan aplikasi dengan beberapa arahan mudah.

1.  **Sediakan Fail `.env.local`**:
    Pastikan fail `.env.local` anda wujud di direktori utama projek dengan semua kunci API yang diperlukan.

2.  **Nyahkomen `env_file` (Disyorkan)**:
    Dalam `docker-compose.yml`, nyahkomen bahagian `env_file` untuk memuatkan pembolehubah persekitaran anda secara automatik.

    ```yaml
    # ...
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    ```

3.  **Bina dan Jalankan Container**:
    Buka terminal di direktori utama projek dan jalankan arahan berikut:

    ```bash
    docker-compose up --build
    ```

    - `up`: Memulakan *container*.
    - `--build`: Memaksa Docker untuk membina semula imej dari `Dockerfile`. Anda hanya perlu menggunakan `--build` pada kali pertama atau apabila anda membuat perubahan pada `Dockerfile` atau kod sumber.

4.  **Akses Aplikasi**:
    Setelah proses selesai, buka pelayar web anda dan layari `http://localhost:3000`. Aplikasi anda kini berjalan di dalam *container* Docker!

5.  **Untuk Menghentikan Aplikasi**:
    Tekan `Ctrl + C` di terminal. Untuk memadam *container*, jalankan:

    ```bash
    docker-compose down
    ```

## Aliran Kerja Pembangunan

Untuk pembangunan, anda mungkin mahu perubahan kod anda dimuat semula secara automatik (*hot-reloading*). Konfigurasi Docker untuk pembangunan sedikit berbeza, biasanya melibatkan *volume mounting* untuk menyegerakkan kod sumber anda dengan *container*. Ini adalah topik lanjutan yang boleh diterokai apabila anda sudah selesa dengan asasnya.

Panduan ini telah selesai. Anda kini mempunyai semua yang diperlukan untuk memulakan penggunaan Docker untuk projek anda.
