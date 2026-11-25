"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  Award,
  CheckCircle2,
  RotateCcw,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Building,
} from "lucide-react";
import { FamilyMember, DEFAULT_FAMILY_MEMBERS } from "@/types/family";
import { getFamilyMembers, saveFamilyMembers } from "@/services/familyService";

export default function OurFamilyManager() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "সহকারী বার্তা সম্পাদক",
    category: "editorial" as "editorial" | "desk" | "correspondent" | "management",
    categoryTitle: "সম্পাদকীয় ও পরিচালনা পর্ষদ",
    email: "banglaralonewsbd@gmail.com",
    phone: "",
    photo: "",
    bio: "",
    subMembers: "",
    order: 1,
    isActive: true,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFamilyMembers();
      setMembers(data);
    } catch {
      setMembers(DEFAULT_FAMILY_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      role: "সহকারী বার্তা সম্পাদক",
      category: "editorial",
      categoryTitle: "সম্পাদকীয় ও পরিচালনা পর্ষদ",
      email: "banglaralonewsbd@gmail.com",
      phone: "",
      photo: "",
      bio: "",
      subMembers: "",
      order: members.length + 1,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: FamilyMember) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      role: m.role,
      category: m.category,
      categoryTitle: m.categoryTitle || "",
      email: m.email || "",
      phone: m.phone || "",
      photo: m.photo || "",
      bio: m.bio || "",
      subMembers: m.subMembers || "",
      order: m.order || 1,
      isActive: m.isActive !== false,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    let updatedList: FamilyMember[];
    if (editingMember) {
      updatedList = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              name: formData.name.trim(),
              role: formData.role.trim(),
              category: formData.category,
              categoryTitle: formData.categoryTitle.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              photo: formData.photo.trim(),
              bio: formData.bio.trim(),
              subMembers: formData.subMembers.trim(),
              order: Number(formData.order) || 1,
              isActive: formData.isActive,
            }
          : m
      );
      setSuccessMessage("সদস্য তথ্য সফলভাবে আপডেট করা হয়েছে!");
    } else {
      const newMember: FamilyMember = {
        id: `fam-${Date.now()}`,
        name: formData.name.trim(),
        role: formData.role.trim(),
        category: formData.category,
        categoryTitle: formData.categoryTitle.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        photo: formData.photo.trim(),
        bio: formData.bio.trim(),
        subMembers: formData.subMembers.trim(),
        order: Number(formData.order) || members.length + 1,
        isActive: formData.isActive,
      };
      updatedList = [...members, newMember];
      setSuccessMessage("নতুন সদস্য সফলভাবে পরিবারে যুক্ত করা হয়েছে!");
    }

    setMembers(updatedList);
    await saveFamilyMembers(updatedList);
    setShowModal(false);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই সদস্যকে তালিকা থেকে মুছে ফেলতে চান?")) return;
    const updated = members.filter((m) => m.id !== id);
    setMembers(updated);
    await saveFamilyMembers(updated);
    setSuccessMessage("সদস্যকে তালিকা থেকে সরানো হয়েছে।");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleResetDefaults = async () => {
    if (confirm("আপনি কি মূল ডিফল্ট তালিকায় ফিরিয়ে নিতে চান?")) {
      setMembers(DEFAULT_FAMILY_MEMBERS);
      await saveFamilyMembers(DEFAULT_FAMILY_MEMBERS);
      setSuccessMessage("ডিফল্ট পরিবার তালিকা রিস্টোর করা হয়েছে।");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.categoryTitle && m.categoryTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = categoryFilter === "all" || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const editorialCount = members.filter((m) => m.category === "editorial").length;
  const deskCount = members.filter((m) => m.category === "desk").length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0B7A43] via-[#065F34] to-[#044424] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-white/15 backdrop-blur-xs text-white">
                <Users className="w-6 h-6" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Editorial Board & Team Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              আমাদের পরিবার ব্যবস্থাপনা (Our Family)
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-xl">
              দৈনিক বাংলার আলো নিউজ পত্রিকার সম্পাদকীয় পরিষদ, বার্তা বিভাগ, সাংবাদিক ও কর্মকর্তাদের তথ্য ডায়নামিকালি পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/20"
              title="ডিফল্ট তালিকা রিস্টোর করুন"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[#0B7A43] text-sm font-black transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>নতুন সদস্য যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15 text-white">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-200 block font-medium">মোট সদস্য</span>
            <span className="text-xl sm:text-2xl font-black">{members.length} জন</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-200 block font-medium">সম্পাদকীয় পর্ষদ</span>
            <span className="text-xl sm:text-2xl font-black">{editorialCount} জন</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-200 block font-medium">বার্তা ডেস্ক</span>
            <span className="text-xl sm:text-2xl font-black">{deskCount} টি</span>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <span className="text-[11px] text-emerald-200 block font-medium">ওয়েবসাইট লিংক</span>
            <span className="text-sm font-bold text-emerald-100 flex items-center gap-1 mt-1">
              /our-family
            </span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নাম, পদবী বা ডেস্ক খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30 focus:border-[#0B7A43]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs sm:text-sm py-2 px-3 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
          >
            <option value="all">সকল বিভাগ / ক্যাটাগরি</option>
            <option value="editorial">সম্পাদকীয় ও পরিচালনা পর্ষদ</option>
            <option value="desk">বার্তা বিভাগ ও সম্পাদকীয় ডেস্ক</option>
            <option value="correspondent">জেলা ও উপজেলা প্রতিনিধি</option>
            <option value="management">ব্যবস্থাপনা ও প্রশাসন</option>
          </select>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 font-medium text-sm">
          পরিবারের সদস্যদের তথ্য লোড হচ্ছে...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700">কোনো সদস্য পাওয়া যায়নি</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            নতুন সদস্য যোগ করতে উপরের বাটনে চাপুন।
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-[#0B7A43] text-white text-xs font-bold cursor-pointer"
          >
            সদস্য যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#0B7A43] border border-emerald-100 flex items-center gap-1">
                    {member.category === "editorial" ? (
                      <Award className="w-3 h-3 text-[#DC2626]" />
                    ) : member.category === "desk" ? (
                      <Building className="w-3 h-3 text-[#0B7A43]" />
                    ) : (
                      <Users className="w-3 h-3 text-[#1877F2]" />
                    )}
                    <span>{member.categoryTitle || (member.category === "editorial" ? "সম্পাদকীয় পর্ষদ" : "ডেস্ক")}</span>
                  </span>

                  <span className="text-[11px] font-mono text-gray-400">
                    #{member.order}
                  </span>
                </div>

                {/* Member Profile */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0B7A43] to-[#044424] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs overflow-hidden">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      member.name.slice(0, 2)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11.5px] font-bold text-[#DC2626] block leading-tight">
                      {member.role}
                    </span>
                    <h3 className="font-extrabold text-base text-[#111827] group-hover:text-[#0B7A43] transition-colors truncate">
                      {member.name}
                    </h3>
                  </div>
                </div>

                {/* Desk info / associates */}
                {member.subMembers && (
                  <div className="mb-3 p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">সহযোগী:</span> {member.subMembers}
                  </div>
                )}

                {/* Contact info */}
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  {member.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0B7A43] shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> সক্রিয়
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(member)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-[#0B7A43] transition-colors cursor-pointer"
                    title="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#0B7A43] to-[#044424] text-white flex items-center justify-between">
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>{editingMember ? "সদস্য তথ্য সম্পাদনা করুন" : "নতুন সদস্য যোগ করুন"}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  সদস্যের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ গোলাম মাওলা শাওন"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    পদবী / Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: প্রকাশক ও সম্পাদক"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      setFormData({
                        ...formData,
                        category: cat,
                        categoryTitle:
                          cat === "editorial"
                            ? "সম্পাদকীয় ও পরিচালনা পর্ষদ"
                            : cat === "desk"
                            ? "জাতীয় ও রাজনীতি ডেস্ক"
                            : cat === "correspondent"
                            ? "জেলা ও উপজেলা প্রতিনিধি"
                            : "ব্যবস্থাপনা ও প্রশাসন",
                      });
                    }}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  >
                    <option value="editorial">সম্পাদকীয় ও পরিচালনা পর্ষদ</option>
                    <option value="desk">বার্তা বিভাগ ও সম্পাদকীয় ডেস্ক</option>
                    <option value="correspondent">জেলা ও উপজেলা প্রতিনিধি</option>
                    <option value="management">ব্যবস্থাপনা ও প্রশাসন</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  বিভাগ / ডেস্কের শিরোনাম (Category Title)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সম্পাদকীয় ও পরিচালনা পর্ষদ অথবা জাতীয় ও রাজনীতি ডেস্ক"
                  value={formData.categoryTitle}
                  onChange={(e) => setFormData({ ...formData, categoryTitle: e.target.value })}
                  className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                />
              </div>

              {formData.category === "desk" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    সহযোগী সদস্যগণ (Associates)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: রিপন মিয়া, আরিফুল ইসলাম"
                    value={formData.subMembers}
                    onChange={(e) => setFormData({ ...formData, subMembers: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ইমেইল</label>
                  <input
                    type="email"
                    placeholder="banglaralonewsbd@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">মোবাইল নম্বর</label>
                  <input
                    type="text"
                    placeholder="০১৭১১-০০৬২১৪"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ছবির URL (ঐচ্ছিক)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্রমবিন্যাস (Order Serial)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) || 1 })}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B7A43]/30"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0B7A43] hover:bg-[#065F34] text-white text-xs font-bold shadow-md cursor-pointer transition-colors"
                >
                  {editingMember ? "সংরক্ষণ করুন" : "সদস্য যোগ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
