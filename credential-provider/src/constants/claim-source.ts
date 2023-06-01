import { addYears } from '@/common/helpers';
import { User } from '@/types/User';

const adminFields: Partial<User> = {
  issuedDate: new Date().toISOString().slice(0, 10),
  expiryDate: addYears(new Date(), 5).toISOString().slice(0, 10),
};

export const users: Partial<User>[] = [
  {
    email: 'demo@jose.iglesias',
    name: 'Jose Iglesias',
    licenseNumber: 'YU2EYBX',
    ...adminFields,
  },
  {
    email: 'demo@joe.doe',
    name: 'Joe Doe',
    licenseNumber: 'MVI34NE',
    ...adminFields,
  },
];
