import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-100 w-full py-12 md:py-20 transition-colors border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 md:px-12 text-left">
                {/* Desktop View (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4">
                        <div className="text-2xl font-extrabold font-headline tracking-tighter text-primary">DayVisit Planner</div>
                        <p className="font-sans text-sm leading-relaxed text-slate-400 max-w-[240px]">
                            © {new Date().getFullYear()} DayVisit Planner. The ultimate one-day trip planner for Ratmalana city and beyond. Discover curated gems with ease.
                        </p>
                        <div className="flex gap-4 mt-4">
                            <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-colors">public</span>
                            <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-colors">share</span>
                            <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-colors">mail</span>
                        </div>
                    </div>

                    {/* Company Column */}
                    <div className="flex flex-col gap-5">
                        <h4 className="font-headline font-bold text-white uppercase tracking-widest text-xs">Company</h4>
                        <div className="flex flex-col gap-3">
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">About Us</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Sustainability</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Terms of Service</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Privacy Policy</a>
                        </div>
                    </div>

                    {/* Destinations Column */}
                    <div className="flex flex-col gap-5">
                        <h4 className="font-headline font-bold text-white uppercase tracking-widest text-xs">Destinations</h4>
                        <div className="flex flex-col gap-3">
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Colombo</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Galle Fort</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Kandy</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Bentota</a>
                        </div>
                    </div>

                    {/* Social Column */}
                    <div className="flex flex-col gap-5">
                        <h4 className="font-headline font-bold text-white uppercase tracking-widest text-xs">Social</h4>
                        <div className="flex flex-col gap-3">
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Instagram</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Twitter (X)</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Facebook</a>
                            <a className="font-sans text-slate-400 hover:text-white transition-colors text-sm hover:underline underline-offset-4 decoration-1" href="#">Contact Us</a>
                        </div>
                    </div>
                </div>

                {/* Mobile View (Shown only on Mobile) */}
                <div className="md:hidden flex flex-col items-center gap-8 text-center">
                    <div className="text-xl font-extrabold font-headline tracking-tighter text-primary">DayVisit Planner</div>
                    <div className="flex flex-wrap justify-center gap-6 text-sm font-sans text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                        <a href="#" className="hover:text-white transition-colors">About</a>
                    </div>
                    <div className="flex gap-6">
                        <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">public</span>
                        <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">share</span>
                        <span className="material-symbols-outlined text-slate-400 hover:text-primary transition-colors">mail</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-sans tracking-wide">
                        © {new Date().getFullYear()} DayVisit Planner | Ratmalana City
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
