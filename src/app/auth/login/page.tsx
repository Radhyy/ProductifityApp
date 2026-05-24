"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { login, register } from "@/actions/auth";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    let res;
    if (isLogin) {
      res = await login(email, password);
    } else {
      if (!name) {
        setError("Name is required");
        setLoading(false);
        return;
      }
      res = await register(name, email, password);
    }

    if (!res.success) {
      setError(res.error || "An error occurred");
      setLoading(false);
    } else {
      // Force a full reload to clear the AuthWall cache
      window.location.href = "/";
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        <button 
          onClick={() => router.push("/")}
          style={{ background: 'transparent', border: 'none', color: '#111', cursor: 'pointer', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}
        >
          <ArrowLeft size={20} /> Back
        </button>

        <h1 className={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className={styles.subtitle}>
          {isLogin ? "Enter your details to access your dashboard." : "Join us to boost your productivity."}
        </p>
        
        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="John Doe" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrapper}>
              <input 
                type="email" 
                className={styles.input} 
                placeholder="you@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                className={styles.input} 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className={styles.eyeBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <p className={styles.switchText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            className={styles.switchBtn}
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </main>
  );
}
