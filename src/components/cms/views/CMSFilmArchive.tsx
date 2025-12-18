import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Film, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { get, set } from '../../../utils/kvStore';
import { CMSPageLayout } from '../CMSPageLayout';
import { Button } from '../../ui/button';

interface FilmItem {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  featured: boolean;
  publishDate: string;
}

const MOCK_FILMS: FilmItem[] = [
  {
    id: 1,
    title: 'Riverside Living',
    description: 'Cinematic tour of our finest riverside properties.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600596542815-225ef65aa418?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=example',
    featured: true,
    publishDate: '2024-01-15',
  },
  {
    id: 2,
    title: 'The Heritage Collection',
    description: 'Exploring historical homes in Richmond.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    featured: false,
    publishDate: '2024-02-01',
  }
];

const KV_KEY = 'films_archive';

export function CMSFilmArchive() {
  const [films, setFilms] = useState<FilmItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFilm, setCurrentFilm] = useState<Partial<FilmItem>>({});

  useEffect(() => {
    loadFilms();
  }, []);

  const loadFilms = async () => {
    try {
      const data = await get<FilmItem[]>(KV_KEY);
      if (data) {
        setFilms(data);
      } else {
        setFilms(MOCK_FILMS); // Fallback to mock if empty
      }
    } catch (error) {
      console.error('Failed to load films', error);
      setFilms(MOCK_FILMS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFilms = async (newFilms: FilmItem[]) => {
    setFilms(newFilms);
    try {
      await set(KV_KEY, newFilms);
    } catch (error) {
      toast.error('Failed to save to database');
    }
  };

  const handleDelete = async (id: number) => {
    const newFilms = films.filter(f => f.id !== id);
    await saveFilms(newFilms);
    toast.success('Film removed successfully');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    let newFilms: FilmItem[];
    
    if (currentFilm.id) {
      newFilms = films.map(f => f.id === currentFilm.id ? currentFilm as FilmItem : f);
      toast.success('Film updated');
    } else {
      const newFilm = {
        ...currentFilm,
        id: Date.now(),
        publishDate: new Date().toISOString().split('T')[0],
        featured: currentFilm.featured || false,
      } as FilmItem;
      newFilms = [...films, newFilm];
      toast.success('Film created');
    }
    
    await saveFilms(newFilms);
    setIsEditing(false);
    setCurrentFilm({});
  };

  if (isEditing) {
    return (
      <CMSPageLayout 
        title={currentFilm.id ? 'Edit Film' : 'Add New Film'} 
        description="Manage film details and video links."
      >
        <div className="space-y-6 font-sans">
          <div className="flex justify-end">
             <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>

          <form onSubmit={handleSave} className="max-w-2xl bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={currentFilm.title || ''}
                onChange={e => setCurrentFilm({...currentFilm, title: e.target.value})}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                required
                value={currentFilm.description || ''}
                onChange={e => setCurrentFilm({...currentFilm, description: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Thumbnail URL</label>
                <input
                  type="url"
                  required
                  value={currentFilm.thumbnailUrl || ''}
                  onChange={e => setCurrentFilm({...currentFilm, thumbnailUrl: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Video URL (YouTube/Vimeo)</label>
                <input
                  type="url"
                  required
                  value={currentFilm.videoUrl || ''}
                  onChange={e => setCurrentFilm({...currentFilm, videoUrl: e.target.value})}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured"
                checked={currentFilm.featured || false}
                onChange={e => setCurrentFilm({...currentFilm, featured: e.target.checked})}
                className="rounded border-gray-300 text-[#1A2551] focus:ring-[#1A2551]"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">Feature this film on home page</label>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" className="bg-[#1A2551] text-white hover:bg-[#1A2551]/90">
                Save Film
              </Button>
            </div>
          </form>
        </div>
      </CMSPageLayout>
    );
  }

  return (
    <CMSPageLayout 
      title="Film Archive" 
      description="Manage your property films and cinematic tours."
      action={{ label: "Add Film", icon: Plus, onClick: () => { setCurrentFilm({}); setIsEditing(true); } }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {films.map((film) => (
          <div key={film.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="relative aspect-video bg-gray-100">
              <img src={film.thumbnailUrl} alt={film.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Film className="w-8 h-8 text-white" />
              </div>
              {film.featured && (
                <span className="absolute top-3 left-3 bg-[#C5A059] text-white text-xs font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-medium text-[#1A2551] mb-2">{film.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{film.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">{film.publishDate}</span>
                <div className="flex gap-2">
                   <button onClick={() => { setCurrentFilm(film); setIsEditing(true); }} className="p-2 text-gray-400 hover:text-[#1A2551] hover:bg-gray-50 rounded-full transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(film.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CMSPageLayout>
  );
}