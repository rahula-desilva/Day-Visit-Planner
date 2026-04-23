import heroImage from "../../assets/hero beach.jpg";
function Hero() {
  return (
    <section className="relative h-[870px] w-full overflow-hidden">
      <div className="absolute inset-0 z-0 text-white">
        <img 
          className="w-full h-full object-cover" 
          alt={"Ratmalana beach day trip"} 
          src={heroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-12 flex flex-col justify-center">
        <div className="max-w-2xl">
          <h1 className="font-headline text-white text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              Plan the Perfect Day Trip in Ratmalana
          </h1>
          <p className="text-white/90 text-xl font-medium mb-8">
            Discover curated destinations across Sri Lanka <br /> starting from Ratmalana and expanding islandwide.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;