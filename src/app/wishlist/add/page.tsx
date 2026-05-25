"use client";

import { useState } from "react";
import { ChevronLeft, ImagePlus } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { createWishlist } from "@/actions/wishlist";

export default function AddWishlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [image, setImage] = useState<string | null>(null);
  
  const [calcMode, setCalcMode] = useState<"months" | "daily">("months");
  const [targetMonths, setTargetMonths] = useState("");
  const [customDaily, setCustomDaily] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title || !targetAmount) return;
    
    setLoading(true);
    const amountVal = parseFloat(targetAmount.replace(/[^0-9]/g, ''));
    
    let months = null;
    let daily = null;

    if (calcMode === "months" && targetMonths) {
      months = parseInt(targetMonths, 10);
    } else if (calcMode === "daily" && customDaily) {
      daily = parseFloat(customDaily.replace(/[^0-9]/g, ''));
    }

    const res = await createWishlist({
      title,
      image,
      targetAmount: amountVal,
      targetMonths: months,
      customDaily: daily
    });

    if (res.success) {
      router.push("/wishlist");
    } else {
      alert("Failed to create wishlist: " + res.message);
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push("/wishlist")}>
          <ChevronLeft size={28} />
        </button>
        <h1 className={styles.title}>Buat Target Baru</h1>
      </header>

      <div className={styles.formCard}>
        <div className={styles.inputGroup}>
          <label>Foto Barang (Opsional)</label>
          <div className={styles.imageUploadBox}>
            {image ? (
              <img src={image} alt="Preview" />
            ) : (
              <>
                <ImagePlus size={32} style={{ marginBottom: 8 }} />
                <span>Ketuk untuk unggah foto</span>
              </>
            )}
            <input type="file" accept="image/*" className={styles.fileInput} onChange={handleImageUpload} />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Nama Barang / Tujuan</label>
          <input 
            type="text" 
            className={styles.inputField} 
            placeholder="Contoh: iPhone 15 Pro"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Target Dana (Rp)</label>
          <input 
            type="number" 
            className={styles.inputField} 
            placeholder="Contoh: 15000000"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Mode Kalkulasi (Opsional)</label>
          <div className={styles.optionsGrid}>
            <button 
              className={`${styles.optionBtn} ${calcMode === "months" ? styles.active : ""}`}
              onClick={() => setCalcMode("months")}
            >
              Target Waktu
            </button>
            <button 
              className={`${styles.optionBtn} ${calcMode === "daily" ? styles.active : ""}`}
              onClick={() => setCalcMode("daily")}
            >
              Target Harian
            </button>
          </div>

          {calcMode === "months" ? (
            <input 
              type="number" 
              className={styles.inputField} 
              placeholder="Target tercapai dalam berapa bulan?"
              value={targetMonths}
              onChange={(e) => setTargetMonths(e.target.value)}
            />
          ) : (
            <input 
              type="number" 
              className={styles.inputField} 
              placeholder="Berapa yang ingin ditabung per hari (Rp)?"
              value={customDaily}
              onChange={(e) => setCustomDaily(e.target.value)}
            />
          )}
        </div>

        <button 
          className={styles.submitBtn} 
          onClick={handleSubmit}
          disabled={loading || !title || !targetAmount}
        >
          {loading ? "Menyimpan..." : "Mulai Menabung!"}
        </button>
      </div>
    </main>
  );
}
