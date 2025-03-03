import Cookies from 'js-cookie';

export function deleteCookie(name: string) {
  Cookies.remove(name);
} 