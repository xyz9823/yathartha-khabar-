import React, { useState } from 'react';
import { Article } from '../types/news';
import { MapPin, ChevronRight, Layers, Building } from 'lucide-react';

interface NepalLiveProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

interface ProvinceData {
  id: string;
  name: string;
  nepaliName: string;
  districts: string[];
  headquarters: string;
}

const PROVINCES: ProvinceData[] = [
  {
    id: 'bagmati',
    name: 'Bagmati Province',
    nepaliName: 'बागमती प्रदेश',
    headquarters: 'Hetauda',
    districts: ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Chitwan', 'Makwanpur', 'Kavrepalanchok', 'Dhading', 'Nuwakot', 'Sindhupalchok']
  },
  {
    id: 'gandaki',
    name: 'Gandaki Province',
    nepaliName: 'गण्डकी प्रदेश',
    headquarters: 'Pokhara',
    districts: ['Kaski', 'Pokhara', 'Tanahun', 'Gorkha', 'Lamjung', 'Syngja', 'Manang', 'Mustang', 'Myagdi', 'Parbat', 'Baglung']
  },
  {
    id: 'koshi',
    name: 'Koshi Province (Province 1)',
    nepaliName: 'कोशी प्रदेश',
    headquarters: 'Biratnagar',
    districts: ['Morang', 'Jhapa', 'Sunsari', 'Ilam', 'Udayapur', 'Dhankuta', 'Bhojpur', 'Sankhuwasabha', 'Taplejung', 'Solukhumbu']
  },
  {
    id: 'madhesh',
    name: 'Madhesh Province',
    nepaliName: 'मधेश प्रदेश',
    headquarters: 'Janakpur',
    districts: ['Dhanusha', 'Janakpur', 'Parsa', 'Birgunj', 'Bara', 'Rautahat', 'Sarlahi', 'Mahottari', 'Siraha', 'Saptari']
  },
  {
    id: 'lumbini',
    name: 'Lumbini Province',
    nepaliName: 'लुम्बिनी प्रदेश',
    headquarters: 'Deukhuri / Butwal',
    districts: ['Rupandehi', 'Butwal', 'Bhairahawa', 'Kapilvastu', 'Dang', 'Banke', 'Nepalgunj', 'Bardiya', 'Palpa', 'Gulmi', 'Arghakhanchi']
  },
  {
    id: 'karnali',
    name: 'Karnali Province',
    nepaliName: 'कर्णाली प्रदेश',
    headquarters: 'Birendranagar / Surkhet',
    districts: ['Surkhet', 'Dailekh', 'Jumla', 'Kalikot', 'Mugu', 'Humla', 'Dolpa', 'Rukum West', 'Salyan', 'Jajarkot']
  },
  {
    id: 'sudurpashchim',
    name: 'Sudurpashchim Province',
    nepaliName: 'सुदूरपश्चिम प्रदेश',
    headquarters: 'Godawari / Dhangadhi',
    districts: ['Kailali', 'Dhangadhi', 'Kanchanpur', 'Dadeldhura', 'Baitadi', 'Darchula', 'Doti', 'Achham', 'Bajhang', 'Bajura']
  }
];

export const NepalLive: React.FC<NepalLiveProps> = ({
  articles,
  onSelectArticle
}) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('bagmati');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const selectedProvince = PROVINCES.find(p => p.id === selectedProvinceId) || PROVINCES[0];

  // Filter articles based on province and optional district
  const filteredArticles = articles.filter(art => {
    const text = `${art.title} ${art.summary} ${art.content} ${(art.tags || []).join(' ')}`.toLowerCase();

    if (selectedDistrict) {
      return text.includes(selectedDistrict.toLowerCase());
    }

    // Check if any district in the province is mentioned
    return selectedProvince.districts.some(d => text.includes(d.toLowerCase())) ||
      text.includes(selectedProvince.name.toLowerCase()) ||
      text.includes(selectedProvince.nepaliName);
  });

  return (
    <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 my-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700 mb-1">
            <Building className="w-4 h-4 text-red-700" />
            <span>Provincial & Local Reporting</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-slate-950">
            Nepal Live (नेपाल लाईभ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real news hierarchy: 7 Federal Provinces → Municipal Districts → Local Field Dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>7 Provinces • 77 Districts</span>
        </div>
      </div>

      {/* 7 Province Tab Selectors */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-4 border-b border-slate-100">
        {PROVINCES.map(prov => {
          const isSelected = selectedProvinceId === prov.id;
          return (
            <button
              key={prov.id}
              onClick={() => {
                setSelectedProvinceId(prov.id);
                setSelectedDistrict(null); // Reset district filter
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{prov.name}</span>
              <span className="text-[11px] opacity-75 font-normal">({prov.nepaliName})</span>
            </button>
          );
        })}
      </div>

      {/* District Filter Chips inside Selected Province */}
      <div className="pt-4 pb-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter by District / Municipality:</span>
          {selectedDistrict && (
            <button
              onClick={() => setSelectedDistrict(null)}
              className="text-red-700 font-bold ml-2 underline hover:text-red-800"
            >
              Clear filter ({selectedDistrict})
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedDistrict(null)}
            className={`px-2.5 py-1 rounded text-xs transition-colors ${
              selectedDistrict === null
                ? 'bg-red-700 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All {selectedProvince.name}
          </button>
          {selectedProvince.districts.map(d => {
            const isDistActive = selectedDistrict === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDistrict(d)}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  isDistActive
                    ? 'bg-red-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered Articles Grid */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>
              {selectedDistrict ? `${selectedDistrict} Local News` : `${selectedProvince.name} Coverage`}
            </span>
            <span className="text-xs font-mono font-normal text-slate-400">
              ({filteredArticles.length} {filteredArticles.length === 1 ? 'story' : 'stories'})
            </span>
          </h3>
          <span className="text-xs text-slate-500">
            Source-supported municipal reporting
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
            <p className="text-sm font-semibold">
              No recent dispatches matching {selectedDistrict || selectedProvince.name}.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Field reports from local authorized correspondents will automatically appear here when confirmed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredArticles.map(art => (
              <article
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="group flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-slate-100 relative">
                  <img
                    src={art.image_url}
                    alt={art.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                    {art.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1.5 font-medium">
                      <span className="text-red-700 font-bold">{art.primarySource}</span>
                      <span>•</span>
                      <span>{new Date(art.published_at).toLocaleDateString()}</span>
                    </div>

                    <h4 className="font-serif text-base font-bold text-slate-900 group-hover:text-red-800 transition-colors leading-snug line-clamp-2 mb-2">
                      {art.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans">
                      {art.summary}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Verified Dispatch</span>
                    <span className="inline-flex items-center gap-1 text-slate-700 font-semibold group-hover:text-red-700">
                      Read <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
