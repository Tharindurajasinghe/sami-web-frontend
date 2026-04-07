// src/pages/admin/AdminCategories.jsx
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../services/api.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { compressImage } from '../../utils/image.js';
import { Plus, Trash2, Loader2, ImagePlus, Pencil, X } from 'lucide-react';


export default function AdminCategories() {
  const { t, lang } = useLang();
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState({ name: '', nameSi: '', image: null });
  const [editId, setEditId] = useState(null);   // null = adding, string = editing


  const load = () => {
    setLoading(true);
    categoryApi.getAll().then(setCategories).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { setForm(f => ({ ...f, image: null })); const b64 = await compressImage(file); setForm(f => ({ ...f, image: b64 })); }
    catch (err) { toast.error(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await categoryApi.update(editId, form.name.trim(), form.nameSi.trim(), form.image);
        toast.success(t('update') + '!');
      } else {
        await categoryApi.create(form.name.trim(), form.nameSi.trim(), form.image);
        toast.success(t('categoryAdded'));
      }
      setForm({ name: '', nameSi: '', image: null });
      setEditId(null);
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, nameSi: cat.nameSi || '', image: cat.image || null });
    setEditId(cat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setForm({ name: '', nameSi: '', image: null });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await categoryApi.delete(id); toast.success(t('deleted')); load(); }
    catch (err) { toast.error(err.message); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('manageCategories')}</h2>

      {/* Add form */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          {editId ? <Pencil size={18} className="text-orange-500"/> : <Plus size={18} className="text-orange-500"/>}
        {editId ? (lang === 'si' ? 'ප්‍රවර්ගය සංස්කරණය' : 'Edit Category') : t('addCategory')}
        </h3>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('categoryName')}</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field" placeholder="e.g. Fruits"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('categoryNameSi')}</label>
            <input value={form.nameSi} onChange={e => setForm(f => ({ ...f, nameSi: e.target.value }))}
              className="input-field" placeholder="e.g. පළතුරු"/>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('categoryImage')}</label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-orange-200 rounded-xl p-4 hover:border-orange-400 transition-colors">
              <ImagePlus size={20} className="text-orange-400"/>
              <span className="text-sm text-gray-500">
                {form.image ? (lang === 'si' ? 'රූපය තෝරා ගත්තා' : 'Image selected') : (lang === 'si' ? 'රූපයක් තෝරන්න' : 'Choose image')}
              </span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden"/>
            </label>
            {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 rounded-lg object-cover"/>}
          </div>
          <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {editId ? <Pencil size={16}/> : <Plus size={16}/>}
                {saving ? '...' : editId ? t('update') : t('add')}
              </button>
              {editId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary flex items-center gap-2">
                  <X size={16}/>{t('cancel')}
                </button>
              )}
            </div>
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={32} className="animate-spin text-orange-400"/></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map(cat => {
            const name = lang === 'si' && cat.nameSi ? cat.nameSi : cat.name;
            return (
              <div key={cat._id} className="card overflow-hidden">
                <div className="h-32 bg-orange-50 flex items-center justify-center overflow-hidden">
                  {cat.image ? <img src={cat.image} alt={name} className="w-full h-full object-cover"/> : <span className="text-4xl">🛍️</span>}
                </div>
                <div className="p-3 flex items-center justify-between">
                  <p className="font-medium text-gray-800 text-sm truncate">{name}</p>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)} className="text-orange-400 hover:text-orange-600 shrink-0">
                      <Pencil size={16}/>
                    </button>
                    <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-600 shrink-0">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
