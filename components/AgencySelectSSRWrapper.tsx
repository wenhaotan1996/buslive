import { getAllAgencies } from '@/lib/routes';
import AgencySelect from './AgencySelect';

type Props = {};

export default async function AgencySelectSSRWrapper({}: Props) {
  const agencies = await getAllAgencies();

  return <AgencySelect agencies={agencies}></AgencySelect>;
}
