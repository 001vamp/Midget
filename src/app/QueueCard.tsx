import Qcovers from './Qcovers';

export default function QueueCard() {



  return (<div id="card">
    {/* card */}
    <div className="bg-zinc-900/45 w-48 h-60 rounded-xl shadow-lg backdrop-blur-xs flex flex-col items-center">
      <Qcovers />

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
        <div className="text-white text-md font-semibold">Hells</div>
        <div className="text-transparent text-xs font-light bg-linear-to-r from-zinc-50 to-neutral-950 bg-clip-text">skaiwater</div>
      </div>

    </div>
  </div>
  );
}