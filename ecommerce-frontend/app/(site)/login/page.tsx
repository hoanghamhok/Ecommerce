'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../../../services/api";
import { Lock, User, Loader2, ArrowRight, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setErrorMessage("");

  try {
    const response = await login(username, password);
    const data = response.data as { token: string; user: any };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/";
  } catch (error: any) {
    const message =
      typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.title || "Đăng nhập thất bại";
    setErrorMessage(message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        {/* Icon Header */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full p-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Chào mừng trở lại</h2>
        <p className="text-center text-slate-500 mb-6">Đăng nhập để tiếp tục trải nghiệm GoCart!</p>

        {errorMessage && (
          <div className="flex items-center bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
            <span className="mr-2">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>
          {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>)}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-emerald-500 transition-all duration-200 shadow-lg flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <a 
            href="/forgot-password" 
            className="text-sm text-blue-500 hover:underline font-medium"
          >
            Quên mật khẩu?
          </a>
          <p className="text-slate-500 text-sm">
            Chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500 hover:underline font-medium">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
