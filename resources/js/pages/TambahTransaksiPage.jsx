import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function TambahTransaksiPage({ onNavigate }) {
    const [tipe, setTipe] = useState('Pemasukan');

    const handleTipeChange = (newTipe) => {
        setTipe(newTipe);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would normally save the data, then navigate back
        onNavigate('transaksi');
    };

    return (
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-slate-900 font-serif mb-8">Tambah Transaksi</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipe Transaksi */}
                <div className="space-y-3">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Tipe Transaksi</label>
                    <div className="grid grid-cols-2 gap-6 max-w-lg">
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pemasukan')}
                            className={`py-3.5 px-4 rounded-md font-bold font-serif text-center transition-colors ${
                                tipe === 'Pemasukan' 
                                ? 'bg-[#509C64] text-white shadow-sm' 
                                : 'bg-[#DFDFDF] text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            Pemasukan
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTipeChange('Pengeluaran')}
                            className={`py-3.5 px-4 rounded-md font-bold font-serif text-center transition-colors ${
                                tipe === 'Pengeluaran' 
                                ? 'bg-[#EA543F] text-white shadow-sm' 
                                : 'bg-[#DFDFDF] text-slate-700 hover:bg-slate-300'
                            }`}
                        >
                            Pengeluaran
                        </button>
                    </div>
                </div>

                {/* Jumlah */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Jumlah</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-medium">Rp</span>
                        <input 
                            type="number" 
                            placeholder="0"
                            className="w-full pl-12 pr-4 py-4 rounded-md bg-[#DFDFDF] border-none text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium"
                        />
                    </div>
                </div>

                {/* Kategori */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Kategori</label>
                    <div className="relative">
                        <select className="w-full appearance-none bg-[#DFDFDF] border-none rounded-md px-4 py-4 pr-12 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] cursor-pointer">
                            {tipe === 'Pemasukan' ? (
                                <>
                                    <option>Pemasukan</option>
                                    <option>Gaji</option>
                                    <option>Bonus</option>
                                    <option>Hasil Usaha</option>
                                </>
                            ) : (
                                <>
                                    <option>Pengeluaran</option>
                                    <option>Makanan</option>
                                    <option>Transportasi</option>
                                    <option>Belanja</option>
                                    <option>Tagihan</option>
                                </>
                            )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" size={24} />
                    </div>
                </div>

                {/* Tanggal */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Tanggal</label>
                    <input 
                        type="date" 
                        defaultValue="2026-05-25"
                        className="w-full px-4 py-4 rounded-md bg-[#DFDFDF] border-none text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium"
                    />
                </div>

                {/* Deskripsi */}
                <div className="space-y-3 max-w-3xl">
                    <label className="block text-slate-900 font-bold font-serif text-lg">Deskripsi</label>
                    <textarea 
                        rows={4}
                        placeholder="Catatan tambahan..."
                        className="w-full px-4 py-4 rounded-md bg-[#DFDFDF] border-none text-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-[#5E6AD2] font-medium resize-none"
                    ></textarea>
                </div>

                {/* Submit Button */}
                <div className="pt-8 max-w-3xl">
                    <button 
                        type="submit"
                        className="w-full py-4 bg-[#5E6AD2] hover:bg-indigo-600 text-white rounded-md font-bold font-serif text-lg transition-colors shadow-sm"
                    >
                        Simpan Transaksi
                    </button>
                </div>
            </form>
        </div>
    );
}
