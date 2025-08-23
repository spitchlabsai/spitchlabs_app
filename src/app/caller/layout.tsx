import { headers } from 'next/headers';
import { APP_CONFIG_DEFAULTS } from '@/app-config';
// import { ApplyThemeScript, ThemeToggle } from '@/components/theme-toggle';
import { getAppConfig } from '@/lib/utils';
import './../globals.css';


// interface RootLayoutProps {
  // children: React.ReactNode;
// }

export default async function RootLayout({ children }) {
  // const hdrs = await headers();
  // const { accent, accentDark, pageTitle, pageDescription } = await getAppConfig(hdrs);

 

  return (
      <>
        {/* <meta name="description" content={pageDescription} /> */}
        {/* <ApplyThemeScript /> */}
      {/* <body
      > */}
        {children}
        {/* <div className="group fixed bottom-0 left-1/2 z-50 mb-2 -translate-x-1/2"> */}
          {/* <ThemeToggle className="translate-y-20 transition-transform delay-150 duration-300 group-hover:translate-y-0" /> */}
        {/* </div> */}
      {/* </body> */}
      </>
  
  );
}
