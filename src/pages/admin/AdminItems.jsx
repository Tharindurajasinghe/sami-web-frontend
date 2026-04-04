// src/pages/admin/AdminItems.jsx
import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil, Loader2, ImagePlus, X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { itemApi, categoryApi } from '../../services/api.js';
import { useLang } from '../../context/LanguageContext.jsx';
import { compressImage } from '../../utils/image.js';

const EMPTY = { name: '', nameSi: '', categoryId: '', price: '', discount: '0', available: true, image: null };

export default function AdminItems() {
  const { t, lang } = useLang();
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);
  const [filterCat,  setFilterCat]  = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cats, itms] = await Promise.all([categoryApi.getAll(), itemApi.getAll()]);
      setCategories(cats);
      setItems(itms);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try { const b64 = await compressImage(file); setForm(f => ({ ...f, image: b64 })); }
    catch (err) { toast.error(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.categoryId || !form.price) { toast.error('Fill required fields'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), nameSi: form.nameSi.trim(),
        categoryId: form.categoryId,
        price: Number(form.price), discount: Number(form.discount || 0),
        available: form.available,
        ...(form.image ? { image: form.image } : {}),
      };
      if (editId) { await itemApi.update(editId, payload); toast.success(t('itemUpdated')); }
      else        { await itemApi.create(payload);          toast.success(t('itemAdded'));   }
      setForm(EMPTY); setEditId(null); load();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const startEdit = (item) => {
    setForm({
      name: item.name, nameSi: item.nameSi || '', categoryId: item.categoryId,
      price: String(item.price), discount: String(item.discount || 0),
      available: item.available, image: item.image || null,
    });
    setEditId(item._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) return;
    try { await itemApi.delete(id); toast.success(t('deleted')); load(); }
    catch (err) { toast.error(err.message); }
  };

  const filtered = filterCat ? items.filter(i => i.categoryId === filterCat) : items;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-6">{t('manageItems')}</h2>

      {/* Form */}
      <div className="card p-5 mb-6">
        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Plus size={18} className="text-orange-500"/>
          {editId ? t('edit') : t('addItem')}
          {editId && (
            <button onClick={() => { setForm(EMPTY); setEditId(null); }} className="ml-auto text-gray-400 hover:text-gray-600">
              <X size={18}/>
            </button>
          )}
        </h3>
        <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('itemName')} *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" placeholder="e.g. Apple"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('itemNameSi')}</label>
            <input value={form.nameSi} onChange={e => setForm(f => ({ ...f, nameSi: e.target.value }))} className="input-field" placeholder="e.g. ඇපල්"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('selectCategory')} *</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input-field">
              <option value="">{t('selectCategory')}</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{lang === 'si' && c.nameSi ? c.nameSi : c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('itemPrice')} *</label>
            <input type="number" min="0" step="0.01" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input-field" placeholder="0.00"/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('itemDiscount')}</label>
            <input type="number" min="0" max="100" value={form.discount}
              onChange={e => setForm(f => ({ ...f, discount: e.target.value }))} className="input-field" placeholder="0"/>
          </div>
          <div className="flex items-center gap-3 pt-5">
            <input type="checkbox" id="avail" checked={form.available}
              onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} className="w-5 h-5 accent-orange-500"/>
            <label htmlFor="avail" className="text-sm font-medium text-gray-700">{t('itemAvailable')}</label>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('itemImage')}</label>
            <label className="flex items-center gap-3 cursor-pointer border-2 border-dashed border-orange-200 rounded-xl p-4 hover:border-orange-400 transition-colors">
              <ImagePlus size={20} className="text-orange-400"/>
              <span className="text-sm text-gray-500">
                {form.image ? (lang === 'si' ? 'රූපය තෝරා ගත්තා' : 'Image selected') : (lang === 'si' ? 'රූපයක් තෝරන්න' : 'Choose image')}
              </span>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden"/>
            </label>
            {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 rounded-lg object-cover"/>}
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {editId ? <Check size={16}/> : <Plus size={16}/>}
              {saving ? '...' : editId ? t('update') : t('add')}
            </button>
            {editId && <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); }} className="btn-secondary">{t('cancel')}</button>}
          </div>
        </form>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-field max-w-xs">
          <option value="">{lang === 'si' ? 'සියලු ප්‍රවර්ග' : 'All Categories'}</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{lang === 'si' && c.nameSi ? c.nameSi : c.name}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 size={32} className="animate-spin text-orange-400"/></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map(item => {
            const name    = lang === 'si' && item.nameSi ? item.nameSi : item.name;
            const catName = (() => { const c = categories.find(c => c._id === item.categoryId); return c ? (lang === 'si' && c.nameSi ? c.nameSi : c.name) : ''; })();
            return (
              <div key={item._id} className="card overflow-hidden">
                <div className="h-32 bg-orange-50 flex items-center justify-center overflow-hidden relative">
                  {item.image ? <img src={item.image} alt={name} className="w-full h-full object-cover"/> : <span className="text-4xl">📦</span>}
                  {item.discount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">-{item.discount}%</span>
                  )}
                  {!item.available && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-red-500 px-2 py-0.5 rounded">{t('notAvailable')}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-800 truncate">{name}</p>
                  <p className="text-xs text-gray-400">{catName}</p>
                  {item.discount > 0 ? (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-gray-400 line-through text-xs">Rs.{item.price}</span>
                      <span className="text-orange-600 font-bold text-sm">Rs.{item.finalPrice}</span>
                    </div>
                  ) : (
                    <p className="text-orange-600 font-bold text-sm mt-1">Rs. {item.price}</p>
                  )}
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => startEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-medium transition-colors">
                      <Pencil size={12}/>{t('edit')}
                    </button>
                    <button onClick={() => handleDelete(item._id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 text-xs font-medium transition-colors">
                      <Trash2 size={12}/>{t('delete')}
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
