export function urlEntrarSeguridad() {
  const local = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const base = (process.env.REACT_APP_SEGURIDAD_URL ||
    (local ? 'http://localhost:3002/estudios-seguridad' : '/estudios-seguridad')).replace(/\/+$/, '');
  // El fragmento no se envía al servidor ni aparece en el Referer.
  const token = localStorage.getItem('token');
  return token ? `${base}/#econfia_token=${encodeURIComponent(token)}` : `${base}/`;
}
