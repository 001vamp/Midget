export default function MusicCard() {



  return (<div id="card">
    {/* card */}
    <div className="bg-slate-900/75 w-48 h-60 rounded-xl shadow-lg backdrop-blur-xs flex flex-col items-center relative">

      <div id="coverCard1" className=" bg-[url('https://media.pitchfork.com/photos/682ca1b181b971ad1da2139a/master/w_1280%2Cc_limit/skaiwater-pinkPrint.jpeg')] bg-contain bg-center w-40 h-40
          rounded-md mt-4 mb-2"></div>


      {/* Progress Bar */}
      {/*  <div className="w-30 h-2 bg-gray-700 rounded mb-2">
            <div className="h-2 bg-blue-400 rounded"></div> <h6 className="text-white text-[9px] font-light text-center ">00:00</h6>
          </div> */}

      {/* Song Title - Artist - Album/Playlist for bar 
          <div className="flex flex-col ">
            <div className="text-white text-md font-semibold">use me</div>
            <div className="text-gray-400 text-xs font-light mb-1">skaiwater </div>
          </div> */}

      {/* Song Title - Artist - Album/Playlist for non bar */}
      <div className="flex flex-col items-start absolute bottom-5 left-4">
        <div className="text-white text-md font-mono font-[650]">use me</div>
        <div className="text-transparent text-xs font-light bg-linear-to-r from-zinc-50 to-neutral-950 bg-clip-text">skaiwater</div>
      </div>

    </div>
  </div>
  );
}