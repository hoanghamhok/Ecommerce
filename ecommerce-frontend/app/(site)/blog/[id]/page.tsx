// app/blog/[id]/page.tsx
// 
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, User, ArrowLeft } from "lucide-react";

// Fake blog data (thay bằng fetch API nếu có backend)
const posts = [
  {
    id: 1,
    title: "Top 5 điện thoại đáng mua nhất 2025",
    content: `
      <p><strong>1. iPhone 15 Pro Max:</strong> Hiệu năng xuất sắc, camera đỉnh cao, thiết kế sang trọng.</p>
      <p><strong>2. Samsung Galaxy S24 Ultra:</strong> Camera AI 200MP, màn hình Dynamic AMOLED, pin cực trâu.</p>
      <p><strong>3. Xiaomi 15 Ultra:</strong> Giá tốt, cấu hình flagship, sạc siêu nhanh.</p>
      <p><strong>4. OPPO Find X7 Pro:</strong> Camera zoom quang học, thiết kế trẻ trung.</p>
      <p><strong>5. Google Pixel 9 Pro:</strong> Android gốc, cập nhật nhanh, camera AI xuất sắc.</p>
      <p>Bạn nên cân nhắc nhu cầu thực tế và ngân sách để lựa chọn phù hợp nhất!</p>
    `,
    imageUrl: "/images/top5.png",
    author: "GoCart Team",
    date: "2025-06-10",
    category: "Công nghệ",
  },
  {
    id: 2,
    title: "Bí quyết chọn laptop phù hợp cho sinh viên",
    content: `
      <p><strong>Hiểu rõ nhu cầu:</strong> Học tập, lập trình, thiết kế hay giải trí?</p>
      <p><strong>Ưu tiên cấu hình:</strong> CPU Intel i5/Ryzen 5 trở lên, RAM tối thiểu 8GB, SSD 256GB.</p>
      <p><strong>Trọng lượng & Pin:</strong> Nên chọn máy nhẹ, pin từ 6 tiếng trở lên để tiện di chuyển.</p>
      <p><strong>Thương hiệu uy tín:</strong> Dell, Asus, HP, Apple, Lenovo...</p>
      <p>Đừng quên tham khảo các chương trình ưu đãi cho sinh viên để tiết kiệm chi phí!</p>
    `,
    imageUrl: "/images/tiplaptop.png",
    author: "GoCart Team",
    date: "2025-05-30",
    category: "Hướng dẫn",
  },
  {
    id: 3,
    title: "Xu hướng thời trang công nghệ năm nay",
    content: `
      <p><strong>Thiết bị đeo thông minh:</strong> Đồng hồ, vòng tay tích hợp AI, đo sức khỏe, thời trang cá tính.</p>
      <p><strong>Phụ kiện cá nhân hóa:</strong> Ốp lưng, dây đồng hồ, tai nghe màu sắc, in tên riêng.</p>
      <p><strong>Thời trang phối công nghệ:</strong> Kết hợp trang phục với phụ kiện tech tạo điểm nhấn hiện đại.</p>
      <p>Hãy tự tin thể hiện cá tính cùng các xu hướng mới nhất tại GoCart!</p>
    `,
    imageUrl: "/images/techfash.png",
    author: "GoCart Team",
    date: "2025-05-15",
    category: "Xu hướng",
  },
];

function getPostById(id: number) {
  return posts.find((p) => p.id === id);
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const post = await getPostById(postId); // nếu là async


  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="max-w-3xl mx-auto px-4 py-14">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center mb-8 text-blue-500 hover:underline font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Quay lại Blog
        </Link>

        {/* Blog image */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-72 object-cover"
          />
        </div>

        {/* Title & meta */}
        <h1 className="text-4xl font-black text-slate-900 mb-3">{post.title}</h1>
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-8">
          <span className="flex items-center gap-1">
            <User className="w-4 h-4" /> {post.author}
          </span>
          {/* <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString()}
          </span> */}
          <span className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-3 py-1 rounded-full font-semibold text-xs">
            {post.category}
          </span>
        </div>

        {/* Content */}
        <div
          className="prose prose-blue max-w-none text-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/shop"
            className="inline-block bg-gradient-to-r from-blue-500 to-emerald-400 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-emerald-500 transition-all duration-200 shadow-lg"
          >
            Khám phá sản phẩm hot tại GoCart
          </Link>
        </div>
      </div>
    </div>
  );
}
