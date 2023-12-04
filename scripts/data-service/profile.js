import { csrf } from '../auth/csrf.js';
import { JWT, Profile} from '../auth/session-keys.js';
import { request } from '../request.js';
import { JWTTokenUrl } from '../urls.js';

const lang = document.querySelector('html').lang;
const origin = 'https://experienceleague.adobe.com/';
const profileUrl = 'api/profile';

let profileData = null;

export async function updateProfile (key = false) {

  const res = await request(`${origin}${profileUrl}=?${lang}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      authorization: sessionStorage.getItem(JWT),
      accept: 'application/json',
      'content-type': 'application/json-patch+json',
      'x-csrf-token': await csrf(JWTTokenUrl)
    },
    body: JSON.stringify([{op: 'replace', path: `/${key}`, value: data[key]}])
  });

  if (res.ok && res.status < 400) {
    const arg = await res.json();

    profileData = await profileMerge(arg.data);
    // await profile(true);
    sessionStorage.setItem(Profile, JSON.stringify(profileData));
  }

  return profileData;
}