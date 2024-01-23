'use client';

import { Button } from '@/components/ui/button';
import { useContext, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePathname, useRouter } from 'next/navigation';
import { AgencyContext } from '@/context/AgencyContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  agencies: Agency[];
};

export default function AgencySelect({ agencies }: Props) {
  const { agency, setAgency } = useContext(AgencyContext);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const selectedAgency = agencies.filter(({ id }) => id === agency);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] md:w-[300px] flex">
          <p className="flex-1">
            {agency && selectedAgency?.length > 0
              ? selectedAgency[0].name
              : 'Select agency...'}
          </p>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search agency..." />
          <CommandEmpty>No agency found.</CommandEmpty>
          <CommandGroup>
            <ScrollArea className="h-[500px] ">
              {agencies.map(({ id: agencyId, name }) => (
                <CommandItem
                  key={agencyId}
                  value={name}
                  onSelect={() => {
                    setAgency(agencyId);
                    setOpen(false);
                    router.push(`/routes/${agencyId}`);
                  }}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      agency === agencyId ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {name}
                </CommandItem>
              ))}
            </ScrollArea>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
