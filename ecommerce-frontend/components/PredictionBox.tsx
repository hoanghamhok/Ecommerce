"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PredictionRecommendation() {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const res = await fetch("http://localhost:5091/api/predictionmodels", {
          method: "POST",
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        let predictedText: string | null = null;

        if (typeof data.prediction === "string") {
          predictedText = data.prediction;
        } else if (data.prediction?.name) {
          predictedText = data.prediction.name;
        }

        setPrediction(predictedText);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-orange-100 to-orange-200 shadow-md"
      >
        <p className="text-gray-600 font-medium animate-pulse">
          🔮 Đang dự đoán...
        </p>
      </motion.div>
    );
  }

  if (!prediction) {
    return (
      <div className="mt-6 p-4 rounded-xl bg-gray-100 shadow-md">
        <p className="text-gray-500">🙁 Không có gợi ý hôm nay.</p>
      </div>
    );
  }

  return (
    <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="mt-6 p-6 rounded-xl bg-gradient-to-r from-orange-50 via-orange-100 to-orange-200 shadow-lg"
    >
    <h2 className="text-xl font-bold text-orange-700 mb-2 flex items-center gap-2">
        ✨ Hôm nay có thể bạn sẽ thích các sản phẩm thuộc về:{" "}
        <motion.span
        initial={{ scale: 0.9 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="text-xl font-extrabold text-orange-600 underline decoration-wavy"
        >
        {prediction}
        </motion.span>
    </h2>
    </motion.div>

  );
}
