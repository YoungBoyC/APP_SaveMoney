import React from 'react';
import { Briefcase, ExternalLink, TrendingUp, DollarSign, Globe, PenTool, Code, Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const JOB_SUGGESTIONS = [
  {
    title: 'Freelance Designer',
    platform: 'vLance.vn',
    icon: <PenTool className="text-pink-500" size={20} />,
    link: 'https://www.vlance.vn/viec-lam-freelance/thiet-ke-do-hoa',
    description: 'Thiết kế logo, banner, giao diện web cho các doanh nghiệp Việt.'
  },
  {
    title: 'Content Writer',
    platform: 'Freelancer.com',
    icon: < Globe className="text-blue-500" size={20} />,
    link: 'https://www.freelancer.com/jobs/content-writing',
    description: 'Viết bài blog, nội dung mạng xã hội hoặc dịch thuật từ xa.'
  },
  {
    title: 'Web Developer',
    platform: 'Upwork',
    icon: <Code className="text-indigo-500" size={20} />,
    link: 'https://www.upwork.com/nx/jobs/search/?q=web%20development',
    description: 'Xây dựng website, ứng dụng hoặc sửa lỗi code cho khách hàng quốc tế.'
  },
  {
    title: 'Affiliate Marketing',
    platform: 'Accesstrade',
    icon: <TrendingUp className="text-emerald-500" size={20} />,
    link: 'https://accesstrade.vn/publisher',
    description: 'Kiếm hoa hồng bằng cách chia sẻ link sản phẩm từ Shopee, Lazada.'
  }
];

const JobSuggestions: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          < DollarSign size={20} className="text-emerald-600" />
          Gợi ý kiếm thêm thu nhập 💸
        </h3>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">AI Suggested</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {JOB_SUGGESTIONS.map((job, index) => (
          <motion.a
            key={index}
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-50 rounded-full blur-2xl group-hover:bg-indigo-50 transition-all"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {job.icon}
              </div>
              
              <h4 className="font-black text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{job.title}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{job.platform}</p>
              
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-4 line-clamp-2">
                {job.description}
              </p>
              
              <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Xem việc ngay <ExternalLink size={12} />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default JobSuggestions;
