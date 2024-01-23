'use client';
import { usePathname } from 'next/navigation';
import { ReactNode, createContext, useState } from 'react';

export const AgencyContext = createContext({
  agency: '',
  setAgency: (...args: any[]) => {},
});

export default function AgencyContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathName = usePathname();
  const pathSections = pathName.split('/').filter((s) => s);
  const [agency, setAgency] = useState(
    pathSections.length >= 2 ? pathSections[1] : 'sfmta-cis'
  );
  return (
    <AgencyContext.Provider
      value={{
        agency,
        setAgency,
      }}>
      {children}
    </AgencyContext.Provider>
  );
}
