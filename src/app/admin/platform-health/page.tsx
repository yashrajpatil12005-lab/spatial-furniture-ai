import { redirect } from 'next/navigation';

export default function PlatformHealthRedirect() {
  redirect('/admin');
}
