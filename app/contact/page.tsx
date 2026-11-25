import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { Phone, Mail, ChevronRight, Building, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "যোগাযোগ | বাংলার আলো নিউজ",
  description: "বাংলার আলো নিউজের সাথে সরাসরি যোগাযোগ করুন। অফিস ঠিকানা, ফোন, ইমেইল এবং সংবাদ পাঠানোর মাধ্যম।",
};

export default function ContactPage() {
  return (
    <div className="bg-[#F8FAFC] py-6 sm:py-8 min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[#64748B] mb-5">
          <Link href="/" className="hover:text-[#0B7A43] transition-colors">প্রচ্ছদ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202124] font-semibold">যোগাযোগ</span>
        </nav>

        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-2xs p-5 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] mb-2 pb-3 border-b-2 border-[#0B7A43]">
            যোগাযোগ ও বার্তা প্রেরণ
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mb-6 leading-relaxed">
            আপনার কোনো মতামত, জিজ্ঞাসা, তথ্য সংশোধন বা বিজ্ঞাপনের বিষয়ে আমাদের বার্তা পাঠাতে পারেন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <ContactForm />

            {/* Office Info */}
            <div className="space-y-4 text-xs sm:text-sm text-[#202124]">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-[#0B7A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">প্রধান কার্যালয়:</strong>
                  <span>৩১/১ শরীফ কমপ্লেক্স (৬ষ্ঠ তলা), পুরানা পল্টন, ঢাকা-১০০০</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#0B7A43] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">মোবাইল ও হটলাইন:</strong>
                  <div className="space-y-0.5">
                    <p>
                      <span className="text-gray-500">সম্পাদকীয়: </span>
                      <a href="tel:01711006214" className="hover:text-[#0B7A43] transition-colors font-medium">০১৭১১-০০৬২১৪</a>
                    </p>
                    <p>
                      <span className="text-gray-500">কার্যালয়: </span>
                      <a href="tel:01999953970" className="hover:text-[#0B7A43] transition-colors font-medium">০১৯৯৯-৯৫৩৯৭০</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">ইমেইল:</strong>
                  <a href="mailto:banglaralonewsbd@gmail.com" className="hover:text-[#0B7A43] transition-colors font-medium">banglaralonewsbd@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#0284C7] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-gray-900">কার্যালয় সময়:</strong>
                  <span>রবিবার - বৃহস্পতিবার: সকাল ৯:০০ - সন্ধ্যা ৬:০০ (অনলাইন ডেস্ক ২৪/৭ সক্রিয়)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
