interface User {
  _id: string;
  name: string;
  email: string;
  activeRole: 'homeowner' | 'contractor' | null;
  // Add other properties as needed
}

export type { User };
