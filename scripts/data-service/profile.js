import { signOut } from '../auth/auth-operations.js';
import { keys as headerKeys, values as headerValues, JWT, Organization, Profile, ProfileAttributes} from '../auth/session-keys.js';

const lang = document.querySelector('html').lang;
const origin = 'https://experienceleague.adobe.com/';
const profileUrl = 'api/profile';

let profileData = null;

async function profileAttributes () {
  if (ProfileAttributes in sessionStorage === false) {
    const res = await request(profileUrl, {
      credentials: 'include',
      headers: {
        [headerKeys.auth]: sessionStorage.getItem(JWT),
        [headerKeys.accept]: headerValues.json
      },
      method: 'OPTIONS'
    });

    if (res.ok) {
      const data = await res.json();

      sessionStorage.setItem(ProfileAttributes, JSON.stringify(data.data));
    }
  }

  return JSON.parse(sessionStorage.getItem(ProfileAttributes) || '{}');
}

async function profileMerge (arg) {
  const tmp = await adobeIMS.getProfile();

  console.log(tmp, "hello profile");

  return Object.assign({}, tmp, arg, {avatarUrl: adobeIMS.avatarUrl(tmp.userId)});
}

export async function profile (reuse = false, cstream = true, explicit = false) {
  let result = null;

  if (reuse === false) {
    const data = await adobeIMS.getProfile();

    if (data !== null) {
      if (sessionStorage.getItem(JWT) === null) {
        await JWTTokenUrl(data);
      }

      if (profileData === null || explicit) {
        log('Retrieving Experience League profile');
        const res = await request(`${origin}${profileUrl}=?${lang}`, {
          credentials: 'include',
          headers: {
            [headerKeys.auth]: sessionStorage.getItem(JWT),
            [headerKeys.accept]: headerValues.json
          }
        });

        if (res.ok && res.status === 200) {
          const arg = await res.json();

          result = await profileMerge(arg.data);
          profileData = clone(result);

          if (cstream) {
            // createStream();
          }
        } else {
          signOut();
        }
      } else {
        result = clone(profileData);
      }
    } else {
      signOut();
    }
  } else {
    result = clone(profileData);
  }

  if (result !== null) {
    if (Reflect.ownKeys(meta).length === 0) {
      meta = await profileAttributes();
    }

    const keys = ['industryInterests', 'role'],
      complete = Math.ceil(keys.filter(k => result[k].length > 0).length / keys.length * 100);

    sessionStorage.setItem(Ready, complete === 100);
    sessionStorage.setItem(Organization, result.org || '');
    sessionStorage.setItem(Profile, JSON.stringify(result));
    // localStorage.setItem(SolutionLevel, result.level.join(','));
    // localStorage.setItem(SolutionRole, result.role.join(','));
  }

  return result;
}