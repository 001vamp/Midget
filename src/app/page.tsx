import MusicCard from './MusicCard';
import QueueCard from './QueueCard';
import Qcovers from './Qcovers';

export default function Home() {
  return (
    //bg + base
    <div className="flex items-center justify-center min-h-screen bg-[url('https://media1.tenor.com/m/uDVl2mD3ZI8AAAAd/bocchi-the-rock.gif')] bg-cover bg-center ">

      <MusicCard />
      <QueueCard />
    </div>
  );
}
