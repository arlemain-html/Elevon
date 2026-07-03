# DecentraForum: Web3 Social Forum dApp (Base Network)

DecentraForum adalah frontend dApp forum sosial terdesentralisasi berkinerja tinggi yang dibangun menggunakan **React 18+**, **Vite**, **TypeScript**, dan **Tailwind CSS**. Frontend ini terintegrasi penuh secara langsung dengan smart contract asli yang telah di-deploy di jaringan **Base Mainnet**.

Aplikasi ini dirancang dengan kepatuhan penuh terhadap **Zero Placeholder Policy** dan **Zero Sandbox Policy**, menyajikan data asli on-chain, interaksi dompet Web3 sungguhan, dan sinkronisasi data backend berkinerja tinggi.

---

## 🚀 Fitur Utama

1. **On-Chain Identity Registry**
   - Registrasi nama profil permanen berbasis representasi bytes32 langsung di kontrak pintar `ForumIdentityRegistry`.
   - Mengubah nama profil dengan mendaftarkan profileHash baru ke blockchain.

2. **Durable On-Chain Reputation & Leveling**
   - Formula reputasi on-chain asli yang disinkronkan langsung dari kontrak `ForumReputation`.
   - Perhitungan Level otomatis berdasarkan total XP: $Level = \lfloor\sqrt{XP / 100}\rfloor$.
   - Simulator kalkulasi Level interaktif untuk memproyeksikan reputasi Anda berdasarkan kontribusi postingan, upvote, dan komentar.

3. **Soulbound Verification Badges & Achievements**
   - Integrasi penuh dengan token Soulbound NFT `SoulboundReputationTokens`.
   - Dasbor lencana verifikasi, pendaftaran bukti kontribusi, dan panel khusus verifikator untuk mengunci prestasi secara langsung di blockchain Base.

4. **Off-Chain Content Engine (Supabase + LocalStorage Fallover)**
   - Manajemen konten off-chain berkecepatan tinggi (Post, Comment, Bookmark, Kategori, Notifikasi) yang disinkronkan secara real-time.
   - Fallover otomatis ke LocalStorage aman jika kredensial backend Supabase tidak terdeteksi, menjamin aplikasi tetap 100% fungsional tanpa hambatan bagi pengembang baru.

5. **Antarmuka Pengguna Modern & Sangat Responsif**
   - Desain minimalis, elegan, berkonsep bento-grid, dan bertema gelap (*Deep Slate Dark Theme*) dengan kontras tinggi yang ramah mata.
   - Navigasi mulus, transisi animasi halus dengan `motion/react`, dan targets sentuhan ramah seluler (>44px).

---

## 🛠️ Informasi Kontrak Pintar (Base Mainnet)

Semua interaksi Web3 dilakukan pada alamat kontrak asli di bawah ini di jaringan **Base (Chain ID: 8453)**:

*   **ForumIdentityRegistry**: `0x1eF070954192D53df4b4cc9c2941aeC315B3e6F7`
*   **ForumReputation**: `0x5b41CD272C6cd5D2EcdE02771d0aD62962378b1A`
*   **SoulboundReputationTokens**: `0xd546377fF2fCD9D81aF9A27F11136bdf9168FAe2`

---

## 📦 Memulai Penggunaan

Ikuti langkah-langkah mudah berikut untuk menjalankan dApp ini di komputer lokal Anda:

### 1. Instalasi Dependensi
Pastikan Anda memiliki [Node.js](https://nodejs.org/) terinstal, kemudian jalankan perintah berikut:
```bash
npm install
```

### 2. Jalankan Server Pengembangan
Gunakan perintah berikut untuk menyalakan server pengembangan lokal:
```bash
npm run dev
```
Aplikasi akan langsung berjalan di browser pada alamat: `http://localhost:3000`.

### 3. Build untuk Produksi
Guna melakukan kompilasi proyek menjadi kode produksi HTML/JS statis yang optimal:
```bash
npm run build
```

---

## 📁 Struktur Kode Utama

*   `/src/providers/Web3Provider.tsx` - Pengelola konteks interaksi blockchain, koneksi dompet `ethers.js`, deteksi jaringan Base, pemantauan transaksi on-chain, serta sinkronisasi stats profil pengguna.
*   `/src/services/supabase.ts` - Pengendali konten forum (postingan, bookmark, komentar, upvote) dengan database relasional Supabase dan mekanisme failover LocalStorage otomatis.
*   `/src/blockchain/config.ts` & `abis.ts` - Sumber kebenaran (source of truth) alamat kontrak, parameter jaringan RPC Base, serta ABI kontrak pintar resmi.
*   `/src/views/` - Halaman-halaman modular dApp (FeedView, ProfileView, ReputationView, BadgeView, AchievementView, CommunityView, SettingsView).
*   `/src/components/` - Komponen UI reusable berdaya guna tinggi (Header, Navigation, PostCard, CreatePostModal).
