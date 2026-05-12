// src/pages/admin/AdminBanner.jsx
import { useEffect, useState, useRef } from 'react';
import { Loader2, Save, ImagePlus, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { bannerApi } from '../../services/api.js';
import { compressImage } from '../../utils/image.js';
import { useLang } from '../../context/LanguageContext.jsx';

export default function AdminBanner() {
  const { lang } = useLang();

  const [text,       setText]       = useState('');
  const [leftImage,  setLeftImage]  = useState('');
  const [rightImage, setRightImage] = useState('');
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [preview,    setPreview]    = useState(false);

  const leftRef  = useRef();
  const rightRef = useRef();

  // Load current banner from DB
  useEffect(() => {
    bannerApi.get()
      .then(b => {
        setText(b.text       || '');
        setLeftImage(b.leftImage   || '');
        setRightImage(b.rightImage || '');
      })
      .catch(() => toast.error('Could not load banner'))
      .finally(() => setLoading(false));
  }, []);

  const handleImage = async (file, side) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 900);
      if (side === 'left')  setLeftImage(compressed);
      if (side === 'right') setRightImage(compressed);
    } catch (err) {
      toast.error(err.message || 'Image too large');
    }
  };

  const handleSave = async () => {
    if (!text.trim()) { toast.error('Banner text cannot be empty'); return; }
    setSaving(true);
    try {
      await bannerApi.update(text, leftImage, rightImage);
      toast.success(lang === 'si' ? 'බැනරය යාවත්කාලීන කළා!' : 'Banner updated!');
    } catch (err) {
      toast.error(err.message);
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-orange-400"/></div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {lang === 'si' ? 'බැනරය සංස්කරණය' : 'Edit Seasonal Banner'}
        </h2>
        <button onClick={() => setPreview(p => !p)}
          className="flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-700 font-medium">
          <Eye size={15}/>
          {preview
            ? (lang === 'si' ? 'පෙරදර්ශනය සඟවන්න' : 'Hide Preview')
            : (lang === 'si' ? 'පෙරදර්ශනය' : 'Show Preview')}
        </button>
      </div>

      {/* Live preview */}
      {preview && (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white relative">
            <div className="max-w-full mx-auto flex items-end justify-between gap-0">
              <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 h-44 overflow-hidden">
                {leftImage
                  ? <img src={leftImage} alt="left" className="h-full w-auto object-contain object-bottom"/>
                  : <div className="w-full h-full flex items-center justify-center text-orange-300 text-xs">No image</div>}
              </div>
              <div className="flex-1 py-8 px-4 text-center">
                <h1 className="text-2xl font-bold mb-1">
                  {lang === 'si' ? 'දිසානායක සිටි සෙන්ටර්' : 'Dissanayaka City Center'}
                </h1>
                <div className="mt-3 border-t border-orange-400/50 pt-3">
                  <p className="text-yellow-100 text-lg font-semibold">{text || '...'}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-end justify-center flex-shrink-0 w-36 h-44 overflow-hidden">
                {rightImage
                  ? <img src={rightImage} alt="right" className="h-full w-auto object-contain object-bottom"/>
                  : <div className="w-full h-full flex items-center justify-center text-orange-300 text-xs">No image</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6 space-y-6">

        {/* Seasonal text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {lang === 'si' ? 'බැනර් පණිවිඩය' : 'Banner Message'}
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            className="input-field resize-none"
            placeholder={lang === 'si' ? 'සීසන් පණිවිඩය ලියන්න...' : 'Enter seasonal message...'}
          />
          <p className="text-xs text-gray-400 mt-1">
            {lang === 'si' ? 'සිංහල හෝ ඉංග්‍රීසි භාවිතා කළ හැකිය.' : 'Sinhala or English text is supported.'}
          </p>
        </div>

        {/* Images — side by side */}
        <div className="grid sm:grid-cols-2 gap-6">

          {/* Left image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'si' ? 'වම් රූපය' : 'Left Image'}
            </label>
            <div className="border-2 border-dashed border-orange-200 rounded-xl overflow-hidden bg-orange-50 relative"
              style={{ minHeight: 160 }}>
              {leftImage ? (
                <>
                  <img src={leftImage} alt="left" className="w-full h-40 object-contain p-2"/>
                  <button
                    onClick={() => setLeftImage('')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                    <X size={14}/>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-orange-300 gap-2 cursor-pointer"
                  onClick={() => leftRef.current?.click()}>
                  <ImagePlus size={32}/>
                  <span className="text-xs text-gray-400">
                    {lang === 'si' ? 'රූපයක් තෝරන්න' : 'Click to choose image'}
                  </span>
                </div>
              )}
            </div>
            <input ref={leftRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImage(e.target.files[0], 'left')}/>
            <button onClick={() => leftRef.current?.click()}
              className="mt-2 w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <ImagePlus size={14}/>
              {leftImage
                ? (lang === 'si' ? 'රූපය වෙනස් කරන්න' : 'Change Image')
                : (lang === 'si' ? 'රූපය තෝරන්න' : 'Choose Image')}
            </button>
          </div>

          {/* Right image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {lang === 'si' ? 'දකුණු රූපය' : 'Right Image'}
            </label>
            <div className="border-2 border-dashed border-orange-200 rounded-xl overflow-hidden bg-orange-50 relative"
              style={{ minHeight: 160 }}>
              {rightImage ? (
                <>
                  <img src={rightImage} alt="right" className="w-full h-40 object-contain p-2"/>
                  <button
                    onClick={() => setRightImage('')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1">
                    <X size={14}/>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-orange-300 gap-2 cursor-pointer"
                  onClick={() => rightRef.current?.click()}>
                  <ImagePlus size={32}/>
                  <span className="text-xs text-gray-400">
                    {lang === 'si' ? 'රූපයක් තෝරන්න' : 'Click to choose image'}
                  </span>
                </div>
              )}
            </div>
            <input ref={rightRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleImage(e.target.files[0], 'right')}/>
            <button onClick={() => rightRef.current?.click()}
              className="mt-2 w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <ImagePlus size={14}/>
              {rightImage
                ? (lang === 'si' ? 'රූපය වෙනස් කරන්න' : 'Change Image')
                : (lang === 'si' ? 'රූපය තෝරන්න' : 'Choose Image')}
            </button>
          </div>
        </div>

        {/* Save button */}
        <button onClick={handleSave} disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {saving
            ? <Loader2 size={16} className="animate-spin"/>
            : <Save size={16}/>}
          {saving
            ? (lang === 'si' ? 'සුරකිමින්...' : 'Saving...')
            : (lang === 'si' ? 'බැනරය සුරකින්න' : 'Save Banner')}
        </button>

      </div>
    </div>
  );
}