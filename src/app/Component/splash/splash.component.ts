import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../Services/guest.service';
import { TransliterationService } from '../../Services/transliteration.service';

/**
 * Elemen flora yang ditabur ke layar (garland tepi gelombang,
 * ladang bunga, taburan backdrop, kelopak love, tekstur wash).
 */
interface Flora {
  /** Nama file di assets/splash/. */
  src: string;
  /** Posisi kiri, % dari container-nya. */
  left: number;
  /** Posisi atas, % dari container-nya. */
  top: number;
  /** Lebar render. px untuk semua, KECUALI kelopak love (%). */
  width: number;
  opacity: number;
  /** Rotasi statis, deg. */
  rotate: number;
  /** Delay animasi wobble/breathe, detik (negatif = desinkron). */
  delay: number;
  z: number;
  /** true = ikut animasi wobble; false = statis (hemat ponsel). */
  live: boolean;
}

/** Kelopak lepas yang melayang jatuh di scene "Selamat Datang". */
interface DriftPetal {
  src: string;
  left: number;     // %
  width: number;    // px
  opacity: number;
  fallDur: number;  // s
  delay: number;    // s, negatif supaya sudah "di tengah jalan"
  swayDur: number;  // s
  swayAmp: number;  // px
  rotate: number;   // deg awal
}

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
})
export class SplashComponent {

  /**
   * Fires once the flower-wave choreography has finished. The host page
   * uses this to unmount the overlay and restore body scrolling.
   */
  @Output() opened:EventEmitter<void> = new EventEmitter<void>();

  /**
   * Fires synchronously the instant the user taps "Buka Undangan" — while
   * still inside the click gesture. The host starts the background music
   * here so it satisfies the browser autoplay policy (a play() call buried
   * inside the later setTimeout would be blocked).
   */
  @Output() started:EventEmitter<void> = new EventEmitter<void>();

  /**
   * Splash v3 "Gelombang Bunga". Koreografi mirror prototype yang sudah
   * disetujui (splash-flower-preview.html di root repo), timeline
   * berbasis ketukan lagu (~62 BPM, 1 beat = 968ms):
   *   0.00s   sapaan memudar
   *   0.15s   lembar gelombang bunga menyapu masuk dari KIRI-BAWAH (2 beat)
   *   ~2.2s   scene "Selamat Datang": love kelopak + foto + QS Ar-Rum 21
   *   ~8.1s   scene memudar (0.75 beat)
   *   ~8.85s  gelombang mundur -> layar terbuka dari KANAN-ATAS (2 beat)
   *   10.85s  .is-leaving (fade sisa overlay), 11.35s unmount
   * SEMUA delay animasi CSS absolut dari .is-opening (freeze-able).
   */
  opening:boolean = false;

  /** True near the end: fades the whole splash out before it unmounts. */
  leaving:boolean = false;

  /** When the visitor prefers reduced motion we skip the choreography. */
  reducedMotion:boolean = false;

  /** Garland bunga 3 baris di tepi depan lembar gelombang. */
  garland:Flora[] = [];

  /** Ladang bunga yang memenuhi lembar (sebagian kecil ikut wobble). */
  field:Flora[] = [];

  /** Tekstur bunga samar di dalam wash lembar. */
  texture:Flora[] = [];

  /** Taburan bunga samar di backdrop idle (menghindari zona sapaan). */
  sprinkles:Flora[] = [];

  /** Kelopak pembentuk love (2 lapis wreath), width dalam %. */
  heartPetals:Flora[] = [];

  /** Kelopak lepas yang melayang di scene. */
  driftPetals:DriftPetal[] = [];

  /** PRNG ber-seed: komposisi acak stabil antar muat (mudah di-QA). */
  private seed:number = 20260715;

  constructor(
    public guestService:GuestService,
    public ts:TransliterationService,
  ) {
    // Respect prefers-reduced-motion, but allow forcing the animation with
    // "?motion" in the URL — see memory: reduced-motion-gotcha. Guests with
    // reduced motion still get the skip.
    const prefersReduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const forceMotion =
      typeof location !== 'undefined' && /[?&]motion\b/.test(location.search);

    this.reducedMotion = prefersReduce && !forceMotion;

    // "?splash-auto" opens the flowers without a click — used for headless
    // screenshot verification. Music will be blocked (no gesture) but the
    // host swallows that rejection.
    if (typeof location !== 'undefined' && /[?&]splash-auto\b/.test(location.search)) {
      setTimeout(() => this.open(), 500);
    }

    // Urutan build harus tetap (PRNG ber-seed -> layout deterministik,
    // sama dengan prototype yang di-approve).
    this.buildGarland();
    this.buildTexture();
    this.buildField();
    this.buildSprinkles();
    this.buildHeartPetals();
    this.buildDriftPetals();
  }

  trans(key:string, ...p:string[]):string {
    return this.ts.trans(key, ...p);
  }

  /** Open the flower wave. Timings mirror the prototype's CSS. */
  open():void {
    if (this.opening) return;

    // Synchronous, still inside the click gesture -> music autoplay allowed.
    this.started.emit();

    if (this.reducedMotion) {
      this.opening = true;
      this.leaving = true;
      setTimeout(() => this.opened.emit(), 120);
      return;
    }

    this.opening = true;
    // Gelombang keluar selesai ~10.8s; fade sisa overlay, lalu unmount.
    setTimeout(() => (this.leaving = true), 10850);
    setTimeout(() => this.opened.emit(), 11350);
  }

  /**
   * Foto berdua di dalam love dimuat dari
   * public/assets/splash/splash-photo-couple.jpg. Sampai file-nya ada,
   * sembunyikan <image> yang gagal supaya placeholder siluet terlihat.
   */
  hidePhoto(event:Event):void {
    (event.target as HTMLElement).style.display = 'none';
  }

  /** mulberry32 — cukup acak untuk komposisi, deterministik ber-seed. */
  private rnd():number {
    this.seed |= 0;
    this.seed = (this.seed + 0x6D2B79F5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  private clamp01(v:number):number {
    return Math.max(0, Math.min(1, v));
  }

  /**
   * Tepi depan lembar = garis (62%,0) -> (100%,38%) pada wave-fill
   * (lihat clip-path di SCSS). Bunga ditaruh di garis itu, digeser ke
   * sisi dalam sebesar `inset`, supaya potongan lurusnya tertutup.
   */
  private pushEdge(src:string, u:number, inset:number, width:number, opacity:number, z:number):void {
    this.garland.push({
      src,
      left: 62 + 38 * u - inset,
      top: 38 * u + inset,
      width,
      opacity,
      rotate: Math.round(this.rnd() * 360),
      delay: -this.rnd() * 3.9,
      z,
      live: true,
    });
  }

  /** Garland 3 baris: depan menempel tepi, tengah, belakang samar. */
  private buildGarland():void {
    const front = ['bloom-a.svg','bloom-b.svg','blossom.svg','bloom-b.svg',
                   'bloom-a.svg','bloom-bud.svg','blossom.svg','leaf-sprig.svg'];
    let n = 24;
    for (let i = 0; i < n; i++) {
      const u = this.clamp01(i / (n - 1) + (this.rnd() - 0.5) * 0.04);
      const src = front[i % front.length];
      const w = src === 'leaf-sprig.svg' ? 96 + this.rnd() * 40
              : src === 'blossom.svg'    ? 44 + this.rnd() * 26
              : src === 'bloom-bud.svg'  ? 50 + this.rnd() * 22
              : 82 + this.rnd() * 56;
      this.pushEdge(src, u, 0.3 + this.rnd() * 1.5, w, 1, 4);
    }

    const mid = ['leaf-sprig.svg','blossom.svg','bloom-b.svg','petal.svg','bloom-a.svg','bloom-bud.svg'];
    n = 20;
    for (let i = 0; i < n; i++) {
      const u = this.clamp01(i / (n - 1) + (this.rnd() - 0.5) * 0.06);
      const src = mid[i % mid.length];
      const w = src === 'leaf-sprig.svg' ? 80 + this.rnd() * 40
              : src === 'petal.svg'      ? 26 + this.rnd() * 22
              : src === 'blossom.svg'    ? 36 + this.rnd() * 22
              : 56 + this.rnd() * 40;
      this.pushEdge(src, u, 2.6 + this.rnd() * 3.6, w, 0.92 + this.rnd() * 0.08, 3);
    }

    const back = ['petal.svg','blossom.svg','bloom-bud.svg','petal.svg'];
    n = 22;
    for (let i = 0; i < n; i++) {
      const u = this.clamp01(i / (n - 1) + (this.rnd() - 0.5) * 0.08);
      const src = back[i % back.length];
      const w = src === 'petal.svg' ? 20 + this.rnd() * 22 : 28 + this.rnd() * 26;
      this.pushEdge(src, u, 6.5 + this.rnd() * 7, w, 0.5 + this.rnd() * 0.35, 2);
    }
  }

  /** Bloom besar sangat samar + kelopak kecil: kesan watercolor berlapis. */
  private buildTexture():void {
    for (let i = 0; i < 5; i++) {
      this.texture.push({
        src: i % 2 === 0 ? 'bloom-a.svg' : 'bloom-b.svg',
        left: 2 + this.rnd() * 52,
        top: 30 + this.rnd() * 58,
        width: 150 + this.rnd() * 110,
        opacity: 0.13 + this.rnd() * 0.13,
        rotate: Math.round(this.rnd() * 360),
        delay: 0, z: 0, live: false,
      });
    }
    for (let i = 0; i < 13; i++) {
      this.texture.push({
        src: i % 3 === 1 ? 'blossom.svg' : 'petal.svg',
        left: 4 + this.rnd() * 54,
        top: 32 + this.rnd() * 58,
        width: i % 3 === 1 ? 34 + this.rnd() * 44 : 26 + this.rnd() * 42,
        opacity: 0.18 + this.rnd() * 0.22,
        rotate: Math.round(this.rnd() * 360),
        delay: 0, z: 0, live: false,
      });
    }
  }

  /**
   * Ladang bunga penuh: grid ber-jitter di seluruh area lembar yang
   * pernah terlihat viewport (kuadran kanan-atas lembar). Satu dari
   * tiap empat bunga ikut wobble; sisanya statis agar ringan.
   */
  private buildField():void {
    const cols = 16, rows = 14;
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u = 0.24 + (c / (cols - 1)) * 0.76 + (this.rnd() - 0.5) * 0.055;
        const v = (r / (rows - 1)) * 0.76 + (this.rnd() - 0.5) * 0.055;
        if (u - v > 0.58) continue;   // zona tepi depan: milik garland

        const t = this.rnd();
        let src:string, w:number;
        if (t < 0.32)      { src = this.rnd() < 0.5 ? 'bloom-a.svg' : 'bloom-b.svg'; w = 88 + this.rnd() * 62; }
        else if (t < 0.56) { src = 'blossom.svg';   w = 40 + this.rnd() * 42; }
        else if (t < 0.74) { src = this.rnd() < 0.5 ? 'bloom-a.svg' : 'bloom-b.svg'; w = 52 + this.rnd() * 36; }
        else if (t < 0.87) { src = 'petal.svg';     w = 22 + this.rnd() * 30; }
        else if (t < 0.95) { src = 'bloom-bud.svg'; w = 34 + this.rnd() * 26; }
        else               { src = 'leaf-sprig.svg'; w = 64 + this.rnd() * 50; }

        i++;
        this.field.push({
          src,
          left: u * 100,
          top: v * 100,
          width: w,
          opacity: 0.82 + this.rnd() * 0.18,
          rotate: Math.round(this.rnd() * 360),
          delay: -this.rnd() * 3.9,
          z: 1,
          live: i % 4 === 0,
        });
      }
    }
  }

  /** Taburan idle; sampling ulang bila jatuh di zona teks sapaan. */
  private buildSprinkles():void {
    const kinds = ['petal.svg','blossom.svg','bloom-bud.svg','bloom-a.svg','petal.svg',
                   'blossom.svg','leaf-sprig.svg','bloom-b.svg','blossom.svg'];
    for (let i = 0; i < 18; i++) {
      let x = 0, y = 0, tries = 0;
      do {
        x = 3 + this.rnd() * 94;
        y = 2 + this.rnd() * 95;
        tries++;
      } while (tries < 24 && x > 15 && x < 85 && y > 22 && y < 78);
      const src = kinds[i % kinds.length];
      this.sprinkles.push({
        src,
        left: x,
        top: y,
        width: src === 'leaf-sprig.svg' ? 60 + this.rnd() * 40
             : src === 'bloom-bud.svg'  ? 30 + this.rnd() * 20
             : src === 'bloom-a.svg' || src === 'bloom-b.svg' ? 42 + this.rnd() * 26
             : 18 + this.rnd() * 30,
        opacity: 0.28 + this.rnd() * 0.3,
        rotate: Math.round(this.rnd() * 360),
        delay: 0, z: 0, live: false,
      });
    }
  }

  /**
   * Kurva hati parametrik x=16sin³t, y=13cost−5cos2t−2cos3t−cos4t.
   * Dua lapis wreath: luar lebih kecil & samar, utama di depan.
   * width di sini dalam % terhadap .heart-petals.
   */
  private buildHeartPetals():void {
    const ring = (n:number, sx:number, sy:number, wMin:number, wVar:number, op:number):void => {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        const px = 50 + (x / 16) * sx;
        const py = 50 - ((y + 2.5) / 14.5) * sy;
        const ang = Math.atan2(py - 50, px - 50) * 180 / Math.PI - 90 + (this.rnd() - 0.5) * 24;
        this.heartPetals.push({
          src: 'petal.svg',
          left: px,
          top: py,
          width: wMin + this.rnd() * wVar,
          opacity: op,
          rotate: ang,
          delay: (i / n) * 3.872,
          z: 0, live: true,
        });
      }
    };
    ring(18, 57, 55, 7.5, 2.5, 0.92);
    ring(26, 48.5, 46.5, 10, 4, 1);
  }

  /** Kelopak & bunga kecil melayang jatuh selama scene tampil. */
  private buildDriftPetals():void {
    for (let i = 0; i < 22; i++) {
      this.driftPetals.push({
        src: i % 3 === 1 ? 'blossom.svg' : 'petal.svg',
        left: 6 + this.rnd() * 88,
        width: 14 + this.rnd() * 16,
        opacity: 0.4 + this.rnd() * 0.4,
        fallDur: 9 + this.rnd() * 5,
        delay: -this.rnd() * 9,
        swayDur: 3 + this.rnd() * 3,
        swayAmp: 10 + this.rnd() * 18,
        rotate: Math.round(this.rnd() * 360),
      });
    }
  }

}
