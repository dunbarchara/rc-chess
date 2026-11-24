import Home from './Home';
import Join from './Join';

// Minimal path-based routing; swap for a router library if the app grows.
export default function App() {
  const match = /^\/join\/(white|black)\/?$/.exec(window.location.pathname);
  if (match) return <Join team={match[1] as 'white' | 'black'} />;
  return <Home />;
}
