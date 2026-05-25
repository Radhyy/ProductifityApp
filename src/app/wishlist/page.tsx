"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Plus, Image as ImageIcon, Trash2 } from "lucide-react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { getWishlists, addSaving, deleteWishlist } from "@/actions/wishlist";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Funds Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");

  // Delete Confirm Modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const res = await getWishlists();
    if (res.success && res.data) {
      setWishlists(res.data);
    }
    setLoading(false);
  };

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  const handleAddFunds = async () => {
    if (!selectedId || !amount) return;
    const val = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(val) || val <= 0) return;

    // Optimistic update
    setWishlists(prev => prev.map(w => w.id === selectedId ? { ...w, currentAmount: w.currentAmount + val } : w));
    setShowModal(false);
    setAmount("");

    await addSaving(selectedId, val);
  };

  const handleDelete = async (id: string) => {
    setWishlists(prev => prev.filter(w => w.id !== id));
    setDeleteConfirmId(null);
    await deleteWishlist(id);
  };

  const calculateDaily = (w: any) => {
    const remaining = w.targetAmount - w.currentAmount;
    if (remaining <= 0) return "Tercapai! 🎉";

    if (w.customDaily && w.customDaily > 0) {
      const days = Math.ceil(remaining / w.customDaily);
      return `Target tercapai dalam ~${days} hari`;
    }

    if (w.targetMonths && w.targetMonths > 0) {
      const daysLeft = w.targetMonths * 30; // Approximation
      const dailyReq = remaining / daysLeft;
      return `Nabung ${formatRp(dailyReq)} / hari`;
    }

    return "Belum ada target harian";
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={() => router.push("/")}>
            <ChevronLeft size={28} />
          </button>
          <h1 className={styles.title}>My Wishlist</h1>
        </div>
        <button className={styles.addBtn} onClick={() => router.push("/wishlist/add")}>
          <Plus size={24} />
        </button>
      </header>

      {loading ? (
        <div className={styles.emptyState}>Loading...</div>
      ) : wishlists.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={48} color="#ccc" style={{ marginBottom: 16 }} />
          <h3>Belum ada wishlist</h3>
          <p>Mulai menabung untuk barang impianmu!</p>
        </div>
      ) : (
        wishlists.map((w) => {
          const progress = Math.min(100, Math.round((w.currentAmount / w.targetAmount) * 100));
          return (
            <div key={w.id} className={styles.card}>
              <button 
                onClick={() => setDeleteConfirmId(w.id)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#ff3b30', cursor: 'pointer' }}
              >
                <Trash2 size={20} />
              </button>

              <div className={styles.cardHeader}>
                <div className={styles.imageBox}>
                  {w.image ? (
                    <img src={w.image} alt={w.title} />
                  ) : (
                    <ImageIcon size={32} color="#aaa" style={{ margin: 24 }} />
                  )}
                </div>
                <div className={styles.infoBox}>
                  <div className={styles.itemName}>{w.title}</div>
                  <div className={styles.targetText}>Target: {formatRp(w.targetAmount)}</div>
                </div>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressLabels}>
                  <span style={{ color: '#34c759' }}>{formatRp(w.currentAmount)}</span>
                  <span>{progress}%</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className={styles.calcBox}>
                <span className={styles.calcText}>Saran Tabungan:</span>
                <span className={styles.calcAmount}>{calculateDaily(w)}</span>
              </div>

              {progress < 100 && (
                <button 
                  className={styles.addFundsBtn}
                  onClick={() => {
                    setSelectedId(w.id);
                    setShowModal(true);
                  }}
                >
                  + Tambah Uang
                </button>
              )}
            </div>
          );
        })
      )}

      {/* Modal Add Funds */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Tambah Tabungan</h3>
            <div className={styles.inputGroup}>
              <label>Jumlah (Rp)</label>
              <input 
                type="number" 
                className={styles.inputField} 
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => {
                setShowModal(false);
                setAmount("");
              }}>Batal</button>
              <button className={styles.saveBtn} onClick={handleAddFunds}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ textAlign: 'center' }}>
            <div style={{ background: '#ffeeee', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={32} color="#ff3b30" />
            </div>
            <h3 className={styles.modalTitle} style={{ marginBottom: 8 }}>Hapus Wishlist?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
              Apakah Anda yakin ingin menghapus target tabungan ini? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setDeleteConfirmId(null)}>Batal</button>
              <button className={styles.saveBtn} style={{ background: '#ff3b30' }} onClick={() => handleDelete(deleteConfirmId)}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
