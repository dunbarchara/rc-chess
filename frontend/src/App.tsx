import Home from './Home';
import Join from './Join';

export default function App() {
  const team = /^\/join\/(white|black)$/.exec(window.location.pathname)?.[1];
  return team ? <Join team={team} /> : <Home />;
}
