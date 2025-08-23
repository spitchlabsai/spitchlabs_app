import { headers } from 'next/headers';
import { getAppConfig } from '@/lib/utils';

// interface AppLayoutProps {
//   children: React.ReactNode;
// }

export default async function AppLayout({ children }) {
  // const hdrs = await headers();

  return (
    <>
      {children}
    </>
  );
}
