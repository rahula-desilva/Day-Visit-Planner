import { useState, useEffect } from "react";
import { fetchPlaces, addPlace, updatePlace, deletePlace, uploadPlaceImage } from "../services/placeService";

/**
 * PAGE: Admin
 * Includes Image Uploading functionality.
 */
export default function Admin() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "", category: "Nature", description: "", image_url: "",
    travel_tips: "", visit_duration_minutes: 60, latitude: 0, longitude: 0,
    opening_hours: "09:00 AM - 05:00 PM"
  });

  const [hStart, setHStart] = useState(9);
  const [mStart, setMStart] = useState(0);
  const [pStart, setPStart] = useState("AM");
  const [hEnd, setHEnd] = useState(5);
  const [mEnd, setMEnd] = useState(0);
  const [pEnd, setPEnd] = useState("PM");

  useEffect(() => { loadPlaces(); }, []);

  async function loadPlaces() {
    setLoading(true);
    const { data } = await fetchPlaces();
    setPlaces(data || []);
    setLoading(false);
  }

  const resetForm = () => {
    setEditingId(null);
    setHStart(9); setMStart(0); setPStart("AM");
    setHEnd(5); setMEnd(0); setPEnd("PM");
    setFormData({
      name: "", category: "Nature", description: "", image_url: "",
      travel_tips: "", visit_duration_minutes: 60, latitude: 0, longitude: 0,
      opening_hours: "09:00 AM - 05:00 PM"
    });
  };

  const stepTime = (type, val, isEnd = false) => {
    if (type === 'h') {
      const setter = isEnd ? setHEnd : setHStart;
      setter(prev => {
        let n = prev + val;
        return n > 12 ? 1 : n < 1 ? 12 : n;
      });
    } else {
      const setter = isEnd ? setMEnd : setMStart;
      setter(prev => {
        let n = prev + val;
        return n >= 60 ? 0 : n < 0 ? 45 : n;
      });
    }
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setFormData(place);
    if (place.opening_hours && place.opening_hours.includes('-')) {
      const [start, end] = place.opening_hours.split(' - ');
      const [sT, sP] = start.split(' ');
      const [sH, sM] = sT.split(':');
      setHStart(parseInt(sH)); setMStart(parseInt(sM)); setPStart(sP);
      const [eT, eP] = end.split(' ');
      const [eH, eM] = eT.split(':');
      setHEnd(parseInt(eH)); setMEnd(parseInt(eM)); setPEnd(eP);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const { publicUrl, error } = await uploadPlaceImage(file);
    setUploading(false);

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      setFormData({ ...formData, image_url: publicUrl });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalHours = `${hStart.toString().padStart(2, '0')}:${mStart.toString().padStart(2, '0')} ${pStart} - ${hEnd.toString().padStart(2, '0')}:${mEnd.toString().padStart(2, '0')} ${pEnd}`;
    
    const cleanData = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      image_url: formData.image_url,
      travel_tips: formData.travel_tips,
      visit_duration_minutes: formData.visit_duration_minutes,
      latitude: formData.latitude,
      longitude: formData.longitude,
      opening_hours: finalHours
    };

    const action = editingId ? updatePlace(editingId, cleanData) : addPlace(cleanData);
    const { data, error } = await action;

    if (error) {
       console.error("ADMIN DATABASE ERROR:", error);
       alert("DATABASE REJECTED: " + error.message);
    } else {
       alert(editingId ? "Changes saved! ✏️" : "New spot added! 🚀");
       resetForm();
       loadPlaces();
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-primary">Loading Dashboard...</div>;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary pl-4">Admin Dashboard</h2>
        <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Master Mode</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-xl border border-gray-50 flex flex-col gap-4 sticky top-24">
          <h3 className="font-headline font-bold text-gray-900 border-b pb-4 flex items-center gap-2">
            <span className={`material-symbols-outlined ${editingId ? 'text-amber-500' : 'text-primary'}`}>
              {editingId ? 'edit_square' : 'add_circle'}
            </span>
            {editingId ? "Edit Spot" : "Add New Spot"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder="Spot Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold" />
            
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold">
              <option value="Nature">Nature</option>
              <option value="Recreation">Recreation</option>
              <option value="Religious">Religious</option>
              <option value="Heritage">Heritage</option>
            </select>

            <textarea placeholder="Full Description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" required className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm"></textarea>
            
            <textarea placeholder="Expert Expert Tip..." value={formData.travel_tips} onChange={(e) => setFormData({...formData, travel_tips: e.target.value})} rows="2" className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-sm italic"></textarea>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Opening Hours</label>
              <div className="flex items-center justify-between gap-1">
                 <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border">
                    <div className="flex flex-col items-center">
                      <button type="button" onClick={() => stepTime('h', 1)} className="text-[10px] text-primary">▲</button>
                      <span className="text-xs font-bold">{hStart.toString().padStart(2, '0')}</span>
                      <button type="button" onClick={() => stepTime('h', -1)} className="text-[10px] text-primary">▼</button>
                    </div>
                    <span className="text-xs font-bold">:</span>
                    <div className="flex flex-col items-center">
                      <button type="button" onClick={() => stepTime('m', 15)} className="text-[10px] text-primary">▲</button>
                      <span className="text-xs font-bold">{mStart.toString().padStart(2, '0')}</span>
                      <button type="button" onClick={() => stepTime('m', -15)} className="text-[10px] text-primary">▼</button>
                    </div>
                    <button type="button" onClick={() => setPStart(pStart === 'AM' ? 'PM' : 'AM')} className="bg-primary text-white text-[9px] font-black px-1 py-1 rounded">{pStart}</button>
                 </div>
                 <span className="text-[10px] font-bold text-gray-300">to</span>
                 <div className="flex items-center gap-1 bg-gray-50 p-1.5 rounded-lg border">
                    <div className="flex flex-col items-center">
                      <button type="button" onClick={() => stepTime('h', 1, true)} className="text-[10px] text-primary">▲</button>
                      <span className="text-xs font-bold">{hEnd.toString().padStart(2, '0')}</span>
                      <button type="button" onClick={() => stepTime('h', -1, true)} className="text-[10px] text-primary">▼</button>
                    </div>
                    <span className="text-xs font-bold">:</span>
                    <div className="flex flex-col items-center">
                      <button type="button" onClick={() => stepTime('m', 15, true)} className="text-[10px] text-primary">▲</button>
                      <span className="text-xs font-bold">{mEnd.toString().padStart(2, '0')}</span>
                      <button type="button" onClick={() => stepTime('m', -15, true)} className="text-[10px] text-primary">▼</button>
                    </div>
                    <button type="button" onClick={() => setPEnd(pEnd === 'AM' ? 'PM' : 'AM')} className="bg-primary text-white text-[9px] font-black px-1 py-1 rounded">{pEnd}</button>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Latitude</label>
                 <input type="number" step="any" placeholder="Latitude" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs" />
               </div>
               <div className="flex flex-col gap-1">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Longitude</label>
                 <input type="number" step="any" placeholder="Longitude" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} className="p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs" />
               </div>
            </div>

            <div className="space-y-1">
               <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Spot Image</label>
               <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-primary/10 file:text-primary" />
               {uploading && <p className="text-[10px] text-primary font-bold">Uploading...</p>}
               <input placeholder="Image URL" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg text-xs" />
               {formData.image_url && <img src={formData.image_url} className="w-full h-20 object-cover rounded-lg mt-2" alt="Preview" />}
            </div>
            
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={resetForm} className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl text-xs active:scale-95 transition-all">Clear</button>
              <button type="submit" className="flex-[2] py-3 bg-primary text-white font-bold rounded-xl text-xs hover:opacity-90 shadow-md">
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {places.map(place => (
              <div key={place.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={place.image_url} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 bg-gray-50" />
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{place.name}</h4>
                    <span className="text-[9px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-md">{place.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(place)} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-primary hover:text-white text-[10px] font-black">Edit</button>
                  <button onClick={async () => { if(confirm("Are you sure you want to delete this place?")) { await deletePlace(place.id); loadPlaces(); } }} className="px-4 py-2 bg-gray-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white text-[10px] font-black">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
